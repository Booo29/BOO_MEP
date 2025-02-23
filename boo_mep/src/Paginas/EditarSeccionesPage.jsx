import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import EditarSecciones from '../Componentes/EditarSecciones/EditarSecciones';

const EditarSeccionesPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <EditarSecciones />
    </div>
  );
};

export default EditarSeccionesPage;
