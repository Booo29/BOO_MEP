const dotenv = require("dotenv");
dotenv.config();

const mysql = require('mysql');

try {
    exports.connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'una',
        database: 'boo_mep',
        multipleStatements: true
    });
    console.log("conexión exitosa con la db" );
} catch (error) {
    console.log("Error al conectar con la base de datos");
}
