const express = require("express");
const app = express();

//nos ayuda a analizar el cuerpo de la solicitud POST
app.use(express.json());

app.use(express.urlencoded({extended: true}));

var cors = require('cors')
app.use(cors())

app.use(require('./service/loginService.js'));
app.use(require('./service/institucionService.js'));
app.use(require('./service/cicloService.js'));
app.use(require('./service/materiaService.js'));
app.use(require('./service/materiaInstitucionService.js'));


app.listen(3000, () => {
    console.log("El servidor está inicializado en el puerto 3000");
});


module.exports = app;