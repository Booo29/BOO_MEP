const express = require("express");
const app = express.Router();

const { connection } = require("../config");

// const GetCiclos = (req, res) => {
//     const { idInstitucion } = req.params;

//     connection.query("SELECT * FROM ciclo WHERE Cic_Estado = 'A' AND Instituciones_idInstituciones = ?",[idInstitucion], (err, results) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).send("Error al obtener ciclos");
//         } else {
//             return res.status(200).json(results);
//         }
//     });
// }


// const PostCiclo = (req, res) => {
//     const { fechaInicio, fechaFin, idInstitucion } = req.body;

//     if (fechaInicio && fechaFin && idInstitucion) {
//         connection.query("INSERT INTO ciclo SET ?", [{Cic_Fecha_Inicio: fechaInicio, Cic_Fecha_Fin: fechaFin, Instituciones_idInstituciones: idInstitucion }], (err, results) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).send("Error al insertar ciclo");
//             } else {
//                 return res.status(200).send("Ciclo insertado");
//             }
//         });
//     } else {
//         return res.status(500).send("Campos incompletos");
//     }
// }

const GetCiclos = (req, res) => {
    const { idInstitucion } = req.params;

    const query = `
        SELECT 
            c.Cic_Id AS cicloId, 
            c.Cic_Fecha_Inicio AS fechaInicio, 
            c.Cic_Fecha_Fin AS fechaFin, 
            c.Cic_Estado AS estado, 
            p.Per_Id AS periodoId, 
            p.Per_Nombre AS nombre,
            p.Per_Estado AS estadoPeriodo
        FROM 
            ciclo c
        LEFT JOIN 
            periodo p ON c.Cic_Id = p.Ciclo_idCiclo
        WHERE 
            c.Cic_Estado = 'A' 
            AND c.Instituciones_idInstituciones = ?
            AND (p.Per_Estado = 'A' OR p.Per_Estado IS NULL)
    `;

    connection.query(query, [idInstitucion], (err, results) => {
        if (err) {
            console.error("Error al obtener ciclos:", err);
            return res.status(500).send("Error al obtener ciclos");
        }

        // Transformar los resultados en un formato agrupado
        const ciclos = results.reduce((acc, row) => {
            const { cicloId, fechaInicio, fechaFin, estado, periodoId, nombre } = row;

            // Buscar si el ciclo ya existe en la agrupación
            let ciclo = acc.find(c => c.cicloId === cicloId);
            if (!ciclo) {
                // Si no existe, agregar un nuevo ciclo al arreglo
                ciclo = {
                    cicloId,
                    fechaInicio,
                    fechaFin,
                    estado,
                    periodos: [] // Inicializar el array de períodos
                };
                acc.push(ciclo);
            }

            // Si el período existe y está activo, agregarlo al ciclo
            if (periodoId && nombre) {
                ciclo.periodos.push({
                    periodoId,
                    nombre
                });
            }

            return acc;
        }, []);

        return res.status(200).json(ciclos);
    });
};


const PostCiclo = (req, res) => {
    const { fechaInicio, fechaFin, idInstitucion, periodos } = req.body;

    if (!fechaInicio || !fechaFin || !idInstitucion) {
        return res.status(400).send("Campos incompletos para el ciclo");
    }

    if (!Array.isArray(periodos) || periodos.length === 0) {
        return res.status(400).send("Se requiere al menos un período");
    }

    connection.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción");
        }

        const cicloQuery = "INSERT INTO ciclo SET ?";
        const cicloValues = {
            Cic_Fecha_Inicio: fechaInicio,
            Cic_Fecha_Fin: fechaFin,
            Instituciones_idInstituciones: idInstitucion
        };

        // Insertar el ciclo
        connection.query(cicloQuery, cicloValues, (err, results) => {
            if (err) {
                console.error("Error al insertar ciclo:", err);
                return connection.rollback(() => {
                    res.status(500).send("Error al insertar ciclo");
                });
            }

            const cicloId = results.insertId; // ID del ciclo recién creado

            // Preparar los períodos
            const periodosValues = periodos.map(periodo => [periodo.nombre, cicloId]);
            const periodosQuery = `
                INSERT INTO periodo (Per_Nombre, Ciclo_idCiclo)
                VALUES ?
            `;

            // Insertar los períodos
            connection.query(periodosQuery, [periodosValues], (err, results) => {
                if (err) {
                    console.error("Error al insertar períodos:", err);
                    return connection.rollback(() => {
                        res.status(500).send("Error al insertar períodos");
                    });
                }

                // Confirmar la transacción
                connection.commit(err => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return connection.rollback(() => {
                            res.status(500).send("Error al confirmar la transacción");
                        });
                    }

                    // Respuesta exitosa
                    return res.status(200).json({
                        message: "Ciclo y períodos insertados correctamente",
                        cicloId,
                        insertedPeriodos: results.affectedRows
                    });
                });
            });
        });
    });
};


// const PutCiclo = (req, res) => {
//     const { fechaInicio, fechaFin, idCiclo, periodos } = req.body;

//     // Verificamos que los campos principales existan
//     if (fechaInicio && fechaFin && idCiclo) {
//         // Iniciamos la transacción
//         connection.beginTransaction((err) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).send("Error al iniciar la transacción");
//             }

//             // Actualizamos la tabla ciclo
//             connection.query(
//                 "UPDATE ciclo SET ? WHERE Cic_Id = ?",
//                 [{ Cic_Fecha_Inicio: fechaInicio, Cic_Fecha_Fin: fechaFin }, idCiclo],
//                 (err, results) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             console.log(err);
//                             return res.status(500).send("Error al actualizar ciclo");
//                         });
//                     } else {
//                         // Ahora gestionamos los periodos si es necesario
//                         if (periodos && Array.isArray(periodos)) {
//                             // Procesamos cada periodo: agregar, actualizar o eliminar
//                             periodos.forEach((periodo) => {
//                                 if (periodo.action === 'add') {
//                                     // Agregar nuevo periodo
//                                     connection.query(
//                                         "INSERT INTO periodo (Per_Nombre, Cic_Id) VALUES (?, ?)",
//                                         [periodo.nombre, idCiclo],
//                                         (err, results) => {
//                                             if (err) {
//                                                 connection.rollback(() => {
//                                                     console.log(err);
//                                                     return res.status(500).send("Error al agregar periodo");
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 } else if (periodo.action === 'delete') {
//                                     // Editar periodo existente
//                                     connection.query(
//                                         "UPDATE periodo SET Per_Estado = 'I' WHERE Per_Id = ? AND Cic_Id = ?",
//                                         [periodo.id, idCiclo],
//                                         (err, results) => {
//                                             if (err) {
//                                                 connection.rollback(() => {
//                                                     console.log(err);
//                                                     return res.status(500).send("Error al editar periodo");
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 }
//                             });
//                         }

//                         // Finalizamos la transacción
//                         connection.commit((err) => {
//                             if (err) {
//                                 connection.rollback(() => {
//                                     console.log(err);
//                                     return res.status(500).send("Error al completar la transacción");
//                                 });
//                             } else {
//                                 return res.status(200).send("Ciclo y períodos actualizados");
//                             }
//                         });
//                     }
//                 }
//             );
//         });
//     } else {
//         return res.status(500).send("Campos incompletos");
//     }
// };



const PutCiclo = (req, res) => {
    const {fechaInicio, fechaFin, idCiclo } = req.body;

    if (fechaInicio && fechaFin &&  idCiclo) {
        connection.query("UPDATE ciclo SET ? WHERE Cic_Id = ?", [{Cic_Fecha_Inicio: fechaInicio, Cic_Fecha_Fin: fechaFin, }, idCiclo], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar ciclo");
            } else {
                return res.status(200).send("Ciclo actualizado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

const DeleteCiclo = (req, res) => {
    const { idCiclo } = req.params;

    if (idCiclo) {
        connection.query("UPDATE ciclo SET Cic_Estado = 'I' WHERE Cic_Id = ?", [idCiclo], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al eliminar ciclo");
            } else {
                return res.status(200).send("Ciclo eliminado");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
}

app.get("/ciclo/:idInstitucion", GetCiclos);
app.post("/ciclo", PostCiclo);
app.put("/ciclo", PutCiclo);
app.delete("/ciclo/:idCiclo", DeleteCiclo);

module.exports = app;