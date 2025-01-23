const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetSecciones = (req, res) => {
    connection.query("SELECT * FROM secciones", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener secciones");
        } else {
            return res.status(200).send(results);
        }
    });
}

const PostSeccion = (req, res) => {
    const { nombre, grado } = req.body;
    connection.query("INSERT INTO secciones (Sec_Nombre, Gra_Id) VALUES (?, ?)", [nombre, grado], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al crear sección");
        } else {
            return res.status(200).send("Sección creada");
        }
    });
}

app.get("/secciones", GetSecciones);
app.post("/secciones", PostSeccion);

module.exports = app;