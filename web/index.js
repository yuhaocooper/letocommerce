// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import { URLSearchParams } from "url";
import {codeChallenge, state, codeVerifier} from "./code-generator.js"

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

//External
//Need to test this actual one with Shopify embedded app. Not sure how to handle getting out of the iframe, if necessary.
app.get('/etsy/auth', async(req,res)=> {
  const requestOptions = {
    'method': 'GET',
  };

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: 'w78xtl1xq777jydqitur0jh4',
    redirect_uri: `https://${process.env.hostName}/etsy/auth/callback`,
    scope: 'transactions_r%20transactions_w%20listings_d%20listings_r%20listings_w%20address_r%20address_w%20shops_w',
    state: 'superstate',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString()

  fetch('https://www.etsy.com/oauth/connect?' + params,requestOptions)
    .then((response) => {
      //handle response
      //middleware to call my etsy/auth/callback endpoint
    })
    .catch((err) => {
      console.log('Error: '+err)
    })
})

app.get('/etsy/auth/callback', async(req,res)=>{
  const authCode = req.query.code

  if (req.query.state === 'superstate'){
    //Take returned code to send to Etsy's Oauth server for access token
    const requestOptions = {
      'method': 'POST',
      'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
    };
    // @ts-ignore
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'w78xtl1xq777jydqitur0jh4',
      redirect_uri: `https://${process.env.hostName}/etsy/auth/callback`,
      code: authCode,
      code_verifier: codeVerifier,
    }).toString()

    fetch('https://www.etsy.com/oauth/token?' + params,requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data.access_token
        const refresh_token = data.refresh_token
        //store Etsy accessToken & refreshToken in DB. This was abstracted away in Shopify session, but I need a wrapper to do this for Etsy and also the other tables like Product, Orders and etc.
      })
      .catch((err) => {
        console.log('Error: '+err)
      })
  }
  if (req.query.error){
    res.send(req.query.error_description)
  }
  else {
    res.send ('Error: Unauthenticated access.')
  }
})

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
