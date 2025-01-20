import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "./Menu.css";
import Card from "../Card/Card";
import DatosImportantes from "../../Recursos/icono_Datos.png";
import General from "../../Recursos/icono_General.png";
import Evaluacion from "../../Recursos/icono_Evaluacion.png";
import Herramientas from "../../Recursos/icono_Herramientas.png";
import Informes from "../../Recursos/icono_informe.png";
import Tutoriales from "../../Recursos/icono_tutorial.png";


const Menu = () => {
    const navigate = useNavigate();
   
    const opcionesMenu = [
        {
            nombre: "Datos importante",
            imagen: DatosImportantes,
            color: "#AA98A9",
            onClick: () => navigate('/MenuDatosImportantesPage'),
        },
        {
            nombre: "General o de uso diario",
            imagen: General,
            color: "#F9A825",
            onClick: () => navigate("/MenuGeneralPage"),
        },
        {
            nombre: "Evaluacion",
            imagen: Evaluacion,
            color: "#00EBF7",
            onClick: () => navigate("/MenuEvaluacionPage"),
        },
        {
            nombre: "Herramientas",
            imagen: Herramientas,
            color: "#F1948A",
            onClick: () => navigate("/MenuHerramientasPage"),
        },
        {
            nombre: "Informes",
            imagen: Informes,          
            color: "#42DC98",
            onClick: () => navigate("/MenuInformesPage"),
        },

        {
            nombre: "Tutoriales",
            imagen: Tutoriales,           
            color: "#E262E8",
            onClick: () => navigate("/MenuTutorialesPage"),
        },

    ];

    return (
        <div className="menu-page">
        {opcionesMenu.map((opcion, index) => (
          <Card key={index} {...opcion} />
        ))}
      </div>
    );
}

export default Menu;