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


const MenuDatosImportantes = () => {
    const navigate = useNavigate();
   
    const opcionesMenu = [
        {
            nombre: "Mis datos personales",
            imagen: DatosImportantes,
            color: "#AA98A9",
            onClick: () => navigate('/MisDatosPersonalesPage'),
        },
        {
            nombre: "Instituciones",
            imagen: General,
            color: "#F9A825",
            onClick: () => navigate("/InstitucionesPage"),
        },
        {
            nombre: "Ingresar Sección",
            imagen: Evaluacion,
            color: "#00EBF7",
            onClick: () => navigate("/IngresaSeccionPage"),
        },
        {
            nombre: "Rubros del periodo",
            imagen: Herramientas,
            color: "#F1948A",
            onClick: () => navigate("/RubrosPeriodoPage"),
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

export default MenuDatosImportantes;