import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import EliminarCiclo from '../Componentes/Ciclo/EliminarCiclo';

const EliminarCicloPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <EliminarCiclo />
    </div>
  );
};

export default EliminarCicloPage;
