const express = require("express");
const app = express.Router();

const { connection } = require("../config");

//Niveles de desempeño

const GetNivelesDesempeno = (req, res) => {
    const query = `
        SELECT * FROM Niveles_desempeno
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error al obtener los niveles de desempeño:", err);
            return res.status(500).send("Error al obtener los niveles de desempeño");
        }

        return res.json(rows);
    });
};

const PostNivelesDesempeno = (req, res) => {
    const datos = Array.isArray(req.body) ? req.body : [req.body]; 

    const query = `
        INSERT INTO niveles_desempeno (Niv_Puntos, Niv_Nivel, Niv_Descripcion)
        VALUES (?, ?, ?)
    `;
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        const promises = datos.map(dato => {
            const { Niv_Puntos, Niv_Nivel, Niv_Descripcion } = dato;

            return new Promise((resolve, reject) => {
                connection.query(query, [Niv_Puntos, Niv_Nivel, Niv_Descripcion], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return res.status(500).send("Error al confirmar la transacción.");
                    }
                    res.status(201).send("Niveles de desempeño guardadas con éxito.");
                }
                );
            })
            .catch((err) => {
                connection.rollback(() => {
                    console.error("Error al guardar Niveles de desempeño. Transacción revertida:", err);
                    res.status(500).send("Error al guardar Niveles de desempeño. Transacción revertida.");
                });
            });
    });
};

// Indicadores

const GetIndicadores = (req, res) => {
    const query = `
        SELECT * FROM Indicadores
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error al obtener los indicadores:", err);
            return res.status(500).send("Error al obtener los indicadores");
        }

        return res.json(rows);
    });
}

const PostIndicadores = (req, res) => {
    const datos = Array.isArray(req.body) ? req.body : [req.body]; 

    const query = `
        INSERT INTO indicadores (Ind_Nombre)
        VALUES (?)
    `;
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        const promises = datos.map(dato => {
            const { Ind_Nombre } = dato;

            return new Promise((resolve, reject) => {
                connection.query(query, [Ind_Nombre], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return res.status(500).send("Error al confirmar la transacción.");
                    }
                    res.status(201).send("Indicadores guardadas con éxito.");
                }
                );
            })
            .catch((err) => {
                connection.rollback(() => {
                    console.error("Error al guardar Indicadores. Transacción revertida:", err);
                    res.status(500).send("Error al guardar Indicadores. Transacción revertida.");
                });
            });
    });
};

// Evaluaciones

// const GetEvaluaciones = (req, res) => {
//     const {Eva_Materia, Eva_Grado, Periodo_idPeriodo} = req.query;

//     const query = `
//         SELECT * FROM Evaluaciones WHERE Eva_Materia = ? AND Eva_Grado = ? AND Periodo_idPeriodo = ?
//     `;
//     connection.query(query, [Eva_Materia, Eva_Grado, Periodo_idPeriodo], (err, rows) => {
//         if (err) {
//             console.error("Error al obtener las evaluaciones:", err);
//             return res.status(500).send("Error al obtener las evaluaciones");
//         }

//         return res.json(rows);
//     });
// }

const GetEvaluaciones = (req, res) => {
    const { Eva_Materia, Eva_Grado, Periodo_idPeriodo } = req.query; // Obtener parámetros de consulta

    if (!Eva_Materia || !Eva_Grado || !Periodo_idPeriodo) {
        return res.status(400).json({ message: "Faltan parámetros en la solicitud" });
    }

    const query = `
        SELECT 
            e.Eva_Id,
            e.Eva_Nombre,
            e.Eva_Fecha,
            e.Eva_Porcentaje,
            e.Eva_Puntos,
            e.Eva_Grado,
            e.Eva_Materia,
            e.Periodo_idPeriodo,
            ie.Ind_Eva_Id,
            i.Ind_Id,
            i.Ind_Nombre,
            id.Niveles_desempeno_Niv_Id,
            nd.Niv_Nivel,
            nd.Niv_Puntos,
            nd.Niv_Descripcion
        FROM evaluaciones e
        LEFT JOIN indicadores_evaluacion ie ON e.Eva_Id = ie.Evaluaciones_Eva_Id
        LEFT JOIN indicadores i ON ie.Indicadores_Ind_Id = i.Ind_Id
        LEFT JOIN indicadores_desempeno id ON ie.Ind_Eva_Id = id.Indicadores_Evaluacion_Ind_Eva_Id
        LEFT JOIN niveles_desempeno nd ON id.Niveles_desempeno_Niv_Id = nd.Niv_Id
        WHERE e.Eva_Estado = 'A' AND e.Eva_Materia = ? AND e.Eva_Grado = ? AND e.Periodo_idPeriodo = ?;
    `;

    connection.query(query, [Eva_Materia, Eva_Grado, Periodo_idPeriodo], (err, results) => {
        if (err) {
            console.error("Error al obtener evaluaciones:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        // Agrupar resultados para estructurar mejor la respuesta
        const evaluaciones = {};
        results.forEach(row => {
            const evaId = row.Eva_Id;

            if (!evaluaciones[evaId]) {
                evaluaciones[evaId] = {
                    id: evaId,
                    nombre: row.Eva_Nombre,
                    fecha: row.Eva_Fecha,
                    porcentaje: row.Eva_Porcentaje,
                    puntos: row.Eva_Puntos,
                    grado: row.Eva_Grado,
                    materia: row.Eva_Materia,
                    periodo: row.Periodo_idPeriodo,
                    indicadores: []
                };
            }

            if (row.Ind_Id) {
                let indicador = evaluaciones[evaId].indicadores.find(ind => ind.id === row.Ind_Id);

                if (!indicador) {
                    indicador = {
                        id: row.Ind_Id,
                        nombre: row.Ind_Nombre,
                        niveles: []
                    };
                    evaluaciones[evaId].indicadores.push(indicador);
                }

                if (row.Niveles_desempeno_Niv_Id) {
                    indicador.niveles.push({
                        id: row.Niveles_desempeno_Niv_Id,
                        nivel: row.Niv_Nivel,
                        puntos: row.Niv_Puntos,
                        descripcion: row.Niv_Descripcion
                    });
                }
            }
        });

        return res.status(200).json(Object.values(evaluaciones));
    });
};


const PostEvaluaciones = (req, res) => {
    const datos = Array.isArray(req.body) ? req.body : [req.body]; 

    const query = `
        INSERT INTO Evaluaciones (Eva_Materia, Eva_Grado, Eva_Nombre, Eva_Fecha, Eva_Porcentaje, Eva_Puntos, Periodo_idPeriodo)
        VALUES ?
    `;

    // Convertimos los datos en un array de arrays para poder usarlos en VALUES (?)
    const values = datos.map(dato => [
        dato.Eva_Materia,
        dato.Eva_Grado,
        dato.Eva_Nombre,
        dato.Eva_Fecha,
        dato.Eva_Porcentaje,
        dato.Eva_Puntos,
        dato.Periodo_idPeriodo
    ]);

    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        connection.query(query, [values], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    console.error("Error al guardar evaluaciones. Transacción revertida:", err);
                    res.status(500).send("Error al guardar evaluaciones. Transacción revertida.");
                });
            }

            // Obtenemos los IDs insertados
            const insertedIds = Array.from({ length: results.affectedRows }, (_, i) => results.insertId + i);

            connection.commit((err) => {
                if (err) {
                    console.error("Error al confirmar la transacción:", err);
                    return res.status(500).send("Error al confirmar la transacción.");
                }

                res.status(201).json({
                    message: "Evaluaciones guardadas con éxito.",
                    insertedIds
                });
            });
        });
    });
};


const DeleteEvaluacion = (req, res) => {
    const { id } = req.params;

    if(id){
        connection.query("UPDATE Evaluaciones SET Eva_Estado = 'I' WHERE Eva_Id = ?", [id], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar evaluación");
            } else {
                return res.status(200).send("Evaluación eliminada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}



// Indicadores más evaluaciones y desempeño 

const PostIndicadoresEvaluacionNiveles = async (req, res) => {
    const data = req.body;

    // Convertir a array si es un solo objeto
    const indicadoresArray = Array.isArray(data) ? data : [data];

    const evaluacionValues = indicadoresArray.map(item => [
        item.Evaluaciones_Eva_Id,
        item.Indicadores_Ind_Id
    ]);

    // try {
        connection.beginTransaction(err => {
            if (err) {
                console.error("Error al iniciar la transacción:", err);
                return res.status(500).send("Error al iniciar la transacción.");
            }
            
            const insertEvaluacionQuery = `
                INSERT INTO Indicadores_Evaluacion 
                (Evaluaciones_Eva_Id, Indicadores_Ind_Id)
                VALUES ?
            `;

            connection.query(insertEvaluacionQuery, [evaluacionValues], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error("Error al insertar en Indicadores_Evaluacion:", err);
                        return res.status(500).send("Error al insertar en Indicadores_Evaluacion.");
                    });
                }

                const insertedIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);

                const desempenoValues = [];

                indicadoresArray.forEach((item, index) => {
                    if (Array.isArray(item.Indicadores_Desempeno) && item.Indicadores_Desempeno.length > 0) {
                        item.Indicadores_Desempeno.forEach(desempeno => {
                            desempenoValues.push([
                                desempeno.Niveles_desempeno_Niv_Id,
                                insertedIds[index]
                            ]);
                        });
                    }
                });

                const insertDesempenoQuery = `
                    INSERT INTO Indicadores_Desempeno 
                    (Niveles_desempeno_Niv_Id, Indicadores_Evaluacion_Ind_Eva_Id)
                    VALUES ?
                `;

                connection.query(insertDesempenoQuery, [desempenoValues], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error al insertar en Indicadores_Desempeno:", err);
                            return res.status(500).send("Error al insertar en Indicadores_Desempeno.");
                        });
                    }

                    connection.commit(err => {
                        if (err) {
                            console.error("Error al confirmar la transacción:", err);
                            return res.status(500).send("Error al confirmar la transacción.");
                        }
                        res.status(201).send("Registros insertados correctamente.");
                    });
                });
            });
        });

        // const insertEvaluacionQuery = `
        //     INSERT INTO Indicadores_Evaluacion (Evaluaciones_Eva_Id, Indicadores_Ind_Id)
        //     VALUES ?
        // `;



        // // Insertar en Indicadores_Evaluacion
        // const [evaluacionResult] = await connection.query(insertEvaluacionQuery, [evaluacionValues]);

        // const insertedIds = Array.from({ length: evaluacionResult.affectedRows }, (_, i) => evaluacionResult.insertId + i);

        // const insertDesempenoQuery = `
        //     INSERT INTO Indicadores_Desempeno (Niveles_desempeno_Niv_Id, Indicadores_Evaluacion_Ind_Eva_Id)
        //     VALUES ?
        // `;

        // const desempenoValues = [];

        // indicadoresArray.forEach((item, index) => {
        //     if (Array.isArray(item.Indicadores_Desempeno) && item.Indicadores_Desempeno.length > 0) {
        //         item.Indicadores_Desempeno.forEach(desempeno => {
        //             desempenoValues.push([
        //                 desempeno.Niveles_desempeno_Niv_Id,
        //                 insertedIds[index]
        //             ]);
        //         });
        //     }
        // });

        // if (desempenoValues.length > 0) {
        //     await connection.query(insertDesempenoQuery, [desempenoValues]);
        // }

        // await connection.commit();
        // res.status(201).send("Registros insertados correctamente.");
    // } catch (error) {
    //     await connection.rollback();
    //     console.error("Error al insertar indicadores:", error);
    //     res.status(500).send("Error al insertar indicadores.");
    // } 
};


app.get("/nivelesDesempeno", GetNivelesDesempeno);
app.post("/nivelesDesempeno", PostNivelesDesempeno);
app.get("/indicadores", GetIndicadores);
app.post("/indicadores", PostIndicadores);
app.get("/evaluaciones", GetEvaluaciones);
app.post("/evaluaciones", PostEvaluaciones);
app.delete("/evaluaciones/:id", DeleteEvaluacion);
app.post("/indicadoresEvaluacionNiveles", PostIndicadoresEvaluacionNiveles);

module.exports = app;