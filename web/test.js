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

//Connect
db.connect(function(err) {
if(err) throw err;
console.log("Connected!")
console.log('connected as id ' + db.threadId)
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