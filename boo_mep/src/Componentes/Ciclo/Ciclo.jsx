import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import { addLocale } from 'primereact/api';
import { Column } from "primereact/column";
import { getCiclos, postCiclo, putCiclo, deleteCiclo } from "../../Servicios/CicloService";

const CiclosManager = ({ idInstitucion, visible, onClose }) => {

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ciclos, setCiclos] = useState([]);
  const [selectedCiclo, setSelectedCiclo] = useState(null);
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  
  addLocale('es', {
          firstDayOfWeek: 1,
          showMonthAfterYear: true,
          dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
          dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
          dayNamesMin: ['D', 'L', 'M', 'MI', 'J', 'V', 'S'],
          monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
          monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          today: 'Hoy',
          clear: 'Limpiar'
  });


  useEffect(() => {
    if (idInstitucion) {
      fetchCiclos();
    }
  }, [idInstitucion]);

  const fetchCiclos = async () => {
    try {
      const data = await getCiclos(idInstitucion);
      setCiclos(data.map((ciclo) => ({
        id: ciclo.Cic_Id || 0,
        fechaInicio: ciclo.Cic_Fecha_Inicio || "",
        fechaFin: ciclo.Cic_Fecha_Fin || "",
      })));
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
    setIsAddModalOpen(true);
  };

  const handleEditCiclo = (ciclo) => {
    setSelectedCiclo(ciclo);
    const formattedFechaInicio = new Date(ciclo.fechaInicio).toISOString().split('T')[0];
    const formattedFechaFin = new Date(ciclo.fechaFin).toISOString().split('T')[0];
  
    setFechaInicio(formattedFechaInicio);
    setFechaFin(formattedFechaFin);
    
    setIsAddModalOpen(true);
  };

  const handleDeleteCiclo = async (cicloId) => {
    try {
      await deleteCiclo(cicloId);
      fetchCiclos();
    } catch (error) {
      console.error("Error deleting ciclo:", error);
    }
  };

  const handleSaveCiclo = async () => {
    const cicloData = {
      idCiclo: selectedCiclo?.id,
      fechaInicio,
      fechaFin,
      idInstitucion,
    };

    try {
      if (selectedCiclo) {
      
        await putCiclo(cicloData);
      } else {
        await postCiclo(cicloData);
      }
      fetchCiclos();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving ciclo:", error);
    }
  };
  


  const renderTableActions = (rowData) => (
    <div>
      <Button label="Editar" icon="pi pi-pencil" onClick={() => handleEditCiclo(rowData)} style={{ marginRight: "0.5em" }} />
      <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteCiclo(rowData.id)} />
    </div>
  );

  return (
    <div>
      <Dialog
            visible={visible}
            onHide={onClose}
            header="Gestión de Ciclos"
            style={{ width: "90vw" }}
        >
        <div>
          <Button label="Añadir Ciclo" icon="pi pi-plus" onClick={handleAddCiclo} className="p-mb-3" style={{ marginBottom: "0.5em" }} />
          {/* Tabla de Ciclos */}
          <DataTable value={ciclos} paginator rows={10}>
            <Column field="id" header="ID" />
            <Column header="Fecha de Inicio" body={(rowData) => formatFecha(rowData, 'fechaInicio')} sortable/>
            <Column header="Fecha de Fin" body={(rowData) => formatFecha(rowData, 'fechaFin')} sortable/>
            <Column body={renderTableActions} header="Acciones" />
          </DataTable>
        </div>
      </Dialog>

      {/* Modal para Añadir/Editar Ciclo */}
      <Dialog visible={isAddModalOpen} onHide={() => setIsAddModalOpen(false)} header={selectedCiclo ? "Editar Ciclo" : "Añadir Ciclo"} style={{ width: "50vw" }}>
        <div>
          {/* Formulario para Añadir/Editar Ciclo */}
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCiclo(); }}>
            <div className="p-field">
              <label htmlFor="fechaInicio">Fecha de Inicio</label>
              <Calendar id="fechaInicio" type="date" className="p-inputtext" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required locale="es"/>
            </div>
            <div className="p-field">
              <label htmlFor="fechaFin">Fecha de Fin</label>
              <Calendar id="fechaFin" type="date" className="p-inputtext" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required locale="es"/>
            </div>
            <Button label="Guardar" type="submit" />
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default CiclosManager;
