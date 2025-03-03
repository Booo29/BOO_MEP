const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const PostAsistencia = (req, res) => {
    const asistencias = req.body;

    // Validar que la entrada no esté vacía
    if (!asistencias || asistencias.length === 0) {
        return res.status(400).send("Debe proporcionar al menos un registro de asistencia.");
    }

    // Iniciar la transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        // Consulta SQL para insertar en la tabla asistencia
        const query = `
            INSERT INTO asistencia (
                Asi_Fecha, 
                Asi_Leccion, 
                Asi_Asistencia, 
                Asi_Justificacion, 
                Materia_grado_seccion_Mat_gra_sec_Id, 
                Estudiantes_Est_Id, 
                Periodo_Per_Id,
                Asi_Sesion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Promesa para manejar cada inserción
        const promises = asistencias.map((asistencia) => {
            const {
                Asi_Fecha,
                Asi_Leccion,
                Asi_Asistencia,
                Asi_Justificacion = null, // Permitir valor nulo si no se proporciona
                Materia_grado_seccion_Mat_gra_sec_Id,
                Estudiantes_Est_Id,
                Periodo_Per_Id,
                Asi_Sesion,
            } = asistencia;

            return new Promise((resolve, reject) => {
                connection.query(
                    query,
                    [
                        Asi_Fecha,
                        Asi_Leccion,
                        Asi_Asistencia,
                        Asi_Justificacion,
                        Materia_grado_seccion_Mat_gra_sec_Id,
                        Estudiantes_Est_Id,
                        Periodo_Per_Id,
                        Asi_Sesion,
                    ],
                    (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    }
                );
            });
        });

        // Ejecutar todas las inserciones
        Promise.all(promises)
            .then(() => {
                // Confirmar la transacción si todo fue exitoso
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return connection.rollback(() => {
                            res.status(500).send("Error al confirmar la transacción.");
                        });
                    }
                    res.status(200).send("Asistencias registradas exitosamente.");
                });
            })
            .catch((err) => {
                console.error("Error al insertar asistencias:", err);
                // Revertir la transacción si ocurrió algún error
                connection.rollback(() => {
                    res.status(500).send("Error al registrar las asistencias.");
                });
            });
    });
};

const GetAsistencia = (req, res) => {
    const { PeriodoId, MateriaId, SeccionId, Fecha } = req.query;

    // Validar que los parámetros sean proporcionados
    if (!PeriodoId || !MateriaId || !SeccionId || !Fecha) {
        return res.status(400).send("Debe proporcionar PeriodoId, SeccionId y Fecha como parámetros.");
    }

    // Consulta SQL para obtener estudiantes y su asistencia
    const query = `
        SELECT 
            e.Est_Id,
            e.Est_Nombre,
            e.Est_Identificacion,
            e.Est_PrimerApellido,
            e.Est_SegundoApellido,
            a.Asi_Id,
            a.Asi_Fecha,
            a.Asi_Leccion,
            a.Asi_Asistencia,
            a.Asi_Justificacion,
            a.Asi_Sesion
        FROM 
            estudiantes e
        LEFT JOIN 
            asistencia a
        ON 
            e.Est_Id = a.Estudiantes_Est_Id 
            AND a.Materia_grado_seccion_Mat_gra_sec_Id = ?
            AND a.Periodo_Per_Id = ?
            AND a.Asi_Fecha = ?
        WHERE 
            e.Est_Estado = 'A' AND
            e.Grado_Seccion_Id_Grado_Seccion = ?
    `;

    // Ejecutar la consulta
    connection.query(
        query,
        [MateriaId, PeriodoId, Fecha, SeccionId],
        (err, results) => {
            if (err) {
                console.error("Error al obtener la asistencia:", err);
                return res.status(500).send("Error al obtener la asistencia.");
            }

            res.status(200).json(results);
        }
    );
};

const PutAsistencia = async (req, res) => {
    const asistencias = req.body;

    if (!asistencias || asistencias.length === 0) {
        return res.status(400).send("El cuerpo de la solicitud debe contener uno o más registros de asistencia.");
    }

   
    try {
        connection.beginTransaction();

        // Validar si el objeto es único o un array
        const asistenciaArray = Array.isArray(asistencias) ? asistencias : [asistencias];

        for (const asistencia of asistenciaArray) {
            const {
                Asi_Fecha,
                Asi_Leccion,
                Asi_Asistencia,
                Asi_Justificacion,
                Materia_grado_seccion_Mat_gra_sec_Id,
                Estudiantes_Est_Id,
                Periodo_Per_Id,
                Asi_Id,
            } = asistencia;

            if (
                !Asi_Fecha ||
                !Asi_Leccion ||
                !Asi_Asistencia ||
                !Materia_grado_seccion_Mat_gra_sec_Id ||
                !Estudiantes_Est_Id ||
                !Periodo_Per_Id ||
                !Asi_Id
            ) {
                throw new Error("Todos los campos requeridos deben ser proporcionados.");
            }

            const query = `
                UPDATE asistencia
                SET 
                    Asi_Leccion = ?,
                    Asi_Asistencia = ?,
                    Asi_Justificacion = ?,
                    Materia_grado_seccion_Mat_gra_sec_Id = ?,
                    Periodo_Per_Id = ?
                WHERE 
                    Asi_Fecha = ?
                    AND Estudiantes_Est_Id = ?
                    AND Asi_Id = ?
            `;

            await connection.query(query, [
                Asi_Leccion,
                Asi_Asistencia,
                Asi_Justificacion || null,
                Materia_grado_seccion_Mat_gra_sec_Id,
                Periodo_Per_Id,
                Asi_Fecha,
                Estudiantes_Est_Id,
                Asi_Id,
            ]);
        }

        await connection.commit();
        res.status(200).send("Asistencia actualizada correctamente.");
    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar la asistencia:", error);
        res.status(500).send("Error al actualizar la asistencia.");
    } 
};




app.post("/asistencia", PostAsistencia);
app.get("/asistencia", GetAsistencia);
app.put("/asistencia", PutAsistencia);

module.exports = app;