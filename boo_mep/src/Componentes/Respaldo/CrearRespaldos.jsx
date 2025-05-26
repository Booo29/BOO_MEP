import React, { useState } from "react";

import {crearRespaldo} from "../../Servicios/RespaldoService"; 
import { useNavigate } from 'react-router-dom';
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const CrearRespaldos = () => {
  const [respaldoUrl, setRespaldoUrl] = useState(null);
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const crearRespaldoOneDrive = async () => {
    const res = await crearRespaldo();    
    const url = `http://localhost:3000/${res.filePath}`;
    setRespaldoUrl(url);
  };

  const handleMenu = () => {
    navigate('/MenuPage');
  };

  return (
    <div style={{padding: "20px"}} >
        <Button label="Regresar" severity="help" onClick={handleMenu} />
        <div className="p-fluid" >
            <h1 style={{fontSize: "2em", fontWeight: "bold", marginLeft: "1%"}}>Creación de Respaldo</h1>
            <Toast ref={toast} />
            <div style={{marginLeft: "1%"}}>
                <Button label="Crear Respaldo" icon="pi pi-check" severity="success" onClick={crearRespaldoOneDrive}  />
            </div>
            {respaldoUrl && (
                <div style={{marginLeft: "1%", marginTop: "20px"}}>
                    <a href={respaldoUrl} download="respaldo.sql">
                        <Button label="Descargar Respaldo" icon="pi pi-download" severity="info"  />
                    </a>
                </div>
            )}
        </div>
        <div style={{marginLeft: "1%"}}>
            <h2 style={{fontSize: "1.5em", fontWeight: "bold"}}>Instrucciones</h2>
            <p style={{fontSize: "1.2em"}}>1. Haga clic en el botón "Crear Respaldo" para generar un respaldo de la base de datos.</p>
            <p style={{fontSize: "1.2em"}}>2. Una vez creado el respaldo, haga clic en el botón "Descargar Respaldo" para descargar el archivo.</p>

            <p style={{fontSize: "1.2em"}}>3. El archivo se descargará automáticamente en su computadora.</p>
            <p style={{fontSize: "1.2em"}}>4. Asegúrese de guardar el archivo en un lugar seguro.</p>
            <p style={{fontSize: "1.2em"}}>5. Si tiene alguna pregunta o necesita ayuda, no dude en ponerse en contacto con el soporte técnico.</p>
        </div>
    </div>
  );
}

export default CrearRespaldos;
