const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const PostMateriaGradoSeccion = (req, res) => {
    const { data } = req.body; // `data` puede ser un array de objetos o un solo objeto

    // Si el usuario envía un solo objeto, lo convertimos en un array
    const rows = Array.isArray(data) ? data : [data];

    // Crear un array de valores para el query
    const values = rows.map(row => [
        row.Grado_Seccion_Id_Grado_Seccion,
        row.Materias_Mat_Id,
        row.Instituciones_Inst_Id
    ]);

    // Iniciar la conexión para la transacción
    connection.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción");
        }

        // Query para insertar múltiples filas
        const query = `
            INSERT INTO Materia_grado_seccion 
            (Grado_Seccion_Id_Grado_Seccion, Materias_Mat_Id, Instituciones_Inst_Id) 
            VALUES ?
        `;

        connection.query(query, [values], (err, results) => {
            if (err) {
                console.error("Error al insertar datos en Materia_grado_seccion:", err);

                // Si hay un error, hacemos rollback para deshacer cualquier cambio
                return connection.rollback(() => {
                    return res.status(500).send("Error al insertar datos en Materia_grado_seccion");
                });
            }

            // Si todo sale bien, hacemos commit para confirmar los cambios
            connection.commit(err => {
                if (err) {
                    console.error("Error al confirmar la transacción:", err);

                    // Si hay un error en el commit, hacemos rollback
                    return connection.rollback(() => {
                        return res.status(500).send("Error al confirmar la transacción");
                    });
                }

                // Respuesta exitosa
                return res.status(200).json({
                    message: "Datos insertados correctamente en Materia_grado_seccion",
                    affectedRows: results.affectedRows, // Número de filas insertadas
                });
            });
        });
    });
};

const GetGradosYMateriaGradoSeccion = (req, res) => {
    const { CicloId } = req.params;

    if (!CicloId) {
        return res.status(400).send("El parámetro CicloId es requerido.");
    }

    const query = `
       SELECT 
            g.Gra_Nombre AS grado_nombre,
            mgs.Mat_gra_sec_Id AS materia_grado_seccion_id
        FROM 
            materia_grado_seccion mgs
        INNER JOIN 
            grado_seccion gs ON mgs.Grado_Seccion_Id_Grado_Seccion = gs.Id_Grado_Seccion
        INNER JOIN 
            grados g ON gs.Grados_idGrados = g.Gra_Id
        WHERE 
            gs.Ciclo_Cic_Id = ?
    `;

    connection.query(query, [CicloId], (err, results) => {
        if (err) {
            console.error("Error al obtener los datos:", err);
            return res.status(500).send("Error al obtener los datos.");
        }

        return res.status(200).json(results);
    });
};



app.post("/materia_grado_seccion", PostMateriaGradoSeccion);
app.get("/materia_grado_seccion/:CicloId", GetGradosYMateriaGradoSeccion);

module.exports = app;