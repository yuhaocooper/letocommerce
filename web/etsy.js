//Etsy Middleware file

import crypto from "crypto";

// The next two functions help us generate the code challenge
// required by Etsy’s OAuth implementation.
const base64URLEncode = (str) =>
  str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest();

// We’ll use the verifier to generate the challenge.
// The verifier needs to be saved for a future step in the OAuth flow.
export const codeVerifier = base64URLEncode(crypto.randomBytes(32));

// With these functions, we can generate
// the values needed for our OAuth authorization grant.
export const codeChallenge = base64URLEncode(sha256(codeVerifier));
export const state = Math.random().toString(36).substring(7);

export function EtsyOAuth(shop) {
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
        .then()
        .catch((err) => {
          res.send('Error: '+ err)
        })
}

export function EtsyOAuthCallback(req,shop) {
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
          const expiry = data.expires_in
          const refresh_token = data.refresh_token
          //store Etsy accessToken & refreshToken in DB. This was abstracted away in Shopify session, but I need a wrapper to do this for Etsy and also the other tables like Product, Orders and etc.
        })
        .catch((err) => {
          console.log('Error: '+err)
        })
    }
    else {
        res.send(req.query.error_description) //Etsy will send an error for any errors.
    }
}

function OAuthRefresh() {

}

function storeEtsyAuth() {

}

function updateEtsyAuth() {

}
