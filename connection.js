const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:false,
        /*{
          rejectUnauthorized: false
          },*/
    authPlugins: {
        mysql_native_password: () => () => Buffer.from(process.env.DB_PASSWORD)
    }
});

connection.connect((err) => {
    if (err) {
      console.error('Errore di connessione al database: ' + err.stack);
      return;
    }
    console.log('Connesso al database con l\'id ' + connection.threadId);
  });

module.exports = connection;