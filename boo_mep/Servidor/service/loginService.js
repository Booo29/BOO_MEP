const express = require("express");
const app = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { connection } = require("../config");

const PostLogin = (req, res) => {
    const { usuario, password } = req.body;
    if (usuario && password) {
        connection.query("SELECT * FROM usuarios u, profesores p WHERE u.Usu_Usuario = ? AND u.Usu_Estado = 'A' AND u.Usu_Id = p.Usuarios_idUsuarios", [usuario], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al obtener usuario");
            } else {
                if (results.length > 0) {
                    const comparacion = bcrypt.compareSync(password, results[0].Usu_Clave);
                    if (comparacion) {
                        const token = jwt.sign({ id: results[0].Usu_Id, profesor: results[0].Prof_Nombre, identificacion: results[0].Prof_Identificacion }, "boomep", {
                            expiresIn: 300
                        });
                        return res.status(200).json({ token: token });
                        
                    } else {
                        return res.status(500).send("Contraseña incorrecta");
                    }
                } else {
                    return res.status(500).send("El usuario no existe");
                }
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
};

const PostRegister = (req, res) => {
    const {
        usuario,
        password,
        identificacion,
        nombre,
        primerApellido,
        segundoApellido,
        correo
    } = req.body;

    if (usuario && password && identificacion && nombre && primerApellido && correo) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        // Inserta en la tabla 'usuarios'
        connection.query(
            "INSERT INTO usuarios SET ?",
            [{ Usu_Usuario: usuario, Usu_Clave: hash }],
            (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error al crear usuario");
                }

                const userId = results.insertId; // Obtén el ID del usuario recién creado

                // Inserta en la tabla 'profesores'
                const profesorData = {
                    Prof_Identificacion: identificacion,
                    Prof_Nombre: nombre,
                    Prof_PrimerApellido: primerApellido,
                    Prof_SegundoApellido: segundoApellido || "", // Si no se envía, dejar vacío
                    Prof_Correo: correo,
                    Usuarios_idUsuarios: userId
                };

                connection.query(
                    "INSERT INTO profesores SET ?",
                    profesorData,
                    (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send("Error al crear profesor");
                        }

                        return res.status(200).send("Usuario y profesor creados exitosamente");
                    }
                );
            }
        );
    } else {
        return res.status(500).send("Campos incompletos");
    }
};



const PutPassword = (req, res) => {
    const { userId, password } = req.body;
    console.log("datos", userId, password);
    if (userId && password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        connection.query(`UPDATE usuarios SET Usu_Clave = '${hash}' WHERE Usu_Id = ${userId}`, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al actualizar contraseña");
            } else {
                console.log("resultadito", results);
                return res.status(200).send("Contraseña actualizada");
            }
        });
    } else {
        return res.status(500).send("Campos incompletos");
    }
};

app.post("/user/login", PostLogin);
app.post("/user/register", PostRegister);
app.put("/user/password", PutPassword);

module.exports = app;