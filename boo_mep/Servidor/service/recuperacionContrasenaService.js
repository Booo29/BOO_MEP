const express = require("express");
const app = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { connection } = require("../config");

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);  // Genera un número aleatorio entre 100000 y 999999
};

const PostRecuperacionContrasena = (req, res) => {
    const { email } = req.body;

    if (email) {
        connection.query("SELECT u.Usu_Id, p.Prof_Nombre, p.Prof_PrimerApellido, p.Prof_SegundoApellido FROM usuarios u JOIN profesores p ON u.Usu_Id = p.Usuarios_idUsuarios WHERE p.Prof_Correo = ?", [email], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error al obtener usuario");
            } else if (results.length > 0) {
                const user = results[0];
                const verificationCode = generateVerificationCode();  
                const token = jwt.sign({ id: user.Usu_Id, codigoVerificacion: verificationCode }, "boomep", { expiresIn: "5m" });

                // Configurar el transporter de nodemailer
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "eduplancostarica@gmail.com",
                        pass: "qviv wbop wzdg ktxm",
                    },
                });

                // Configurar el correo electrónico
                const mailOptions = {
                    from: "eduplancostarica@gmail.com",
                    to: email,
                    subject: 'Recuperación de contraseña',
                    text: `Estimado(a) ${results[0].Prof_Nombre } ${results[0].Prof_PrimerApellido} ${results[0].Prof_SegundoApellido},\n\n
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar con el proceso, utiliza el siguiente código de verificación:\n\n
                    🔑 **Código de verificación:** ${verificationCode} \n\n
                    Este código tiene una validez de **5 minutos**. Si no utilizas el código dentro de este tiempo, deberás solicitar uno nuevo.\n\n
                    Si no realizaste esta solicitud, puedes ignorar este mensaje. Tu cuenta permanecerá segura.\n\n
                    Para cualquier consulta o asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte.\n\n
                    Atentamente,\n\n
                    Equipo de Soporte.`
                };

                // Enviar el correo electrónico
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).send("Error al enviar el correo electrónico");
                    } else {
                        return res.status(200).json({ token: token, message: "Código de verificación enviado al correo electrónico" });
                    }
                });
            } else {
                return res.status(404).send("Usuario no encontrado");
            }
        });
    } else {
        return res.status(400).send("Campo de email requerido");
    }
}
const PutRecuperacionContrasena = (req, res) => {
    const { token, newPassword } = req.body;

    if (token && newPassword) {
        jwt.verify(token, "boomep", (err, decoded) => {
            if (err) {
                return res.status(401).send("Token inválido o expirado");
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(newPassword, salt);
                connection.query("UPDATE usuarios SET Usu_Clave = ? WHERE Usu_Id = ?", [hashedPassword, decoded.id], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error al actualizar la contraseña");
                    } else {
                        console.log("results", results);
                        return res.status(200).send("Contraseña actualizada con éxito");
                    }
                });
            }
        });
    } else {
        return res.status(400).send("Campos incompletos");
    }
}

app.post("/recuperacionContrasena", PostRecuperacionContrasena);
app.put("/recuperacionContrasena", PutRecuperacionContrasena);

module.exports = app;