const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetCronicas = (req, res) => {

    const { cicloId } = req.params;

    connection.query("SELECT Cro_Id AS id, Cro_Fecha AS fecha, Cro_Descripcion AS descripcion, Ciclo_Cic_Id AS CicloId FROM cronicas WHERE Ciclo_Cic_Id = ? AND Cro_Estado = 'A'", [cicloId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener cronicas");
        } else {
            return res.status(200).json(results);
        }
    });


}

const PostCronica = (req, res) => {
    const { cicloId, descripcion, fecha } = req.body;

    if (cicloId && descripcion && fecha) {
        connection.query("INSERT INTO cronicas SET ?", [{ Cro_Fecha: fecha, Cro_Descripcion: descripcion, Ciclo_Cic_Id: cicloId, }], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al crear cronica");
            } else {
                return res.status(200).send("Cronica creada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const PutCronica = (req, res) => {
    const { cronicaId } = req.params;
    const { descripcion, fecha } = req.body;

    if (descripcion && fecha) {
        connection.query("UPDATE cronicas SET Cro_Descripcion = ?, Cro_Fecha = ? WHERE Cro_Id = ?", [descripcion, fecha, cronicaId], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar cronica");
            } else {
                return res.status(200).send("Cronica actualizada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteCronica = (req, res) => {
    const { cronicaId } = req.params;

    connection.query("UPDATE cronicas SET Cro_Estado = 'I' WHERE Cro_Id = ?", [cronicaId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al eliminar cronica");
        } else {
            return res.status(200).send("Cronica eliminada");
        }
    });
}

app.get("/cronicas/:cicloId", GetCronicas);
app.post("/cronica", PostCronica);
app.put("/cronica/:cronicaId", PutCronica);
app.delete("/cronica/:cronicaId", DeleteCronica);

module.exports = app;
