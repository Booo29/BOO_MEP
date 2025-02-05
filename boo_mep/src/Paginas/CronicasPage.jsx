import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import Cronicas from '../Componentes/Cronicas/Cronicas';

const CronicasPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <Cronicas />
    </div>
  );
};

export default CronicasPage;
