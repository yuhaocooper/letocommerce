import dotenv from "dotenv"
import mysql from "mysql2"

dotenv.config({
  path: "./.env",
});

//Db config
const db = mysql.createConnection({
    host: process.env.dbUrl,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: "testSchema",
  })

//Etsy session table: shop, access_token, expiry (now+expires_in), refresh_token

function QueryEtsyAuth(shop){
    const now = Date.now()
    db.connect(function(err) {
        if(err) throw err; //How can I make it so that the server will auto restart when it runs into an error instead of entirely stopping??
        console.log("Connected!")
        })
    db.query(
        `SELECT * FROM etsy_sessions WHERE shop ='${shop}'`,
        function(err, results, fields) {
            if (err) throw err;
            if (results[0].length == 0) {
                return false
            }
            if (results[0].expiry > now){
                return 'Expired'
            }
            return true
        }
    )
}

function QueryEtsyRefresh(shop){
    const now = Date.now()
    db.connect(function(err) {
        if(err) throw err; //How can I make it so that the server will auto restart when it runs into an error instead of entirely stopping??
        console.log("Connected!")
        })
    db.query(
        `SELECT * FROM etsy_sessions WHERE shop ='${shop}'`,
        function(err, results, fields) {
            if (err) throw err;
            console.log(results[0].refresh_token)
            return results[0].refresh_token
        }
    )
}

function StoreEtsyAuth(shop, accessToken, expiry, refresh_token){
    db.connect(function(err) {
        if(err) throw err; //How can I make it so that the server will auto restart when it runs into an error instead of entirely stopping??
        console.log("Connected!")
    })
    db.query(
        `INSERT INTO etsy_sessions (shop, access_token, expiry, refresh_token) VALUES (${shop},${accessToken},${expiry},${refresh_token})`,
        function(err, results, fields) {
            if (err) throw err;
            console.log(results)
            return "Record entered: " + results
        }
    )
}

function UpdateEtsyAuth(shop, accessToken, expiry, refresh_token){
    db.connect(function(err) {
        if(err) throw err; //How can I make it so that the server will auto restart when it runs into an error instead of entirely stopping??
        console.log("Connected!")
    })
    db.query(
        `UPDATE etsy_sessions (shop, access_token, expiry, refresh_token) SET access_token=${accessToken}, expiry=${expiry}, refresh_token=${refresh_token}) WHERE shop = ${shop}`,
        function(err, results, fields) {
            if (err) throw err;
            console.log(results)
            return "Record entered: " + results
        }
    )
}

//Connect
db.connect(function(err) {
if(err) throw err;
console.log("Connected!")
})

//Select
db.query(
'SELECT * FROM `shopify_sessions`',
function(err, results, fields) {
    console.log(results); // results contains rows returned by server
    return
}
);

/*
//Insert
db.query(
    "INSERT INTO shopify_sessions (id, shop, state, isOnline, scope, expires, onlineAccessInfo, accessToken) VALUES ('1','test','1','1','test','1','test','1')",
    function(err, results, fields) {
        if (err) throw err;
        console.log("1 record inserted")
        return
    }
    );

//Delete
db.connect(function(err) {
    if (err) throw err;
    var sql = "DELETE FROM shopify_sessions WHERE id = '1'";
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records deleted: " + result.affectedRows);
    });
    });

//Update
db.connect(function(err) {
  if (err) throw err;
  var sql = "UPDATE customers SET address = 'Canyon 123' WHERE address = 'Valley 345'";
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
});


*/