const express = require("express");
const app = express.Router();

const { connection } = require("../config");


const GetEstudiantesNotas = (req, res) => {
    const { materiaGradoSeccionId, materiaId, evaluacionId } = req.query;
    try {
        const query = `
            SELECT 
                e.Est_Id,
                e.Est_Identificacion,
                e.Est_Nombre,
                e.Est_PrimerApellido,
                e.Est_SegundoApellido,
                ee.EvaEst_Id,
                COALESCE(ee.EvaEst_PuntosObtenidos, NULL) AS EvaEst_PuntosObtenidos,
                COALESCE(ee.EvaEst_PorcentajeObtenido, NULL) AS EvaEst_PorcentajeObtenido,
                COALESCE(ee.EvaEst_NotaFinal, NULL) AS EvaEst_NotaFinal,
                i.Ind_Id,
                i.Ind_Nombre,
                ei.Eva_Ind_Nota,
                ei.Eva_Ind_Id
            FROM estudiantes e
            LEFT JOIN evaluacion_estudiante ee 
                ON e.Est_Id = ee.Estudiantes_Est_Id 
                AND ee.materia_grado_seccion_Mat_gra_sec_Id = ?
                AND ee.Evaluaciones_Eva_Id = ?
            JOIN grado_seccion gs 
                ON e.Grado_Seccion_Id_Grado_Seccion = gs.Id_Grado_Seccion
            JOIN materia_grado_seccion mgs 
                ON gs.Id_Grado_Seccion = mgs.Grado_Seccion_Id_Grado_Seccion
            LEFT JOIN evaluacion_indicadores ei 
                ON ee.EvaEst_Id = ei.Evaluacion_Estudiante_EvaEst_Id
            LEFT JOIN indicadores i 
                ON ei.Indicadores_Desempeno_Ind_Des_Id = i.Ind_Id
            WHERE mgs.Mat_gra_sec_Id = ?
            AND mgs.Materias_Mat_Id = ?
            AND e.Est_Estado = 'A'
            ORDER BY e.Est_Id, i.Ind_Id;

        `;

        connection.query(
            query,
            [materiaGradoSeccionId, evaluacionId, materiaGradoSeccionId, materiaId],
            (err, results) => {
                if(err) {
                    console.error("Error al obtener estudiantes y notas:", err);
                    return res.status(500).send("Error al obtener datos.");
                }

                const estudiantes = {};
                results.forEach((row) => {
                    if (!estudiantes[row.Est_Id]) {
                        estudiantes[row.Est_Id] = {
                          id: row.Est_Id,
                          identificacion: row.Est_Identificacion,
                          nombre: row.Est_Nombre,
                          primerApellido: row.Est_PrimerApellido,
                          segundoApellido: row.Est_SegundoApellido,
                          evaluacion: {
                            id: row.EvaEst_Id,
                            puntosObtenidos: row.EvaEst_PuntosObtenidos,
                            porcentajeObtenido: row.EvaEst_PorcentajeObtenido,
                            notaFinal: row.EvaEst_NotaFinal,
                          },
                          indicadores: [],
                        };
                      }
                
                      if (row.Ind_Id) {
                        estudiantes[row.Est_Id].indicadores.push({
                          idEvaluacionIndicador: row.Eva_Ind_Id,
                          id: row.Ind_Id,
                          nombre: row.Ind_Nombre,
                          nota: row.Eva_Ind_Nota,
                        });
                      }
                    });  
                    res.status(200).send(Object.values(estudiantes));
                }
            );
    } catch (error) {
        console.error("Error al obtener estudiantes y notas:", error);
        res.status(500).send("Error al obtener datos.");
    }
}

const postEstudianteNota = (req, res) => {
    const datos = req.body;

    if (!datos || datos.length === 0) {
        return res.status(400).json({ error: "Debe proporcionar datos." });
    }

    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).json({ error: "Error al registrar las notas." });
        }

        const insertEvaluacionEstudianteQuery = `
            INSERT INTO evaluacion_estudiante (
                EvaEst_PuntosObtenidos, 
                EvaEst_PorcentajeObtenido,
                EvaEst_NotaFinal,
                Evaluaciones_Eva_Id, 
                Estudiantes_Est_Id, 
                Materia_grado_seccion_Mat_gra_sec_Id
            ) VALUES (?, ?, ?, ?, ?, ?)`;

        const insertEvaluacionIndicadoresQuery = `
            INSERT INTO evaluacion_indicadores (
                Eva_Ind_Nota, 
                Evaluacion_Estudiante_EvaEst_Id, 
                Indicadores_Desempeno_Ind_Des_Id
            ) VALUES (?, ?, ?)`;

        let promises = [];

        datos.forEach((dato) => {
            promises.push(new Promise((resolve, reject) => {
                connection.query(
                    insertEvaluacionEstudianteQuery,
                    [
                        dato.EvaEst_PuntosObtenidos,
                        dato.EvaEst_PorcentajeObtenido,
                        dato.EvaEst_NotaFinal,
                        dato.Evaluaciones_Eva_Id,
                        dato.Estudiantes_Est_Id,
                        dato.Materia_grado_seccion_Mat_gra_sec_Id
                    ],
                    (err, results) => {
                        if (err) {
                            return reject(err);
                        }

                        const evaluacionEstudianteId = results.insertId;

                        // Si hay datos en evaluacionIndicadores, los insertamos
                        if (dato.evaluacionIndicadores && dato.evaluacionIndicadores.length > 0) {
                            let subPromises = dato.evaluacionIndicadores.map((indicador) => {
                                return new Promise((resolveSub, rejectSub) => {
                                    connection.query(
                                        insertEvaluacionIndicadoresQuery,
                                        [
                                            indicador.Eva_Ind_Nota,
                                            evaluacionEstudianteId,
                                            indicador.Indicadores_Desempeno_Ind_Des_Id
                                        ],
                                        (err) => {
                                            if (err) {
                                                return rejectSub(err);
                                            }
                                            resolveSub();
                                        }
                                    );
                                });
                            });

                            // Esperamos a que todas las inserciones de indicadores terminen
                            Promise.all(subPromises)
                                .then(() => resolve())
                                .catch((err) => reject(err));
                        } else {
                            resolve();
                        }
                    }
                );
            }));
        });

        // Esperamos a que todas las promesas terminen
        Promise.all(promises)
            .then(() => {
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return connection.rollback(() => {
                            res.status(500).json({ error: "Error al registrar las notas." });
                        });
                    }
                    res.status(200).json({ message: "Notas registradas correctamente." });
                });
            })
            .catch((err) => {
                console.error("Error al registrar notas:", err);
                connection.rollback(() => {
                    res.status(500).json({ error: "Error al registrar las notas." });
                });
            });
    });
};


const putEstudianteNota = (req, res) => {
    const datos = req.body;

    if (!datos || datos.length === 0) {
        return res.status(400).json({ error: "Debe proporcionar datos." });
    }

    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).json({ error: "Error al actualizar las notas." });
        }

        const updateEvaluacionEstudianteQuery = `
            UPDATE evaluacion_estudiante
            SET 
                EvaEst_PuntosObtenidos = ?, 
                EvaEst_PorcentajeObtenido = ?, 
                EvaEst_NotaFinal = ?
            WHERE 
                EvaEst_Id = ? 
                AND Estudiantes_Est_Id = ? 
                AND Materia_grado_seccion_Mat_gra_sec_Id = ?
        `;

        const checkIndicadorQuery = `
                SELECT Eva_Ind_Id FROM evaluacion_indicadores
            WHERE 
                Evaluacion_Estudiante_EvaEst_Id = ? 
                AND Indicadores_Desempeno_Ind_Des_Id = ?
        `;

        const updateEvaluacionIndicadoresQuery = `
                UPDATE evaluacion_indicadores
                SET Eva_Ind_Nota = ?
            WHERE 
                Eva_Ind_Id = ?
                AND Evaluacion_Estudiante_EvaEst_Id = ?
                AND Indicadores_Desempeno_Ind_Des_Id = ?
        `;

        const insertEvaluacionIndicadoresQuery = `
            INSERT INTO evaluacion_indicadores (Eva_Ind_Nota, Evaluacion_Estudiante_EvaEst_Id, Indicadores_Desempeno_Ind_Des_Id)
            VALUES (?, ?, ?)
        `;

        let promises = [];

        datos.forEach((dato) => {
            promises.push(new Promise((resolve, reject) => {
                connection.query(
                    updateEvaluacionEstudianteQuery,
                    [
                        dato.EvaEst_PuntosObtenidos,
                        dato.EvaEst_PorcentajeObtenido,
                        dato.EvaEst_NotaFinal,
                        dato.EvaEst_Id,
                        dato.Estudiantes_Est_Id,
                        dato.Materia_grado_seccion_Mat_gra_sec_Id
                    ],
                    (err, results) => {
                        if (err) {
                            return reject(err);
                        }

                        if (dato.evaluacionIndicadores && dato.evaluacionIndicadores.length > 0) {
                            let subPromises = dato.evaluacionIndicadores.map((indicador) => {
                                return new Promise((resolveSub, rejectSub) => {
                                    connection.query(
                                        checkIndicadorQuery,
                                        [dato.EvaEst_Id, indicador.Indicadores_Desempeno_Ind_Des_Id],
                                        (err, results) => {
                                            if (err) {
                                                return rejectSub(err);
                                            }

                                            if(results.length > 0) {
                                                const indicadorId = results[0].Eva_Ind_Id;

                                                // Actualizar el indicador existente
                                                connection.query(
                                                    updateEvaluacionIndicadoresQuery,
                                                    [
                                                        indicador.Eva_Ind_Nota,
                                                        indicadorId,
                                                        dato.EvaEst_Id,
                                                        indicador.Indicadores_Desempeno_Ind_Des_Id
                                                    ],
                                                    (err) => {
                                                        if (err) {
                                                            return rejectSub(err);
                                                        }
                                                        resolveSub();
                                                    }
                                                );
                                            } else {
                                                // Insertar nuevo indicador
                                                connection.query(
                                                    insertEvaluacionIndicadoresQuery,
                                                    [
                                                        indicador.Eva_Ind_Nota,
                                                        dato.EvaEst_Id,
                                                        indicador.Indicadores_Desempeno_Ind_Des_Id
                                                    ],
                                                    (err) => {
                                                        if (err) {
                                                            return rejectSub(err);
                                                        }
                                                        resolveSub();
                                                    }
                                                );
                                            }
                                        }
                                    );
                                });
                            });

                            Promise.all(subPromises)
                                .then(() => resolve())
                                .catch((err) => reject(err));
                        } else {
                            resolve();
                        }
                    }
                );
            }));
        });

        Promise.all(promises)
            .then(() => {
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return connection.rollback(() => {
                            res.status(500).json({ error: "Error al actualizar las notas." });
                        });
                    }
                    res.status(200).json({ message: "Notas actualizadas correctamente." });
                });
            })
            .catch((err) => {
                console.error("Error al actualizar notas:", err);
                connection.rollback(() => {
                    res.status(500).json({ error: "Error al actualizar las notas." });
                });
            });
    });
};




// const postEstudianteNota = (req, res) => {
//     const datos = req.body;

//     if(!datos || datos.length === 0) {
//         return res.status(400).send("Debe proporcionar datos.");
//     }

//     connection.beginTransaction((err) => {
//         if(err) {
//             console.error("Error al iniciar la transacción:", err);
//             return res.status(500).send("Error al registrar las notas.");
//         }

//         const query = `
//             INSERT INTO evaluacion_estudiante (
//                 EvaEst_PuntosObtenidos, 
//                 EvaEst_PorcentajeObtenido,
//                 EvaEst_NotaFinal,
//                 Evaluaciones_Eva_Id, 
//                 Estudiantes_Est_Id, 
//                 Materia_grado_seccion_Mat_gra_sec_Id
//             )
//             VALUES (?, ?, ?, ?, ?, ?)
//         `;

//         const promises = datos.map((dato) => {
//             const {
//                 EvaEst_PuntosObtenidos,
//                 EvaEst_PorcentajeObtenido,
//                 EvaEst_NotaFinal,
//                 Evaluaciones_Eva_Id,
//                 Estudiantes_Est_Id,
//                 Materia_grado_seccion_Mat_gra_sec_Id
//             } = dato;

//             return new Promise((resolve, reject) => {
//                 connection.query(
//                     query,
//                     [
//                         EvaEst_PuntosObtenidos, 
//                         EvaEst_PorcentajeObtenido, 
//                         EvaEst_NotaFinal, 
//                         Evaluaciones_Eva_Id, 
//                         Estudiantes_Est_Id, 
//                         Materia_grado_seccion_Mat_gra_sec_Id
//                     ],
//                     (err, results) => {
//                         if(err) {
//                             return reject(err);
//                         }

//                         resolve(results);
//                     }
//                 );
//             });
//         })

//         Promise.all(promises)
//             .then(() => {
//                 connection.commit((err) => {
//                     if(err) {
//                         console.error("Error al confirmar la transacción:", err);
//                         return connection.rollback(() => res.status(500).send("Error al registrar las notas."));
//                     }

//                     res.status(200).send("Notas registradas correctamente.");
//                 });
//             })
//             .catch((err) => {
//                 console.error("Error al registrar notas:", err);
//                 connection.rollback(() => res.status(500).send("Error al registrar las notas."));
//             });
//     });
// };

// const putEstudianteNota = async (req, res) => {
//     const datos = req.body;

//     if(!datos || datos.length === 0) {
//         return res.status(400).send("Debe proporcionar datos.");
//     }

//     try {
//         connection.beginTransaction();

//         const datosArray = Array.isArray(datos) ? datos : [datos];

//         for (const dato of datosArray) {
//             const {
//                 EvaEst_PuntosObtenidos,
//                 EvaEst_PorcentajeObtenido,
//                 EvaEst_NotaFinal,
//                 EvaEst_Id,
//                 Evaluaciones_Eva_Id,
//                 Estudiantes_Est_Id,
//                 Materia_grado_seccion_Mat_gra_sec_Id
//             } = dato;

//             const query = `
//                 UPDATE evaluacion_estudiante
//                 SET 
//                     EvaEst_PuntosObtenidos = ?,
//                     EvaEst_PorcentajeObtenido = ?,
//                     EvaEst_NotaFinal = ?
//                 WHERE 
//                   EvaEst_Id = ?
//                   AND Estudiantes_Est_Id = ?
//                   AND Materia_grado_seccion_Mat_gra_sec_Id = ?
//             `;

//             await connection.query(query, [EvaEst_PuntosObtenidos, EvaEst_PorcentajeObtenido, EvaEst_NotaFinal, EvaEst_Id, Estudiantes_Est_Id, Materia_grado_seccion_Mat_gra_sec_Id]);
//         }

//         await connection.commit();
//         res.status(200).send("Notas actualizadas correctamente.");
//     } catch (error) {
//         await connection.rollback();
//         console.error("Error al actualizar notas:", error);
//         res.status(500).send("Error al actualizar las notas.");
//     }
// };

    
app.get("/estudiantesNotas", GetEstudiantesNotas);
app.post("/estudianteNota", postEstudianteNota);
app.put("/estudianteNota/", putEstudianteNota);

module.exports = app;