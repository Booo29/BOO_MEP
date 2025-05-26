const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

app.use(express.urlencoded({extended: true}));

var cors = require('cors')
app.use(cors())

app.use(require('./service/loginService.js'));
app.use(require('./service/institucionService.js'));
app.use(require('./service/cicloService.js'));
app.use(require('./service/materiaService.js'));
app.use(require('./service/materiaInstitucionService.js'));
app.use(require('./service/periodoService.js'));
app.use(require('./service/gradoService.js'));
// app.use(require('./service/seccionService.js'));
app.use(require('./service/gradoSeccionService.js'));
app.use(require('./service/gradoSeccionMateriaService.js'));
app.use(require('./service/rubrosService.js'));
app.use(require('./service/estudianteService.js'));
app.use(require('./service/AsistenciaService.js'));
app.use(require('./service/EvaluacionService.js'));
app.use(require('./service/NotasService.js'));
app.use(require('./service/InformesService.js'));
app.use(require('./service/CronicasService.js'));
app.use(require('./service/edicionSeccionService.js'));
app.use(require('./service/recuperacionContrasenaService.js'));
app.use(require('./service/respaldoService.js'));

app.use("/backup", express.static(path.join(__dirname, "backup")));

app.listen(3000, () => {
    console.log("El servidor está inicializado en el puerto 3000");
});


module.exports = app;