const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetGradoSecciones = (req, res) => {
    connection.query("SELECT * FROM grado_seccion", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener grado_seccion");
        } else {
            return res.status(200).send(results);
        }
    });
}

const PostGradoSecciones = (req, res) => {
    const datos = req.body; // Los datos se envían desde el cliente en formato JSON

    // Verificar si es un arreglo o un único objeto
    if (!Array.isArray(datos)) {
        // Convertir a un arreglo si es un único objeto
        datos = [datos];
    }

    // Preparar el query y los valores
    const query = "INSERT INTO grado_seccion (Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id) VALUES ?";
    const valores = datos.map(dato => [
        dato.Gra_Sec_Nombre,
        dato.Grados_idGrados,
        dato.Ciclo_Cic_Id,
    ]);

    // Ejecutar la consulta
    connection.query(query, [valores], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al guardar los datos en grado_seccion");
        } else {
            return res.status(200).send({
                message: "Datos guardados correctamente",
                affectedRows: results.affectedRows,
            });
        }
    });
};


app.get("/grado_secciones", GetGradoSecciones);
app.post("/grado_secciones", PostGradoSecciones);

module.exports = app;
