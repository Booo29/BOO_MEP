import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { postInstitucion, getInstitucionbyId, putInstitucion } from '../../../Servicios/InstitucionService'; 
import useStore from '../../../store/store'; 
import { jwtDecode } from "jwt-decode";
import Cookies from 'universal-cookie';
import Swal from "sweetalert2";

const InstitutionInfoStep = () => {

  const cookies = new Cookies();

  const idProfesor = jwtDecode(cookies.get("token")).id;

  const [institucion, setInstitucion] = useState({
    nombre: "",
    tipo: "",
    direccionRegional: "",
    circuito: "",
  });

  const institutionId = useStore((state) => state.institutionId);
  const setInstitutionId = useStore((state) => state.setInstitutionId);


  useEffect(() => {
    if (institutionId) {
      console.log('institutionId', institutionId);
      const fetchInstitucion = async () => {
        const institucion = await getInstitucionbyId(institutionId);
        console.log('institucion', institucion);
        setInstitucion({
          idInstitucion: institucion.Inst_Id,
          nombre: institucion.Inst_Nombre,
          tipo: institucion.Inst_Tipo,
          direccionRegional: institucion.Inst_DireccionRegional,
          circuito: institucion.Inst_Circuito,
        });
      };
      fetchInstitucion();
    } else {
      setInstitucion({
        nombre: "",
        tipo: "",
        direccionRegional: "",
        circuito: "",
      });
    }
  }, [institutionId]);


  const handleSave = async () => {
    try {
      if (institucion.idInstitucion) {
        await putInstitucion(institucion); 
        Swal.fire({
          title: "Guardado",
          text: "La institución ha sido actualizada",
          icon: "success",
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        institucion.idProfesor = idProfesor;
        console.log('institucion guardar', institucion);
        try {
          const response = await postInstitucion(institucion); 
          console.log('response.data', response);
          const { Inst_Id } = response; 
          
          setInstitutionId(Inst_Id);
          Swal.fire({
              title: "Guardado",
              text: `La institución ha sido guardada `,
              icon: "success",
              position: "top-end",
              showConfirmButton: false,
              timer: 1500,
          });
      } catch (error) {
          console.error("Error al guardar la institución:", error);
          Swal.fire({
              title: "Error",
              text: "No se pudo guardar la institución",
              icon: "error",
              position: "top-end",
              showConfirmButton: false,
              timer: 1500,
          });
      }
      
      }
    } catch (error) {
      console.error('Error al guardar la institución', error);
    }
  };

  const handleChange = (field, value) => {
    setInstitucion({ ...institucion, [field]: value });
  };

  return (
    <div>
      <h2>Información de la Institución</h2>
      <div>
        <label>Nombre</label>
        <InputText
          value={institucion.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Nombre de la institución"
        />
      </div>
      <div>
        <label>Tipo</label>
        <InputText
          value={institucion.tipo}
          onChange={(e) => handleChange('tipo', e.target.value)}
          placeholder="Tipo de institucion"
        />
      </div>
      <div>
        <label>Dirección Regional</label>
        <InputText
          value={institucion.direccionRegional}
          onChange={(e) => handleChange('direccionRegional', e.target.value)}
          placeholder="Dirección Regional"
        />
      </div>
      <div>
        <label>Circuito</label>
        <InputText
          value={institucion.circuito}
          onChange={(e) => handleChange('circuito', e.target.value)}
          placeholder="Circuito"
        />
      </div>
      <div>
        <Button label="Guardar" severity="success"  onClick={handleSave} />
      </div>
    </div>
  );
};

export default InstitutionInfoStep;
