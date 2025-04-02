import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const tutorials = [
  {
    title: "¿Cómo descargar e instalar la aplicación de EduPlan?",
    description: "Aprende como descargar e instalar la aplicación de EduPlan.",
    url: "https://youtu.be/yFUvDjwgo58",
  },
  {
    title: "¿Cómo crear un usuario?",
    description: "Aprende como crear un usuario.",
    url: "https://youtu.be/fUflqZeDK5g",
  },
  {
    title: "¿Cómo crear una institución?",
    description: "Aprende como crear una institución.",
    url: "https://youtu.be/g9ENuh1hLHY",
  },
  {
    title: "¿Cómo crear un ciclo lectivo?",
    description: "Aprende como crear un ciclo lectivo.",
    url: "https://youtu.be/H5v5AetwSH4",
  },
  {
    title: "¿Cómo pasar lista de asistencia?",
    description: "Aprende como pasar la lista de asistencia.",
    url: "https://youtu.be/YfxJXbkKad4",
  },
  {
    title: "¿Cómo crear una evaluación?",
    description: "Aprende como crear evaluaciones y asignarle notas a tus estudiantes.",
    url: "https://youtu.be/oRNSVai9XXE",
  },
  {
    title: "¿Como crear un informe",
    description: "Aprende como crear un informe.",
    url: "https://youtu.be/UbVWa-xvpSg",
  },
  {
    title: "¿Como recuperar mi contraseña?",
    description: "Aprende ha como recuperar mi contraseña.",
    url: "https://youtu.be/S9o3-OF8S50",
  },
];

const Tutoriales = () => {

    const navigate = useNavigate();

    const handleMenu = () => {
        navigate('/MenuPage');
      };


  return (
    <div style={{ padding: "16px" }} >
        <Button label="Regresar" severity="help" onClick={handleMenu} />
        <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>📚 Tutoriales Destacados</h1>
        <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((tutorial, index) => (
            <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="shadow-lg rounded-lg"
            >
                <Card title={tutorial.title} className="p-3" style={{ marginBottom: "20px" }}>
                <p className="text-gray-600 mb-2">{tutorial.description}</p>
                <Button
                    label="Ver Video"
                    icon="pi pi-video"
                    className="p-button-rounded p-button-outlined p-button-primary"
                    onClick={() => window.open(tutorial.url, "_blank")}
                />
                </Card>
            </motion.div>
            ))}
        </div>
    </div>
  );
};

export default Tutoriales;
