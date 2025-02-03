const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const PostEstudiantes = (req, res) => {
    const estudiantes = Array.isArray(req.body) ? req.body : [req.body]; // Acepta objeto o array

    // Verificar que los datos tengan la estructura correcta
    for (const estudiante of estudiantes) {
        const { Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion } = estudiante;
        if (!Est_Identificacion || !Est_Nombre || !Est_PrimerApellido || !Est_SegundoApellido || !Grado_Seccion_Id_Grado_Seccion) {
            return res.status(400).send("Todos los campos son obligatorios: Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion.");
        }
    }

    // Iniciar una transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        const query = `
            INSERT INTO estudiantes (Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion) 
            VALUES (?, ?, ?, ?, ?)
        `;

        // Procesar cada estudiante
        const promises = estudiantes.map(estudiante => {
            const { Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion } = estudiante;

            return new Promise((resolve, reject) => {
                connection.query(query, [Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });

        // Ejecutar todas las promesas
        Promise.all(promises)
            .then(() => {
                // Confirmar la transacción
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return res.status(500).send("Error al confirmar la transacción.");
                    }
                    res.status(201).send("Estudiantes guardados con éxito.");
                });
            })
            .catch((err) => {
                // Revertir la transacción en caso de error
                connection.rollback(() => {
                    console.error("Error al guardar estudiantes. Transacción revertida:", err);
                    res.status(500).send("Error al guardar estudiantes. Transacción revertida.");
                });
            });
    });
};

const GetEstudiantes = (req, res) => {
    const { CicloId, SeccionId } = req.query;

    // Validar que se hayan proporcionado los parámetros necesarios
    if (!CicloId || !SeccionId) {
        return res.status(400).send("Se requieren los parámetros CicloId y SeccionId.");
    }

    // Consulta SQL
    const query = `
        SELECT 
            e.Est_Id,
            e.Est_Identificacion,
            e.Est_Nombre,
            e.Est_PrimerApellido,
            e.Est_SegundoApellido,
            gs.Grados_idGrados,
            g.Gra_Nombre
        FROM 
            estudiantes e
        INNER JOIN 
            grado_seccion gs ON e.Grado_Seccion_Id_Grado_Seccion = gs.Id_Grado_Seccion
        INNER JOIN 
            grados g ON gs.Grados_idGrados = g.Gra_Id
        WHERE 
            gs.Ciclo_Cic_Id = ? AND gs.Id_Grado_Seccion = ? 
    `;

    // Ejecutar la consulta
    connection.query(query, [CicloId, SeccionId], (err, results) => {
        if (err) {
            console.error("Error al obtener estudiantes:", err);
            return res.status(500).send("Error al obtener estudiantes.");
        }

        // Verificar si se encontraron resultados
        if (results.length === 0) {
            return res.status(404).send("No se encontraron estudiantes para los parámetros proporcionados.");
        }

        // Enviar la respuesta con los resultados
        res.status(200).json(results);
    });
};

const PutEstudiante = (req, res) => {
    const { id } = req.params;
    const { Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido,  } = req.body;

    // Validar que se hayan proporcionado los datos necesarios
    if (!Est_Identificacion || !Est_Nombre || !Est_PrimerApellido || !Est_SegundoApellido ) {
        return res.status(400).send("Todos los campos son obligatorios: Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido.");
    }

    // Consulta SQL
    const query = `
        UPDATE estudiantes 
        SET 
            Est_Identificacion = ?,
            Est_Nombre = ?,
            Est_PrimerApellido = ?,
            Est_SegundoApellido = ?
        WHERE 
            Est_Id = ?
    `;

    // Ejecutar la consulta
    connection.query(query, [Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, id], (err, results) => {
        if (err) {
            console.error("Error al actualizar estudiante:", err);
            return res.status(500).send("Error al actualizar estudiante.");
        }

        // Verificar si se encontró el estudiante
        if (results.affectedRows === 0) {
            return res.status(404).send("No se encontró el estudiante.");
        }

        // Enviar respuesta
        res.status(200).send("Estudiante actualizado con éxito.");
    });
};

const DeleteEstudiante = (req, res) => {
    const { id } = req.params;

    // Consulta SQL
    const query = `UPDATE estudiantes SET Est_Estado = 'I' WHERE Est_Id = ?`;

    // Ejecutar la consulta
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al eliminar estudiante:", err);
            return res.status(500).send("Error al eliminar estudiante.");
        }

        // Verificar si se encontró el estudiante
        if (results.affectedRows === 0) {
            return res.status(404).send("No se encontró el estudiante.");
        }

        // Enviar respuesta
        res.status(200).send("Estudiante eliminado con éxito.");
    });
};



app.post("/estudiantes", PostEstudiantes);
app.get("/estudiantes", GetEstudiantes);
app.put("/estudiantes/:id", PutEstudiante);
app.delete("/estudiantes/:id", DeleteEstudiante);

module.exports = app;