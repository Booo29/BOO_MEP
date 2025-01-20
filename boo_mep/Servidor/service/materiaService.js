const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetMaterias = (req, res) => {
    connection.query("SELECT * FROM materias WHERE Mat_Estado = 'A'", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener materias");
        } else {
            return res.status(200).json(results);
        }
    });
}

const PostMateria = (req, res) => {
    const { nombre } = req.body;

    if (nombre) {
        connection.query("INSERT INTO materias SET ?", [{ Mat_Nombre: nombre }], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al insertar materia");
            } else {
                return res.status(200).send("Materia insertada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const PutMateria = (req, res) => {
    const { nombre, idMateria } = req.body;

    if (nombre && idMateria) {
        connection.query("UPDATE materias SET ? WHERE Mat_Id = ?", [{ Mat_Nombre: nombre }, idMateria], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar materia");
            } else {
                return res.status(200).send("Materia actualizada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteMateria = (req, res) => {
    const { idMateria } = req.params;

    if (idMateria) {
        connection.query("UPDATE materias SET Mat_Estado = 'I' WHERE Mat_Id = ?", [idMateria], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar materia");
            } else {
                return res.status(200).send("Materia eliminada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

app.get("/materia", GetMaterias);
app.post("/materia", PostMateria);
app.put("/materia", PutMateria);
app.delete("/materia/:idMateria", DeleteMateria);

module.exports = app;