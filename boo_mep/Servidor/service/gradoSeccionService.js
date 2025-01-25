const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetGradoSecciones = (req, res) => {
    const { cicloId, institucionId } = req.query;

    if (!cicloId || !institucionId) {
        return res.status(400).send("Por favor, proporciona los parámetros cicloId e institucionId.");
    }

    const query = `
        SELECT 
            gs.Gra_Sec_Nombre, 
            g.Gra_Nombre,
            gs.Id_Grado_Seccion
        FROM 
            grado_seccion gs
        INNER JOIN 
            ciclo c ON gs.Ciclo_Cic_Id = c.Cic_Id
        INNER JOIN 
            instituciones i ON c.Instituciones_idInstituciones = i.Inst_Id
        INNER JOIN 
            grados g ON gs.Grados_idGrados = g.Gra_Id
        WHERE 
            c.Cic_Id = ? AND 
            i.Inst_Id = ?
    `;

    connection.query(query, [cicloId, institucionId], (err, results) => {
        if (err) {
            console.error("Error al obtener la información:", err);
            return res.status(500).send("Error al obtener la información de grado_seccion.");
        }

        if (results.length === 0) {
            return res.status(404).send("No se encontraron datos para el ciclo e institución especificados.");
        }

        return res.status(200).json(results);
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
