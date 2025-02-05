import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "./Menu.css";
import Card from "../Card/Card";
import { Button } from "primereact/button";
import DatosImportantes from "../../Recursos/icono_Datos.png";
import CrearEvaluacion from "../../Recursos/icono_CrearEvaluacion.png";
import Evaluacion from "../../Recursos/icono_Evaluacion.png";
import Asistencia from "../../Recursos/icono_Asistencia.png";
import Informes from "../../Recursos/icono_informe.png";
import Tutoriales from "../../Recursos/icono_tutorial.png";
import Cronicas from "../../Recursos/icono_cronica.png";


const Menu = () => {
    const navigate = useNavigate();
   
    const opcionesMenu = [
        {
            nombre: "Asistencia",
            imagen: Asistencia,
            color: "#AA98A9",
            onClick: () => navigate('/AsistenciaPage'),
        },
        {
            nombre: "Listas de Estudiantes",
            imagen: DatosImportantes,
            color: "#F9A825",
            onClick: () => navigate("/ListasPage"),
        },
        {
            nombre: "Crear Evaluaciones",
            imagen: CrearEvaluacion,
            color: "#00EBF7",
            onClick: () => navigate("/EvaluacionesPage"),
        },
        {
            nombre: "Evaluar Estudiantes",
            imagen: Evaluacion,
            color: "#F1948A",
            onClick: () => navigate("/EvaluacionEstudiantePage"),
        },
        {
            nombre: "Informes",
            imagen: Informes,          
            color: "#42DC98",
            onClick: () => navigate("/InformesPage"),
        },

        {
            nombre: "Cronicas",
            imagen: Cronicas,           
            color: "#ea639a",
            onClick: () => navigate("/CronicasPage"),
        },

        {
            nombre: "Tutoriales",
            imagen: Tutoriales,           
            color: "#E262E8",
            onClick: () => navigate("/TutorialesPage"),
        },

    ];

    const handleMenu = () => {
        navigate('/InstitucionesPage');
      };
    

    return (
        <div style={{ padding: "16px" }} >
            <Button label="Regresar a las Instituciones" severity="help" onClick={handleMenu} />
            <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Menú Principal</h1>
            <div className="menu-page">
                {opcionesMenu.map((opcion, index) => (
                <Card key={index} {...opcion} />
                ))}
        </div>
    </div>
    );
}

export default Menu;