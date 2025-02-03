const express = require("express");
const app = express.Router();

const { connection } = require("../config");


const GetEstudiantesNotas = (req, res) => {
    const { materiaGradoSeccionId, materiaId, evaluacionId } = req.query;
    console.log("materiaGradoSeccionId ", materiaGradoSeccionId);
    console.log("materiaId ", materiaId);
    console.log("evaluacionId ", evaluacionId);
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
                COALESCE(ee.EvaEst_NotaFinal, NULL) AS EvaEst_NotaFinal
            FROM estudiantes e
            LEFT JOIN evaluacion_estudiante ee 
                ON e.Est_Id = ee.Estudiantes_Est_Id 
                AND ee.materia_grado_seccion_Mat_gra_sec_Id = ?
                AND ee.Evaluaciones_Eva_Id = ?
            JOIN grado_seccion gs 
                ON e.Grado_Seccion_Id_Grado_Seccion = gs.Id_Grado_Seccion
            JOIN materia_grado_seccion mgs 
                ON gs.Id_Grado_Seccion = mgs.Grado_Seccion_Id_Grado_Seccion
            WHERE mgs.Mat_gra_sec_Id = ?
              AND mgs.Materias_Mat_Id = ?
        `;

        connection.query(
            query,
            [materiaGradoSeccionId, evaluacionId, materiaGradoSeccionId, materiaId],
            (err, results) => {
                if(err) {
                    console.error("Error al obtener estudiantes y notas:", err);
                    return res.status(500).send("Error al obtener datos.");
                }
                console.log("results ", results);

                res.status(200).json(results);
            }
        )

    } catch (error) {
        console.error("Error al obtener estudiantes y notas:", error);
        res.status(500).send("Error al obtener datos.");
    } 
};

const postEstudianteNota = (req, res) => {
    const datos = req.body;

    if(!datos || datos.length === 0) {
        return res.status(400).send("Debe proporcionar datos.");
    }

    connection.beginTransaction((err) => {
        if(err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al registrar las notas.");
        }

        const query = `
            INSERT INTO evaluacion_estudiante (
                EvaEst_PuntosObtenidos, 
                EvaEst_PorcentajeObtenido,
                EvaEst_NotaFinal,
                Evaluaciones_Eva_Id, 
                Estudiantes_Est_Id, 
                Materia_grado_seccion_Mat_gra_sec_Id
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const promises = datos.map((dato) => {
            const {
                EvaEst_PuntosObtenidos,
                EvaEst_PorcentajeObtenido,
                EvaEst_NotaFinal,
                Evaluaciones_Eva_Id,
                Estudiantes_Est_Id,
                Materia_grado_seccion_Mat_gra_sec_Id
            } = dato;

            return new Promise((resolve, reject) => {
                connection.query(
                    query,
                    [
                        EvaEst_PuntosObtenidos, 
                        EvaEst_PorcentajeObtenido, 
                        EvaEst_NotaFinal, 
                        Evaluaciones_Eva_Id, 
                        Estudiantes_Est_Id, 
                        Materia_grado_seccion_Mat_gra_sec_Id
                    ],
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }

                        resolve(results);
                    }
                );
            });
        })

        Promise.all(promises)
            .then(() => {
                connection.commit((err) => {
                    if(err) {
                        console.error("Error al confirmar la transacción:", err);
                        return connection.rollback(() => res.status(500).send("Error al registrar las notas."));
                    }

                    res.status(200).send("Notas registradas correctamente.");
                });
            })
            .catch((err) => {
                console.error("Error al registrar notas:", err);
                connection.rollback(() => res.status(500).send("Error al registrar las notas."));
            });
    });
};

const putEstudianteNota = async (req, res) => {
    const datos = req.body;

    if(!datos || datos.length === 0) {
        return res.status(400).send("Debe proporcionar datos.");
    }

    try {
        connection.beginTransaction();

        const datosArray = Array.isArray(datos) ? datos : [datos];

        for (const dato of datosArray) {
            const {
                EvaEst_PuntosObtenidos,
                EvaEst_PorcentajeObtenido,
                EvaEst_NotaFinal,
                EvaEst_Id,
                Evaluaciones_Eva_Id,
                Estudiantes_Est_Id,
                Materia_grado_seccion_Mat_gra_sec_Id
            } = dato;

            const query = `
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

            await connection.query(query, [EvaEst_PuntosObtenidos, EvaEst_PorcentajeObtenido, EvaEst_NotaFinal, EvaEst_Id, Estudiantes_Est_Id, Materia_grado_seccion_Mat_gra_sec_Id]);
        }

        await connection.commit();
        res.status(200).send("Notas actualizadas correctamente.");
    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar notas:", error);
        res.status(500).send("Error al actualizar las notas.");
    }
};

    
app.get("/estudiantesNotas", GetEstudiantesNotas);
app.post("/estudianteNota", postEstudianteNota);
app.put("/estudianteNota/", putEstudianteNota);

module.exports = app;