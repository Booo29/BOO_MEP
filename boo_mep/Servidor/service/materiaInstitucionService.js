const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetMateriasInstitucion = (req, res) => {
    const { idInstitucion } = req.params;
    connection.query("SELECT * FROM materia_institucion m, materias t WHERE m.Mat_Ins_Estado = 'A' AND m.Instituciones_Inst_Id = ? AND t.Mat_Id = m.Materias_Mat_Id", [idInstitucion], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener materias");
        } else {
            return res.status(200).json(results);
        }
    });
}

// const PostMateriaInstitucion = (req, res) => {
//     const { idMateria, idInstitucion } = req.body;

//     if (idMateria && idInstitucion) {
//         connection.query("INSERT INTO materia_institucion SET ?", [{ Materias_Mat_Id: idMateria, Instituciones_Inst_Id: idInstitucion }], (err, results) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).send("Error al insertar materia");
//             } else {
//                 return res.status(200).send("Materia insertada");
//             }
//         });
//     } else {
//         return res.status(500).send("Campos incompletos");
//     }
// }

const PostMateriaInstitucion = (req, res) => {
    const { materias } = req.body; // Se espera un arreglo de objetos con idMateria e idInstitucion

    if (!materias || !Array.isArray(materias) || materias.length === 0) {
        return res.status(400).send("Se requiere un arreglo de materias con idMateria e idInstitucion");
    }

    const values = materias.map(materia => [materia.idMateria, materia.idInstitucion]);

    // Validamos que todas las materias tengan los campos necesarios
    if (values.some(([idMateria, idInstitucion]) => !idMateria || !idInstitucion)) {
        return res.status(400).send("Todos los elementos deben contener idMateria e idInstitucion válidos");
    }

    // Construimos la consulta para insertar múltiples filas
    const query = `
        INSERT INTO materia_institucion (Materias_Mat_Id, Instituciones_Inst_Id)
        VALUES ?
    `;

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error al insertar materias");
        }
        return res.status(200).send(`Se insertaron ${results.affectedRows} materias correctamente`);
    });
};


const PutMateriaInstitucion = (req, res) => {
    const { idMateria, idInstitucion, idMatIns } = req.body;

    if (idMateria && idInstitucion && idMatIns) {
        connection.query("UPDATE materia_institucion SET ? WHERE Mat_Ins_Id = ?", [{ Materias_Mat_Id: idMateria, Instituciones_Inst_Id: idInstitucion }, idMatIns], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar materia");
            } else {
                return res.status(200).send("Materia actualizada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteMateriaInstitucion = (req, res) => {
    const { idMatIns } = req.params;

    if (idMatIns) {
        connection.query("UPDATE materia_institucion SET Mat_Ins_Estado = 'I' WHERE Mat_Ins_Id = ?", [idMatIns], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar materia");
            } else {
                return res.status(200).send("Materia eliminada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

app.get("/materiaInstitucion/:idInstitucion", GetMateriasInstitucion);
app.post("/materiaInstitucion", PostMateriaInstitucion);
app.put("/materiaInstitucion", PutMateriaInstitucion);
app.delete("/materiaInstitucion/:idMatIns", DeleteMateriaInstitucion);

module.exports = app;