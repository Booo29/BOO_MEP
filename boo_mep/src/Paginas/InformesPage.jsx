import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import InformeAsistencia from '../Componentes/Informes/InformeAsistencia';

const InformesPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <InformeAsistencia />
    </div>
  );
};

export default InformesPage;
