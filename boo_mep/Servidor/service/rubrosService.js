const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetRubros = (req, res) => {
    connection.query("SELECT * FROM rubros_evaluacion", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener rubros");
        } else {
            return res.status(200).json(results);
        }
    });
}

const PostRubros = (req, res) => {
    const { nombre, porcentaje } = req.body;

    if (!nombre || porcentaje === undefined) {
        return res.status(400).send("Campos incompletos");
    }

    connection.query(
        "INSERT INTO rubros_evaluacion SET ?", 
        [{ Rub_Nombre: nombre, Rub_Porcentaje: porcentaje }], 
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al insertar rubro");
            }

            const insertedId = results.insertId; // Obtener el ID del rubro insertado

            // Consultar el rubro recién insertado
            connection.query(
                "SELECT Rub_Id, Rub_Nombre, Rub_Porcentaje FROM rubros_evaluacion WHERE Rub_Id = ?", 
                [insertedId], 
                (err, rows) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error al obtener el rubro creado");
                    }

                    if (rows.length > 0) {
                        return res.status(200).json(rows[0]); // Enviar el objeto con ID, nombre y porcentaje
                    } else {
                        return res.status(404).send("Rubro no encontrado");
                    }
                }
            );
        }
    );
};


const PostRubrosConfigurados = (req, res) => {
    let rubros = req.body; // Puede ser un objeto o un array de objetos.

    // Verificar si es un solo objeto y convertirlo en un array para unificar el manejo.
    if (!Array.isArray(rubros)) {
        rubros = [rubros];
    }

    if (rubros.length === 0) {
        return res.status(400).send("Por favor, proporciona datos para guardar.");
    }

    // Iniciar transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        const query = `
            INSERT INTO rubros_configurados (Rubros_Evaluacion_Rub_Id, Periodo_Per_Id, Rub_Grado, Rub_Materia ) 
            VALUES (?, ?, ?, ?)
        `;

        // Crear promesas para insertar los datos
        const insertPromises = rubros.map((rubro) => {
            const { Rubros_Evaluacion_Rub_Id, Periodo_Per_Id, Rub_Grado, Rub_Materia } = rubro;

            return new Promise((resolve, reject) => {
                connection.query(
                    query,
                    [Rubros_Evaluacion_Rub_Id, Periodo_Per_Id, Rub_Grado, Rub_Materia],
                    (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(results);
                    }
                );
            });
        });

        // Ejecutar todas las inserciones
        Promise.all(insertPromises)
            .then((results) => {
                // Confirmar transacción si todo es exitoso
                connection.commit((commitErr) => {
                    if (commitErr) {
                        console.error("Error al confirmar la transacción:", commitErr);
                        return res.status(500).send("Error al confirmar la transacción.");
                    }

                    return res.status(201).json({
                        message: "Rubros configurados guardados con éxito.",
                        results: results,
                    });
                });
            })
            .catch((insertErr) => {
                console.error("Error al insertar los datos:", insertErr);

                // Revertir transacción si algo falla
                connection.rollback(() => {
                    return res.status(500).send("Error al guardar los rubros configurados.");
                });
            });
    });
};


const GetRubrosConfigurados = (req, res) => {
    const { periodoID, grado, materia} = req.query;

    if (!periodoID || !grado || !materia) {
        return res.status(400).send("Faltan parámetros");
    }

    const query = `
        SELECT 
            rc.Rub_Conf_Id,
            re.Rub_Id,
            re.Rub_Nombre,
            re.Rub_Porcentaje,
            rc.Periodo_Per_Id,
            rc.Rub_Grado,
            rc.Rub_Materia
        FROM rubros_configurados rc
        JOIN rubros_evaluacion re ON rc.Rubros_Evaluacion_Rub_Id = re.Rub_Id
        WHERE rc.Periodo_Per_Id = ? 
        AND rc.Rub_Grado = ? 
        AND rc.Rub_Materia = ?;
    `;

    connection.query(query, [periodoID, grado, materia], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener rubros configurados");
        } else {
            return res.status(200).json(results);
        }
    });
}


app.get("/rubros", GetRubros);
app.post("/rubros", PostRubros);
app.post("/rubros/configurados", PostRubrosConfigurados);
app.get("/rubros/configurados", GetRubrosConfigurados);

module.exports = app;