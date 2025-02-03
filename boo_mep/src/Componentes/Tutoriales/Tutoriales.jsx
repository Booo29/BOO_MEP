import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const tutorials = [
  {
    title: "React Hooks - Introducción",
    description: "Aprende los fundamentos de los Hooks en React.",
    url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
  },
  {
    title: "PrimeReact UI Components",
    description: "Explora los componentes de PrimeReact y su uso.",
    url: "https://www.youtube.com/watch?v=xfD9uEq3z7Y",
  },
  {
    title: "React con TypeScript",
    description: "Cómo usar TypeScript en proyectos de React.",
    url: "https://www.youtube.com/watch?v=Z5iWr6Srsj8",
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
