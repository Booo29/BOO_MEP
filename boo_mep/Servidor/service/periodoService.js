const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetPeriodos = (req, res) => {
    const { idCiclo } = req.params;

    connection.query("SELECT * FROM periodo WHERE Per_Estado = 'A' AND Ciclo_idCiclo = ?", [idCiclo], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener periodos");
        } else {
            return res.status(200).json(results);
        }
    });
}

const GetPeriodo = (req, res) => {
    const { idPeriodo } = req.params;

    connection.query("SELECT * FROM periodo WHERE Per_Id = ? AND Per_Estado = 'A'", [idPeriodo], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener periodo");
        } if(results.length > 0) {
            return res.status(200).json(results[0]);
        }else {
            return res.status(404).json({ message: "Periodo no encontrado" });
        }
    });
}

const PostPeriodo = (req, res) => {
    const { nombre, idCiclo } = req.body;

    if (nombre && idCiclo) {
        const query = "INSERT INTO periodo SET ?";
        const values = {
            Per_Nombre: nombre,
            Ciclo_idCiclo: idCiclo
        };

        connection.query(query, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al insertar periodo");
            } else {
                return res.status(200).send("Periodo insertado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const PutPeriodo = (req, res) => {
    const { idPeriodo } = req.params;
    const { nombre } = req.body;

    if (nombre) {
        const query = "UPDATE periodo SET Per_Nombre = ? WHERE Per_Id = ?";
        const values = [nombre, idPeriodo];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar periodo");
            } else {
                return res.status(200).send("Periodo actualizado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeletePeriodo = (req, res) => {
    const { idPeriodo } = req.params;

    connection.query("UPDATE periodo SET Per_Estado = 'I' WHERE Per_Id = ? ", [idPeriodo], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al eliminar periodo");
        } else {
            return res.status(200).send("Periodo eliminado");
        }
    });
}

app.get("/periodos/:idCiclo", GetPeriodos);
app.get("/periodo/:idPeriodo", GetPeriodo);
app.post("/periodo", PostPeriodo);
app.put("/periodo/:idPeriodo", PutPeriodo);
app.delete("/periodo/:idPeriodo", DeletePeriodo);

module.exports = app;