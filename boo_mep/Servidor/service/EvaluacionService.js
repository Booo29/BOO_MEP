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

const GetEvaluaciones = (req, res) => {
    const {Eva_Materia, Eva_Grado, Periodo_idPeriodo} = req.query;

    const query = `
        SELECT * FROM Evaluaciones WHERE Eva_Materia = ? AND Eva_Grado = ? AND Periodo_idPeriodo = ?
    `;
    connection.query(query, [Eva_Materia, Eva_Grado, Periodo_idPeriodo], (err, rows) => {
        if (err) {
            console.error("Error al obtener las evaluaciones:", err);
            return res.status(500).send("Error al obtener las evaluaciones");
        }

        return res.json(rows);
    });
}
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
app.post("/indicadoresEvaluacionNiveles", PostIndicadoresEvaluacionNiveles);

module.exports = app;