import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import EvaluacionesStepForm from '../Componentes/Evaluaciones/EvaluacionesStepForm';

const EvaluacionesStepFormPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <EvaluacionesStepForm />
    </div>
  );
};

export default EvaluacionesStepFormPage;
