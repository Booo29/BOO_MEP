const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const PostSeccionMateria = (req, res) => {
    const { Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id, Instituciones_Inst_Id, materias } = req.body;

    if (!Gra_Sec_Nombre || !Grados_idGrados || !Ciclo_Cic_Id || !Instituciones_Inst_Id || !Array.isArray(materias)) {
        return res.status(400).json({ error: "Campos incompletos o formato incorrecto" });
      }

    connection.beginTransaction(err => {

        if (err) {
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
          }
      
          // Insertar en grado_seccion
          const insertGradoSeccionQuery = `
            INSERT INTO grado_seccion (Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id)
            VALUES (?, ?, ?)
          `;
          connection.query(insertGradoSeccionQuery, [Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id], (err, result) => {
            if (err) {
              console.error("Error al insertar en grado_seccion:", err);
              return connection.rollback(() => {
                res.status(500).json({ error: "Error al registrar la sección" });
              });
            }
            const idGradoSeccion = result.insertId;
      
            // Insertar en materia_grado_seccion para cada materia seleccionada
            const insertMateriaQuery = `
              INSERT INTO materia_grado_seccion (Grado_Seccion_Id_Grado_Seccion, Materias_Mat_Id, Instituciones_Inst_Id)
              VALUES ?
            `;
            const valores = materias.map(matId => [idGradoSeccion, matId, Instituciones_Inst_Id]);
      
            connection.query(insertMateriaQuery, [valores], (err) => {
              if (err) {
                console.error("Error al insertar en materia_grado_seccion:", err);
                return connection.rollback(() => {
                  res.status(500).json({ error: "Error al registrar las materias de la sección" });
                });
              }
              connection.commit((err) => {
                if (err) {
                  console.error("Error al confirmar la transacción:", err);
                  return connection.rollback(() => {
                    res.status(500).json({ error: "Error al registrar la sección" });
                  });
                }
                res.status(200).json({
                  message: "Sección y materias registradas correctamente",
                  gradoSeccion: { id: idGradoSeccion, Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id },
                  materias: materias
                });
              });
            });
          });
    });
};


const GetSeccionesMaterias = (req, res) => {
    const { cicloId, institucionId } = req.query;

    if (!cicloId || !institucionId) {
      return res.status(400).json({ error: "Faltan parámetros (cicloId e institucionId)" });
    }
  
    const query = `
      SELECT 
        gs.Id_Grado_Seccion,
        gs.Gra_Sec_Nombre,
        g.Gra_Nombre,
        GROUP_CONCAT(m.Mat_Nombre SEPARATOR ', ') AS materias
      FROM grado_seccion gs
      JOIN grados g ON gs.Grados_idGrados = g.Gra_Id
      LEFT JOIN materia_grado_seccion mgs ON gs.Id_Grado_Seccion = mgs.Grado_Seccion_Id_Grado_Seccion
      LEFT JOIN materias m ON mgs.Materias_Mat_Id = m.Mat_Id
      WHERE gs.Ciclo_Cic_Id = ? 
        AND mgs.Instituciones_Inst_Id = ?
      GROUP BY gs.Id_Grado_Seccion, gs.Gra_Sec_Nombre, g.Gra_Nombre
      ORDER BY g.Gra_Nombre, gs.Gra_Sec_Nombre;
    `;
  
    connection.query(query, [cicloId, institucionId], (err, results) => {
      if (err) {
        console.error("Error al obtener secciones:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.status(200).json(results);
    });
};


const PutSeccionMateria = (req, res) => {
    const seccionId = req.params.id;
    const { Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id, Instituciones_Inst_Id, materias } = req.body;
  
    if (!Gra_Sec_Nombre || !Grados_idGrados || !Ciclo_Cic_Id || !Instituciones_Inst_Id || !Array.isArray(materias)) {
      return res.status(400).json({ error: "Campos incompletos o formato incorrecto" });
    }
  
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar transacción:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
  
      // Actualizar grado_seccion
      const updateGradoSeccionQuery = `
        UPDATE grado_seccion
        SET Gra_Sec_Nombre = ?, Grados_idGrados = ?, Ciclo_Cic_Id = ?
        WHERE Id_Grado_Seccion = ?
      `;
      connection.query(updateGradoSeccionQuery, [Gra_Sec_Nombre, Grados_idGrados, Ciclo_Cic_Id, seccionId], (err) => {
        if (err) {
          console.error("Error al actualizar grado_seccion:", err);
          return connection.rollback(() => {
            res.status(500).json({ error: "Error al actualizar la sección" });
          });
        }
  
        // Eliminar las materias actuales de la sección
        const deleteMateriasQuery = `
          DELETE FROM materia_grado_seccion 
          WHERE Grado_Seccion_Id_Grado_Seccion = ? 
            AND Instituciones_Inst_Id = ?
        `;
        connection.query(deleteMateriasQuery, [seccionId, Instituciones_Inst_Id], (err) => {
          if (err) {
            console.error("Error al eliminar materias:", err);
            return connection.rollback(() => {
              res.status(500).json({ error: "Error al actualizar las materias" });
            });
          }
  
          // Insertar las nuevas materias
          const insertMateriaQuery = `
            INSERT INTO materia_grado_seccion (Grado_Seccion_Id_Grado_Seccion, Materias_Mat_Id, Instituciones_Inst_Id)
            VALUES ?
          `;
          const valores = materias.map(matId => [seccionId, matId, Instituciones_Inst_Id]);
  
          connection.query(insertMateriaQuery, [valores], (err) => {
            if (err) {
              console.error("Error al insertar nuevas materias:", err);
              return connection.rollback(() => {
                res.status(500).json({ error: "Error al actualizar las materias" });
              });
            }
  
            connection.commit((err) => {
              if (err) {
                console.error("Error al confirmar la transacción:", err);
                return connection.rollback(() => {
                  res.status(500).json({ error: "Error al actualizar la sección" });
                });
              }
              res.status(200).json({ message: "Sección actualizada correctamente." });
            });
          });
        });
      });
    });
};


const DeleteSeccionMateria = (req, res) => {
    const seccionId = req.params.id;
    const { institucionId } = req.query;
  
    if (!institucionId) {
      return res.status(400).json({ error: "El parámetro institucionId es obligatorio." });
    }
  
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar la transacción:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
  
      const deleteMateriasQuery = `
        DELETE FROM materia_grado_seccion 
        WHERE Grado_Seccion_Id_Grado_Seccion = ? 
          AND Instituciones_Inst_Id = ?
      `;
      connection.query(deleteMateriasQuery, [seccionId, institucionId], (err) => {
        if (err) {
          console.error("Error al eliminar materias:", err);
          return connection.rollback(() => {
            res.status(500).json({ error: "Error al eliminar la sección" });
          });
        }
  
        const deleteSeccionQuery = `
          DELETE FROM grado_seccion
          WHERE Id_Grado_Seccion = ?
        `;
        connection.query(deleteSeccionQuery, [seccionId], (err) => {
          if (err) {
            console.error("Error al eliminar la sección:", err);
            return connection.rollback(() => {
              res.status(500).json({ error: "Error al eliminar la sección" });
            });
          }
  
          connection.commit((err) => {
            if (err) {
              console.error("Error al confirmar la transacción:", err);
              return connection.rollback(() => {
                res.status(500).json({ error: "Error al eliminar la sección" });
              });
            }
            res.status(200).json({ message: "Sección eliminada correctamente." });
          });
        });
      });
    });
};

app.post("/edicionseccion", PostSeccionMateria);
app.get("/edicionseccion", GetSeccionesMaterias);
app.put("/edicionseccion/:id", PutSeccionMateria);
app.delete("/edicionseccion/:id", DeleteSeccionMateria);

module.exports = app;