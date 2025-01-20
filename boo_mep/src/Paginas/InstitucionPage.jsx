import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import InstitucionesView from '../Componentes/Institucion/InstitucionView';

const InstitucionesPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <InstitucionesView />
    </div>
  );
};

export default InstitucionesPage;
