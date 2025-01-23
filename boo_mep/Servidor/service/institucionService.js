const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const GetInstituciones = (req, res) => {
    const { idProfesor } = req.params;

    connection.query("SELECT * FROM instituciones WHERE Inst_Estado = 'A' AND Profesores_idProfesores = ?", [idProfesor], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener instituciones");
        } else {
            return res.status(200).json(results);
        }
    });
}

const GetInstitucion = (req, res) => {
    const { idInstitucion } = req.params;

    connection.query("SELECT * FROM instituciones WHERE Inst_Estado = 'A' AND Inst_Id = ?", [idInstitucion], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al obtener institucion");
        } if(results.length > 0) {
            return res.status(200).json(results[0]);
        }else {
            return res.status(404).json({ message: "Institución no encontrada" });
        }
    });
}

// const PostInstitucion = (req, res) => {
//     const { nombre, tipo, direccionRegional, circuito, idProfesor } = req.body;

//     if (nombre && tipo && direccionRegional && circuito && idProfesor) {
//         connection.query("INSERT INTO instituciones SET ?", [{ Inst_Nombre: nombre, Inst_Tipo: tipo, Inst_DireccionRegional: direccionRegional, Inst_Circuito: circuito, Profesores_idProfesores: idProfesor }], (err, results) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).send("Error al insertar institucion");
//             } else {
//                 return res.status(200).send("Institucion insertada");
//             }
//         });
//     } else {
//         return res.status(500).send("Campos incompletos");
//     }
// }

const PostInstitucion = (req, res) => {
    const { nombre, tipo, direccionRegional, circuito, idProfesor } = req.body;

    if (nombre && tipo && direccionRegional && circuito && idProfesor) {
        const query = "INSERT INTO instituciones SET ?";
        const values = {
            Inst_Nombre: nombre,
            Inst_Tipo: tipo,
            Inst_DireccionRegional: direccionRegional,
            Inst_Circuito: circuito,
            Profesores_idProfesores: idProfesor
        };

        connection.query(query, [values], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error al insertar institución");
            } else {
                // Devolver el ID recién creado
                return res.status(200).json({
                    message: "Institución insertada correctamente",
                    Inst_Id: results.insertId
                });
            }
        });
    } else {
        return res.status(400).send("Campos incompletos");
    }
};


const PutInstitucion = (req, res) => {
    const { nombre, tipo, direccionRegional, circuito, idInstitucion } = req.body;

    if (nombre && tipo && direccionRegional && circuito && idInstitucion) {
        connection.query("UPDATE instituciones SET ? WHERE Inst_Id = ?", [{ Inst_Nombre: nombre, Inst_Tipo: tipo, Inst_DireccionRegional: direccionRegional, Inst_Circuito: circuito }, idInstitucion], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar institucion");
            } else {
                return res.status(200).send("Institucion actualizada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteInstitucion = (req, res) => {
    const { idInstitucion } = req.params;

    if (idInstitucion) {
        connection.query("UPDATE instituciones SET Inst_Estado = 'I' WHERE Inst_Id = ?", [idInstitucion], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar institucion");
            } else {
                return res.status(200).send("Institucion eliminada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const PostInstitucionConMaterias = (req, res) => {
    const { nombre, tipo, direccionRegional, circuito, idProfesor, materiasSeleccionadas } = req.body;

    if (nombre && tipo && direccionRegional && circuito && idProfesor && Array.isArray(materiasSeleccionadas) && materiasSeleccionadas.length > 0) {

        const materiasIds = materiasSeleccionadas.map((materia) => materia.Mat_Id);
        // Inicia una transacción
        connection.beginTransaction((err) => {
            if (err) {
                console.error("Error al iniciar transacción:", err);
                return res.status(500).send("Error al iniciar transacción");
            }

            // Inserta la institución
            connection.query(
                "INSERT INTO instituciones SET ?",
                [
                    {
                        Inst_Nombre: nombre,
                        Inst_Tipo: tipo,
                        Inst_DireccionRegional: direccionRegional,
                        Inst_Circuito: circuito,
                        Profesores_idProfesores: idProfesor,
                    },
                ],
                (err, results) => {
                    if (err) {
                        console.error("Error al insertar institución:", err);
                        return connection.rollback(() => {
                            res.status(500).send("Error al insertar institución");
                        });
                    }

                    const idInstitucion = results.insertId; // Obtén el ID de la institución recién creada

                    // Prepara las consultas para insertar las materias
                    console.log("Materias backend:", materiasSeleccionadas);
                    const materiasData = materiasIds.map((idMateria) => [
                        idMateria,
                        idInstitucion,
                    ]);

                    console.log("Materias data:", materiasData);

                    connection.query(
                        "INSERT INTO materia_institucion (Materias_Mat_Id, Instituciones_Inst_Id) VALUES ?",
                        [materiasData],
                        (err) => {
                            if (err) {
                                console.error("Error al insertar materias por institución:", err);
                                return connection.rollback(() => {
                                    res.status(500).send("Error al insertar materias por institución");
                                });
                            }

                            // Confirma la transacción
                            connection.commit((err) => {
                                if (err) {
                                    console.error("Error al confirmar transacción:", err);
                                    return connection.rollback(() => {
                                        res.status(500).send("Error al confirmar transacción");
                                    });
                                }

                                res.status(200).send("Institución y materias creadas exitosamente");
                            });
                        }
                    );
                }
            );
        });
    } else {
        res.status(400).send("Campos incompletos");
    }
};


// const GetInstitucionesMaterias = (req, res) => {
//     const { idProfesor } = req.params;

//     connection.query("SELECT " +
//                         "i.Inst_Id," +
//                         "i.Inst_Nombre, " +
//                         "i.Inst_Tipo, " +
//                         "i.Inst_DireccionRegional, " +
//                         "i.Inst_Circuito, " +
//                         "i.Profesores_idProfesores, " +
//                         "GROUP_CONCAT(t.Mat_Nombre SEPARATOR ', ') AS Materias " +
//                         "FROM " +
//                             "instituciones AS i " +
//                         "INNER JOIN " +
//                             "materia_institucion AS m ON m.Instituciones_Inst_Id = i.Inst_Id " +
//                         "INNER JOIN " +
//                             "materias AS t ON t.Mat_Id = m.Materias_Mat_Id " +
//                         "WHERE " +
//                             "i.Inst_Estado = 'A' " +
//                             "AND m.Mat_Ins_Estado = 'A' " +
//                             "AND i.Profesores_idProfesores = ? " +
//                             "GROUP BY i.Inst_Id, i.Inst_Nombre; "
//         , [idProfesor], (err, results) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).send("Error al obtener instituciones");
//         } else {
//             return res.status(200).json(results);
//         }
//     });
// }

const GetInstitucionesMaterias = (req, res) => {
    const { idProfesor } = req.params;

    connection.query(
        `
        SELECT 
            i.Inst_Id,
            i.Inst_Nombre,
            i.Inst_Tipo,
            i.Inst_DireccionRegional,
            i.Inst_Circuito,
            i.Profesores_idProfesores,
            GROUP_CONCAT(t.Mat_Nombre SEPARATOR ', ') AS Materias
        FROM 
            instituciones AS i
        LEFT JOIN 
            materia_institucion AS m ON m.Instituciones_Inst_Id = i.Inst_Id AND m.Mat_Ins_Estado = 'A'
        LEFT JOIN 
            materias AS t ON t.Mat_Id = m.Materias_Mat_Id
        WHERE 
            i.Inst_Estado = 'A'
            AND i.Profesores_idProfesores = ?
        GROUP BY 
            i.Inst_Id, i.Inst_Nombre, i.Inst_Tipo, i.Inst_DireccionRegional, i.Inst_Circuito, i.Profesores_idProfesores;
        `,
        [idProfesor],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al obtener instituciones");
            } else {
                return res.status(200).json(results);
            }
        }
    );
};



app.get("/institucion/:idProfesor", GetInstituciones);
app.get("/institucionById/:idInstitucion", GetInstitucion);
app.post("/institucion", PostInstitucion);
app.put("/institucion", PutInstitucion);
app.delete("/institucion/:idInstitucion", DeleteInstitucion);
app.post("/institucionConMaterias", PostInstitucionConMaterias);
app.get("/institucionMaterias/:idProfesor", GetInstitucionesMaterias);

module.exports = app;