const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetGrados = (req, res) => {
    connection.query("SELECT * FROM grados", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener grados");
        } else {
            return res.status(200).send(results);
        }
    });
}

const PostGrado = (req, res) => {
    const { Gra_Nombre, Gra_Tipo } = req.body;

    // Insertar en la tabla grados
    connection.query(
        "INSERT INTO grados (Gra_Nombre, Gra_Tipo) VALUES (?, ?)", 
        [Gra_Nombre, Gra_Tipo], 
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al crear grado");
            }

            // Obtener el ID del grado recién insertado
            const nuevoGradoId = results.insertId;

            // Consultar el grado recién creado
            connection.query(
                "SELECT * FROM grados WHERE Gra_Id = ?", 
                [nuevoGradoId], 
                (err, gradoResults) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error al obtener el grado recién creado");
                    }

                    return res.status(200).json({
                        message: "Grado creado con éxito",
                        grado: gradoResults[0], // Devuelve el grado recién creado
                    });
                }
            );
        }
    );
};


app.get("/grados", GetGrados);
app.post("/grados", PostGrado);

module.exports = app;