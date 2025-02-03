import React, { useState } from "react";
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { postCiclo } from "../../../Servicios/CicloService";
import useStore from "../../../store/store";
import useCicloStore from "../../../store/CicloStore";
import Swal from "sweetalert2";

const CiclosStep = () => {
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [numPeriodos, setNumPeriodos] = useState(0); 
  const [periodos, setPeriodos] = useState([]);

  const idInstitucion = useStore((state) => state.institutionId);
  const setCicloId = useCicloStore((state) => state.setCicloId);

  const handleSaveCiclo = async () => {

    try {

        const cantidadPeriodos = parseInt(document.getElementById("periodo").value, 10);

        const periodos = Array.from({ length: cantidadPeriodos }, (_, index) => ({
          nombre: `${index + 1} periodo`,
        }));
    
        const cicloData = {
          fechaInicio,
          fechaFin,
          idInstitucion,
          periodos,
        };
        const response = await postCiclo(cicloData);
        console.log("response", response);
        const cicloId = response.cicloId;
        setCicloId(cicloId);
        Swal.fire({
          icon: 'success',
          title: 'Ciclo creado correctamente',
          showConfirmButton: false,
          position: 'top-end',
          timer: 1500
        });
    } catch (error) {
      console.error("Error saving ciclo:", error);
    }
  };


  const generatePeriodos = (count) => {
    const generatedPeriodos = Array.from({ length: count }, (_, i) => `${i + 1} periodo`);
    setPeriodos(generatedPeriodos);
  };


  const handleNumPeriodosChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setNumPeriodos(value);
      generatePeriodos(value);
    } else {
      setNumPeriodos("");
      setPeriodos([]);
    }
  };


  return (
    <div>
        <div>
          <form onSubmit={(e) => { e.preventDefault()}}>
            <div className="p-field">
              <label htmlFor="fechaInicio" style={{fontWeight: "bold", fontSize: "25px"}}>Fecha de Inicio</label>
              <input id="fechaInicio" type="date" className="p-inputtext" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{fontSize: "20px"}} />
            </div>
            <div className="p-field">
              <label htmlFor="fechaFin" style={{fontWeight: "bold", fontSize: "25px"}}>Fecha de Fin</label>
              <input id="fechaFin" type="date" className="p-inputtext" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required style={{fontSize: "20px"}}/>
            </div>
            <div className="p-field">
              <label htmlFor="periodo" style={{fontWeight: "bold", fontSize: "25px"}}>Cuantos periodos desea que tenga el ciclo</label>
              <input id="periodo" type="number" className="p-inputtext" value={numPeriodos} onChange={handleNumPeriodosChange} required style={{fontSize: "20px"}}/>
            </div>
            <div className="p-field" style={{ marginBottom: "1em" }}>
              <label htmlFor="periodos" style={{fontWeight: "bold", fontSize: "25px"}}>Periodos Ingresados</label>
              <ListBox 
                options={periodos}
                multiple
                disabled
                style={{ maxHeight: '200px', overflow: 'auto' }}
                value={null}
              />
            </div>
            <Button label="Guardar" type="submit" onClick={handleSaveCiclo}/>
          </form>
        </div>
    </div>
  );
};

export default CiclosStep;
