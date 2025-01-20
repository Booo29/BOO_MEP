const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetCiclos = (req, res) => {
    const { idInstitucion } = req.params;

    connection.query("SELECT * FROM ciclo WHERE Cic_Estado = 'A' AND Instituciones_idInstituciones = ?",[idInstitucion], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener ciclos");
        } else {
            return res.status(200).json(results);
        }
    });
}

const PostCiclo = (req, res) => {
    const { fechaInicio, fechaFin, idInstitucion } = req.body;

    if (fechaInicio && fechaFin && idInstitucion) {
        connection.query("INSERT INTO ciclo SET ?", [{Cic_Fecha_Inicio: fechaInicio, Cic_Fecha_Fin: fechaFin, Instituciones_idInstituciones: idInstitucion }], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al insertar ciclo");
            } else {
                return res.status(200).send("Ciclo insertado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const PutCiclo = (req, res) => {
    const {fechaInicio, fechaFin, idCiclo } = req.body;

    if (fechaInicio && fechaFin &&  idCiclo) {
        connection.query("UPDATE ciclo SET ? WHERE Cic_Id = ?", [{Cic_Fecha_Inicio: fechaInicio, Cic_Fecha_Fin: fechaFin, }, idCiclo], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar ciclo");
            } else {
                return res.status(200).send("Ciclo actualizado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteCiclo = (req, res) => {
    const { idCiclo } = req.params;

    if (idCiclo) {
        connection.query("UPDATE ciclo SET Cic_Estado = 'I' WHERE Cic_Id = ?", [idCiclo], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar ciclo");
            } else {
                return res.status(200).send("Ciclo eliminado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

app.get("/ciclo/:idInstitucion", GetCiclos);
app.post("/ciclo", PostCiclo);
app.put("/ciclo", PutCiclo);
app.delete("/ciclo/:idCiclo", DeleteCiclo);

module.exports = app;