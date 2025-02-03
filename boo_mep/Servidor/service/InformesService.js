const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetInformeAsistencia = (req, res) => {

    try{

    const {seccionId, estudianteId, fechaInicio, fechaFin} = req.query;

    const query = `
      SELECT 
          e.Est_Id,
          e.Est_Identificacion,
          e.Est_Nombre,
          e.Est_PrimerApellido,
          e.Est_SegundoApellido,
          m.Mat_Nombre,
          a.Asi_Asistencia,
          a.Asi_Leccion,
        -- Contar la cantidad de asistencias por tipo
            SUM(CASE WHEN a.Asi_Asistencia = 'Presente' THEN 1 ELSE 0 END) AS Total_Presente,
            SUM(CASE WHEN a.Asi_Asistencia = 'Ausente' THEN 1 ELSE 0 END) AS Total_Ausente,
            SUM(CASE WHEN a.Asi_Asistencia = 'Ausente Justificado' THEN 1 ELSE 0 END) AS Total_Ausente_Justificado,

        -- Concatenar fechas de cada tipo de asistencia
            COALESCE(GROUP_CONCAT(CASE WHEN a.Asi_Asistencia = 'Presente' THEN a.Asi_Fecha ELSE NULL END ORDER BY a.Asi_Fecha ASC SEPARATOR ', '), 'Sin registros') AS Fechas_Presente,
            COALESCE(GROUP_CONCAT(CASE WHEN a.Asi_Asistencia = 'Ausente' THEN a.Asi_Fecha ELSE NULL END ORDER BY a.Asi_Fecha ASC SEPARATOR ', '), 'Sin registros') AS Fechas_Ausente,
            COALESCE(GROUP_CONCAT(CASE WHEN a.Asi_Asistencia = 'Ausente Justificado' THEN a.Asi_Fecha ELSE NULL END ORDER BY a.Asi_Fecha ASC SEPARATOR ', '), 'Sin registros') AS Fechas_Ausente_Justificado

      FROM asistencia a
      JOIN estudiantes e ON a.Estudiantes_Est_Id = e.Est_Id
      JOIN materia_grado_seccion mgs ON a.Materia_grado_seccion_Mat_gra_sec_Id = mgs.Mat_gra_sec_Id
      JOIN materias m ON mgs.Materias_Mat_Id = m.Mat_Id
      WHERE 
          (e.Est_Id = ? OR ? IS NULL)
          AND e.Grado_Seccion_Id_Grado_Seccion = ?
          AND a.Asi_Fecha BETWEEN ? AND ?
    
      GROUP BY e.Est_Id, m.Mat_Nombre 
      ORDER BY e.Est_Id, m.Mat_Nombre;
    `;

    const params = [estudianteId, estudianteId, seccionId, fechaInicio, fechaFin];

    connection.query(query, params, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error al obtener informe de asistencia");
        }
        return res.status(200).send(results);
    });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error al obtener informe de asistencia");
    }
}

const GetInformeNotas = (req, res) => {

    try{
        const {estudianteID, seccionID, periodoID} = req.query;

        if (!seccionID || !periodoID) {
            return res.status(400).send("Faltan parámetros");
        }

        const query = `
      SELECT 
          e.Est_Id,
          e.Est_Identificacion,
          e.Est_Nombre,
          e.Est_PrimerApellido,
          e.Est_SegundoApellido,
          g.Gra_Nombre AS Grado,
          gs.Gra_Sec_Nombre AS Seccion,
          p.Per_Nombre AS Periodo,
          m.Mat_Nombre AS Materia,
          ev.Eva_Nombre AS Evaluacion,
          ev.Eva_Fecha AS Fecha_Evaluacion,
          ev.Eva_Porcentaje AS Porcentaje_Evaluacion,
          ev.Eva_Puntos AS Puntos_Evaluacion,
          ee.EvaEst_PuntosObtenidos AS Puntos_Obtenidos,
          ee.EvaEst_PorcentajeObtenido AS Porcentaje_Obtenido,
          ee.EvaEst_NotaFinal AS Nota_Final
      FROM evaluacion_estudiante ee
      INNER JOIN evaluaciones ev ON ee.Evaluaciones_Eva_Id = ev.Eva_Id
      INNER JOIN periodo p ON ev.Periodo_idPeriodo = p.Per_Id
      INNER JOIN estudiantes e ON ee.Estudiantes_Est_Id = e.Est_Id
      INNER JOIN grado_seccion gs ON e.Grado_Seccion_Id_Grado_Seccion = gs.Id_Grado_Seccion
      INNER JOIN grados g ON gs.Grados_idGrados = g.Gra_Id
      INNER JOIN materia_grado_seccion mgs ON ee.Materia_grado_seccion_Mat_gra_sec_Id = mgs.Mat_gra_sec_Id
      INNER JOIN materias m ON mgs.Materias_Mat_Id = m.Mat_Id
      WHERE 
          (e.Est_Id = ? OR ? IS NULL)
          AND gs.Id_Grado_Seccion = ?
          AND p.Per_Id = ?
    `;

        const params = [estudianteID, estudianteID, seccionID, periodoID];

        connection.query(query, params, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Error al obtener informe de notas");
            }
            return res.status(200).send(results);
        }); 

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error al obtener informe de notas");

    }

}

app.get("/informe/asistencia", GetInformeAsistencia);
app.get("/informe/notas", GetInformeNotas);

module.exports = app;