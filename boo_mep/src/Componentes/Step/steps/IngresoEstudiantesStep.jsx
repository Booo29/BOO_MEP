import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import {postEstudiantes} from '../../../Servicios/EstudiantesService';
import {getGradoSecciones} from '../../../Servicios/GradoSeccionService';

const IngresoEstudiantesStep = () => {
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
    const toast = React.useRef(null);
  
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await getGradoSecciones(4,1);
                const formattedSections = response.map((section) => ({
                    label: `${section.Gra_Nombre} - ${section.Gra_Sec_Nombre}`,
                    value: section.Id_Grado_Seccion,
                }));
                setSecciones(formattedSections);
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron cargar las secciones.",
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
        const json = XLSX.utils.sheet_to_json(worksheet);
  
        // Add students from Excel to the list
        const newStudents = json.map((row) => ({
          id: Date.now() + Math.random(),
          Est_Identificacion: row.Identificacion,
          Est_Nombre: row['Primer Nombre'],
          Est_PrimerApellido: row['Primer Apellido'],
          Est_SegundoApellido: row['Segundo Apellido'],
        }));
  
        setEstudiantes((prev) => [...prev, ...newStudents]);
      };
      reader.readAsArrayBuffer(file);
    };
  
    const saveAllStudents = () => {
      if (!selectedSeccion) {
        toast.current.show({ severity: "error", summary: "Error", detail: "Seleccione una sección." });
        return;
      }
  
      const payload = estudiantes.map((student) => ({
        Est_Identificacion: student.Est_Identificacion,
        Est_Nombre: student.Est_Nombre,
        Est_PrimerApellido: student.Est_PrimerApellido,
        Est_SegundoApellido: student.Est_SegundoApellido,
        Grado_Seccion_Id_Grado_Seccion: selectedSeccion,
      }));

      console.log("guardado ", payload);
  
      postEstudiantes(payload)
        .then(() => {
          toast.current.show({ severity: "success", summary: "Éxito", detail: "Estudiantes guardados exitosamente." });
          setEstudiantes([]);
        })
        .catch(() => {
          toast.current.show({ severity: "error", summary: "Error", detail: "Error al guardar estudiantes." });
        });
    };
  
    const studentDialogFooter = (
      <Button label="Guardar" icon="pi pi-check" onClick={saveStudent} />
    );
  
    return (
      <div>
        <Toast ref={toast} />
  
        <h3>Gestión de Estudiantes</h3>
  
        <div className="p-field" style={{ marginBottom: "20px" }}>
          <label htmlFor="seccion" style={{fontSize: "20px", fontWeight: "bold"}}>Seleccione una sección</label>
          <Dropdown
            id="seccion"
            value={selectedSeccion}
            options={secciones}
            onChange={(e) => setSelectedSeccion(e.value)}
            placeholder="Seleccione una sección"
          />
        </div>
  
        <div className="p-d-flex p-ai-center p-mt-3" style={{ marginBottom: "20px" }}>
          <Button 
            label="Ingresar Estudiante" 
            icon="pi pi-user-plus" 
            style={{marginRight: "10px"}}
            onClick={openNewStudentDialog} 
         />
          <Button
            label="Carga Masiva"
            icon="pi pi-upload"
            className="p-ml-3"
            onClick={() => document.getElementById("fileUpload").click()}
          />
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>
  
        <DataTable value={estudiantes} className="p-mt-3">
          <Column field="Est_Identificacion" header="Identificación" />
          <Column field="Est_Nombre" header="Nombre" />
          <Column field="Est_PrimerApellido" header="Primer Apellido" />
          <Column field="Est_SegundoApellido" header="Segundo Apellido" />
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
