import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import {postEstudiantes, putEstudiante, deleteEstudiante} from '../../Servicios/EstudiantesService';
import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import { getEstudiantes } from "../../Servicios/EstudiantesService";
import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const Listas = () => {

    const navigate = useNavigate();

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

    useEffect(() => {
        if (selectedSeccion) {
            getEstudiantes(cicloId, selectedSeccion)
                .then((response) => {
                    const formattedStudents = response.map((student) => ({
                        Est_Id: student.Est_Id,
                        Est_Identificacion: student.Est_Identificacion,
                        Est_Nombre: student.Est_Nombre,
                        Est_PrimerApellido: student.Est_PrimerApellido,
                        Est_SegundoApellido: student.Est_SegundoApellido,
                    }));
                    setEstudiantes(formattedStudents);
                })
                .catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error al cargar estudiantes",
                        text: "Ocurrió un error al cargar los estudiantes. Por favor, intente de nuevo.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                });
        }
    }, [selectedSeccion]);
  
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
      if (studentData.Est_Id != null) {
        setEstudiantes((prev) =>
          prev.map((student) =>
            student.Est_Id === studentData.Est_Id ? { ...studentData, Est_Id: student.Est_Id } : student
          )
        );
        putEstudiante(studentData.Est_Id, studentData)
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Estudiante guardado",
                text: "El estudiante ha sido guardado exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        })
      } else {
        // Add new student
        postEstudiantes({
            Est_Identificacion: studentData.Est_Identificacion,
            Est_Nombre: studentData.Est_Nombre,
            Est_PrimerApellido: studentData.Est_PrimerApellido,
            Est_SegundoApellido: studentData.Est_SegundoApellido,
            Grado_Seccion_Id_Grado_Seccion: selectedSeccion,
        })
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Estudiante guardado",
                text: "El estudiante ha sido guardado exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        })
        setEstudiantes((prev) => [...prev, { ...studentData, Est_Id: Date.now() }]);

      }
      setDialogVisible(false);
    };
  
    const handleEditStudent = (student) => {
      setStudentData(student);
      setDialogVisible(true);
    };
  
    const handleDeleteStudent = (studentId) => {
        Swal.fire({
            title: "¿Está seguro?",
            text: "Una vez eliminado, no podrá recuperar este estudiante.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                setEstudiantes((prev) => prev.filter((student) => student.Est_Id !== studentId));
                deleteEstudiante(studentId)
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Estudiante eliminado",
                        text: "El estudiante ha sido eliminado exitosamente.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                })
                .catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error al eliminar estudiante",
                        text: "Ocurrió un error al eliminar el estudiante. Por favor, intente de nuevo.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                });
            }
        });
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
        //   id: Date.now() + Math.random(),
          Est_Identificacion: row.Identificacion,
          Est_Nombre: row['Primer Nombre'],
          Est_PrimerApellido: row['Primer Apellido'],
          Est_SegundoApellido: row['Segundo Apellido'],
          Grado_Seccion_Id_Grado_Seccion: selectedSeccion,
        }));
        setEstudiantes((prev) => [...prev, ...newStudents]);
        postEstudiantes(newStudents)
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Estudiantes guardados",
                text: "Los estudiantes han sido guardados exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });
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
      reader.readAsArrayBuffer(file);

    };

    const DescargarPlantillaExcel = () => {
        const fileUrl = "/plantillas/PlantillaEstudiantes.xlsx"; 
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = "Plantilla_Lista.xlsx"; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const DescargarPlantillaExcelConDatos = () => {
        // Crear una hoja de cálculo con los datos de los estudiantes
        const nuevoFormato = estudiantes.map((estudiante) => ({
            Identificacion: estudiante.Est_Identificacion,
            'Primer Nombre': estudiante.Est_Nombre,
            'Primer Apellido': estudiante.Est_PrimerApellido,
            'Segundo Apellido': estudiante.Est_SegundoApellido,
        }));

        const worksheet = XLSX.utils.json_to_sheet(nuevoFormato);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    
        // Generar el archivo Excel y crear un enlace para su descarga
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
        // Crear un enlace para descargar el archivo
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ListaEstudiantes_${secciones.find((seccion) => seccion.value === selectedSeccion).label}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    const handleMenu = () => {
        navigate('/MenuPage');
    };
    
  
    const studentDialogFooter = (
      <Button label="Guardar" icon="pi pi-check" onClick={saveStudent} />
    );
  
    return (
        <div style={{ padding: "16px" }} >
            <Button label="Regresar" severity="help" onClick={handleMenu} />
            <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Listas de Estudiantes</h1>
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
                        severity="info"
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
                        disabled={!selectedSeccion}
           
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
                        disabled={!selectedSeccion}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <Button
                        label="Descargar Lista"
                        icon="pi pi-download"
                        className="p-ml-3"
                        onClick={DescargarPlantillaExcelConDatos}
                        style={{ width: "100%", fontSize: '16px', fontWeight: 'bold', background: '#33b29f', borderColor: '#33b29f' }}
                        severity="info"
                        disabled={!selectedSeccion}
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
    
            <DataTable value={estudiantes} className="p-mt-3" stripedRows emptyMessage="No hay estudiantes para mostrar">
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
                    onClick={() => handleDeleteStudent(rowData.Est_Id)}
                    />
                </>
                )}
                header="Acciones"
            />
            </DataTable>
    
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

export default Listas;
