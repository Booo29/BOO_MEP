import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import EvaluacionesPrincipal from '../Componentes/Evaluaciones/EvaluacionesPrincipal';

const EvaluacionesPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <EvaluacionesPrincipal />
    </div>
  );
};

export default EvaluacionesPage;
