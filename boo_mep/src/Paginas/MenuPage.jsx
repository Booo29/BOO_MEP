import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import Menu from '../Componentes/Menu/Menu';

const MenuPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <Menu />
    </div>
  );
};

export default MenuPage;
