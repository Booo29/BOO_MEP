import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ListBox } from "primereact/listbox";
import { getCiclos, postCiclo, putCiclo, deleteCiclo } from "../../../Servicios/CicloService";
import useStore from "../../../store/store";
import Swal from "sweetalert2";

const TablaCiclosStep = () => {

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ciclos, setCiclos] = useState([]);
  const [selectedCiclo, setSelectedCiclo] = useState(null);
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [numPeriodos, setNumPeriodos] = useState(0); 
  const [periodos, setPeriodos] = useState([]);

  const idInstitucion = useStore((state) => state.institutionId);

  console.log("CiclosManager");

  useEffect(() => {
    if (idInstitucion) {
      fetchCiclos();
    }
  }, [idInstitucion]);

  const fetchCiclos = async () => {
    try {
      const data = await getCiclos(idInstitucion);
      console.log("Ciclos:", data);
      setCiclos(data);
    } catch (error) {
      console.error("Error fetching ciclos:", error);
    }
  };

  const formatFecha = (rowData, field) => {
    const fecha = new Date(rowData[field]);
    return new Intl.DateTimeFormat('es-CR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(fecha);
  };

  const handleAddCiclo = () => {
    setSelectedCiclo(null);
    setFechaInicio("");
    setFechaFin("");
    setNumPeriodos(0);
    setPeriodos([]);
    setIsAddModalOpen(true);
  };

  const handleEditCiclo = (ciclo) => {

    setSelectedCiclo(ciclo);

    const formattedFechaInicio = new Date(ciclo.fechaInicio).toISOString().split('T')[0];
    const formattedFechaFin = new Date(ciclo.fechaFin).toISOString().split('T')[0];
  
    setFechaInicio(formattedFechaInicio);
    setFechaFin(formattedFechaFin);

    setPeriodos(ciclo.periodos.map((periodo) => periodo.nombre));
    
    setIsAddModalOpen(true);
  };

  const handleDeleteCiclo = async (cicloId) => {
    try {
      Swal.fire({
        title: '¿Está seguro que desea eliminar el ciclo?',
        showCancelButton: true,
        confirmButtonText: `Eliminar`,
        cancelButtonText: `Cancelar`,
        icon: 'warning',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteCiclo(cicloId);
          Swal.fire({
            icon: 'success',
            title: 'Ciclo eliminado correctamente',
            showConfirmButton: false,
            position: 'top-end',
            timer: 1500,
          });
          fetchCiclos();
        }
      });
    } catch (error) {
      console.error("Error deleting ciclo:", error);
    }
  };

  const handleSaveCiclo = async () => {

    try {
      if (selectedCiclo) {

        const cicloData = {
          idCiclo: selectedCiclo?.cicloId,
          fechaInicio,
          fechaFin,
          idInstitucion,
        };
        await putCiclo(cicloData);
        Swal.fire({
          icon: 'success',
          title: 'Ciclo actualizado correctamente',
          showConfirmButton: false,
          position: 'top-end',
          timer: 1500
        });
      } else {

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
        await postCiclo(cicloData);
        Swal.fire({
          icon: 'success',
          title: 'Ciclo creado correctamente',
          showConfirmButton: false,
          position: 'top-end',
          timer: 1500
        });
      }
      fetchCiclos();
      setIsAddModalOpen(false);
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

  
  const renderTableActions = (rowData) => (
    <div>
      <Button label="Editar" icon="pi pi-pencil" onClick={() => handleEditCiclo(rowData)} style={{ marginRight: "0.5em" }} />
      <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteCiclo(rowData.cicloId)} />
    </div>
  );

  return (
    <div>

        <div>
          <Button label="Añadir Ciclo" icon="pi pi-plus" onClick={handleAddCiclo} className="p-mb-3" style={{ marginBottom: "0.5em" }} />

          <DataTable value={ciclos} paginator rows={10}>
            <Column header="Fecha de Inicio" body={(rowData) => formatFecha(rowData, 'fechaInicio')} />
            <Column header="Fecha de Fin" body={(rowData) => formatFecha(rowData, 'fechaFin')} />
            <Column field="periodos" header="Periodos" body={(rowData) => rowData.periodos.length} />
            <Column body={renderTableActions} header="Acciones" />
          </DataTable>
        </div>

      <Dialog visible={isAddModalOpen} onHide={() => setIsAddModalOpen(false)} header={selectedCiclo ? "Editar Ciclo" : "Añadir Ciclo"} style={{ width: "50vw" }}>
        <div>
          {/* Formulario para Añadir/Editar Ciclo */}
          <form onSubmit={(e) => { e.preventDefault()}}>
            <div className="p-field">
              <label htmlFor="fechaInicio">Fecha de Inicio</label>
              <input id="fechaInicio" type="date" className="p-inputtext" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div className="p-field">
              <label htmlFor="fechaFin">Fecha de Fin</label>
              <input id="fechaFin" type="date" className="p-inputtext" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
            <div className="p-field">
              <label htmlFor="periodo">Cuantos periodos desea que tenga el ciclo</label>
              <input id="periodo" type="number" className="p-inputtext" value={numPeriodos} onChange={handleNumPeriodosChange} disabled={!!selectedCiclo} required />
            </div>
            <div className="p-field" style={{ marginBottom: "1em" }}>
              <label htmlFor="periodos">Periodos Ingresados</label>
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
      </Dialog>
    </div>
  );
};

export default TablaCiclosStep;
