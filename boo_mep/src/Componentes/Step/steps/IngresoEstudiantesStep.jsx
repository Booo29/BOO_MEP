import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import {postEstudiantes} from '../../../Servicios/EstudiantesService';
import {getGradoSecciones} from '../../../Servicios/GradoSeccionService';
import useCicloStore from "../../../store/CicloStore";
import useStore from "../../../store/store";
import Swal from "sweetalert2";

const IngresoEstudiantesStep = () => {

  const cicloId = useCicloStore((state) => state.cicloId);
  const institutionId = useStore((state) => state.institutionId);

  const [secciones, setSecciones] = useState([]);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [studentData, setStudentData] = useState({
    Est_Identificacion: "",
    Est_Nombre: "",
    Est_PrimerApellido: "",
    Est_SegundoApellido: "",
  });

  useEffect(() => {
      const fetchSections = async () => {
          try {
              const response = await getGradoSecciones(cicloId, institutionId);
              const formattedSections = response.map((section) => ({
                  label: `${section.Gra_Nombre} - ${section.Gra_Sec_Nombre}`,
                  value: section.Id_Grado_Seccion,
              }));
              setSecciones(formattedSections);
          } catch (error) {
              Swal.fire({
                  icon: "error",
                  title: "Error al cargar secciones",
                  text: "Ocurrió un error al cargar las secciones. Por favor, intente de nuevo.",
                  timer: 2000,
                  showConfirmButton: false,
              });
          }
      };

      fetchSections();
  }, []);

  const openNewStudentDialog = () => {
    setStudentData({
      Est_Identificacion: "",
      Est_Nombre: "",
      Est_PrimerApellido: "",
      Est_SegundoApellido: "",
    });
    setDialogVisible(true);
  };

  const saveStudent = () => {
    if (studentData.id != null) {
      // Edit existing student
      setEstudiantes((prev) =>
        prev.map((student) =>
          student.id === studentData.id ? { ...studentData, id: student.id } : student
        )
      );
    } else {
      // Add new student
      setEstudiantes((prev) => [...prev, { ...studentData, id: Date.now() }]);
    }
    setDialogVisible(false);
  };

  const handleEditStudent = (student) => {
    setStudentData(student);
    setDialogVisible(true);
  };

  const handleDeleteStudent = (studentId) => {
    setEstudiantes((prev) => prev.filter((student) => student.id !== studentId));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if(json.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Archivo vacío",
          text: "El archivo seleccionado no contiene estudiantes.",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      const columnMapping = {
        identificacion: ["identificación", "id", "cedula", "cédula", "identificacion", "Cédula", "Identificación", "ID", "Cedula", "Identificacion"],
        nombre: ["primer nombre", "nombre1", "nombre", "Nombre", "Nombre1", "Primer nombre", "Primer Nombre"],
        primerApellido: ["primer apellido", "apellido1", "apellido", "Apellido", "Apellido1", "Primer apellido", "Primer Apellido"],
        segundoApellido: ["segundo apellido", "apellido2", "Apellido2", "Segundo apellido", "Segundo Apellido"],
    };

    let headerRowIndex = -1;
    let headers = [];

    for (let i = 0; i < json.length; i++) {
      const row = json[i].map((cell) => (cell ? cell.toString().trim().toLowerCase() : ""));
      if (
          Object.values(columnMapping).some((possibleNames) =>
          row.some((header) => possibleNames.includes(header))
          )
      ) {
          headerRowIndex = i;
          headers = row;
          break;
      }
  }

  if (headerRowIndex === -1) {    
    Swal.fire({
      icon: "error",
      title: "Encabezados no encontrados",
      text: "No se encontraron los encabezados esperados en el archivo.",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  const findColumnIndex = (possibleNames) => {
    return headers.findIndex((header) => possibleNames.includes(header));
  };


  const idxIdentificacion = findColumnIndex(columnMapping.identificacion);
  const idxNombre = findColumnIndex(columnMapping.nombre);
  const idxPrimerApellido = findColumnIndex(columnMapping.primerApellido);
  const idxSegundoApellido = findColumnIndex(columnMapping.segundoApellido);

  if ([idxIdentificacion, idxNombre, idxPrimerApellido].some((idx) => idx === -1)) {
    Swal.fire({
      icon: "error",
      title: "Columnas faltantes",
      text: "El archivo Excel no tiene todas las columnas requeridas.",
    });
    return;
  }

  const dataRows = json.slice(headerRowIndex + 1);

  const newStudents = dataRows.map((row) => ({
    id: Date.now() + Math.random(),
    Est_Identificacion: row[idxIdentificacion] || "",
    Est_Nombre: row[idxNombre] || "",
    Est_PrimerApellido: row[idxPrimerApellido] || "",
    Est_SegundoApellido: idxSegundoApellido !== -1 ? row[idxSegundoApellido] || "" : "",
    Grado_Seccion_Id_Grado_Seccion: selectedSeccion,
  }));


  setEstudiantes((prev) => [...prev, ...newStudents]);
    };
    reader.readAsArrayBuffer(file);
  };

  const saveAllStudents = () => {
    if (!selectedSeccion) {
      Swal.fire({
        icon: "warning",
        title: "Debe de elegir una sección",
        text: "Por favor, seleccione una sección para guardar los estudiantes.",
        timer: 2000,
        showConfirmButton: false,
    });
      return;
    }

    const payload = estudiantes.map((student) => ({
      Est_Identificacion: student.Est_Identificacion,
      Est_Nombre: student.Est_Nombre,
      Est_PrimerApellido: student.Est_PrimerApellido,
      Est_SegundoApellido: student.Est_SegundoApellido,
      Grado_Seccion_Id_Grado_Seccion: selectedSeccion,
    }));

    postEstudiantes(payload)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Estudiantes guardados",
          text: "Los estudiantes han sido guardados exitosamente.",
          timer: 2000,
          showConfirmButton: false,
      });
        setEstudiantes([]);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error al guardar estudiantes",
          text: "Ocurrió un error al guardar los estudiantes. Por favor, intente de nuevo.",
          timer: 2000,
          showConfirmButton: false,
        });
      });
  };

  
  const DescargarPlantillaExcel = () => {
    const fileUrl = "/plantillas/PlantillaEstudiantes.xlsx"; // Asegúrate de que el archivo esté en la carpeta public
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "Plantilla_Lista.xlsx"; // Nombre del archivo al descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


  const studentDialogFooter = (
    <Button label="Guardar" icon="pi pi-check" onClick={saveStudent} />
  );

  return (
      <div style={{ padding: "16px" }} >
          <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Registro de Estudiantes</h1>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>   
                  <Dropdown
                      id="seccion"
                      value={selectedSeccion}
                      options={secciones}
                      onChange={(e) => setSelectedSeccion(e.value)}
                      placeholder="Seleccione una sección"
                      style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
                  />
              </div>
               <div style={{ flex: 1 }}>
                  <Button
                  label="Descargar Plantilla"
                  icon="pi pi-download"
                  className="p-ml-3"
                  onClick={DescargarPlantillaExcel}
                  style={{ width: "100%", fontSize: '16px', fontWeight: 'bold', background: '#99ed63', color: 'black', borderColor: '#99ed63' }}
                  />
              </div>
          </div>
  
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}> 
                  <Button 
                      label="Ingresar Estudiante" 
                      icon="pi pi-user-plus" 
                      onClick={openNewStudentDialog} 
                      style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
         
                  />
              </div>
              <div style={{ flex: 1 }}> 
                  <Button
                      label="Carga Masiva"
                      icon="pi pi-upload"
                      className="p-ml-3"
                      onClick={() => document.getElementById("fileUpload").click()}
                      style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
                      severity="info"
                  />
              </div>
          </div>
          <div style={{ flex: 1 }}>
              <input
                  type="file"
                  id="fileUpload"
                  style={{ display: "none" }}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
              />
          </div>
  
          <DataTable value={estudiantes} className="p-mt-3" stripedRows emptyMessage="No hay estudiantes registrados">
          <Column field="Est_Identificacion" header="Identificación" sortable/>
          <Column field="Est_Nombre" header="Nombre" sortable/>
          <Column field="Est_PrimerApellido" header="Primer Apellido" sortable/>
          <Column field="Est_SegundoApellido" header="Segundo Apellido" sortable/>
          <Column
              body={(rowData) => (
              <>
                  <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-text"
                  onClick={() => handleEditStudent(rowData)}
                  />
                  <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-text"
                  onClick={() => handleDeleteStudent(rowData.id)}
                  />
              </>
              )}
              header="Acciones"
          />
          </DataTable>
  
          <Button
          label="Guardar Estudiantes"
          icon="pi pi-save"
          className="p-mt-3"
          style={{ marginTop: "20px" }}
          onClick={saveAllStudents}
          severity="success"
          />
  
          <Dialog
          visible={dialogVisible}
          style={{ width: "400px" }}
          header="Detalles del Estudiante"
          modal
          footer={studentDialogFooter}
          onHide={() => setDialogVisible(false)}
          >
          <div className="p-field">
              <label htmlFor="identificacion">Identificación</label>
              <InputText
              id="identificacion"
              value={studentData.Est_Identificacion}
              onChange={(e) => setStudentData({ ...studentData, Est_Identificacion: e.target.value })}
              />
          </div>
          <div className="p-field">
              <label htmlFor="nombre">Primer Nombre</label>
              <InputText
              id="nombre"
              value={studentData.Est_Nombre}
              onChange={(e) => setStudentData({ ...studentData, Est_Nombre: e.target.value })}
              />
          </div>
          <div className="p-field">
              <label htmlFor="primerApellido">Primer Apellido</label>
              <InputText
              id="primerApellido"
              value={studentData.Est_PrimerApellido}
              onChange={(e) => setStudentData({ ...studentData, Est_PrimerApellido: e.target.value })}
              />
          </div>
          <div className="p-field">
              <label htmlFor="segundoApellido">Segundo Apellido</label>
              <InputText
              id="segundoApellido"
              value={studentData.Est_SegundoApellido}
              onChange={(e) => setStudentData({ ...studentData, Est_SegundoApellido: e.target.value })}
                      />
                  </div>
              </Dialog>
      </div>
  );
};
export default IngresoEstudiantesStep;
