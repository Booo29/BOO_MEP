import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import EvaluacionEstudiante from '../Componentes/EvaluacionEstudiante/EvaluacionEstudiante';

const EvaluacionEstudiantePage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <EvaluacionEstudiante />
    </div>
  );
};

export default EvaluacionEstudiantePage;
