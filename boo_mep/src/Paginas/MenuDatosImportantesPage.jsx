import React, {useEffect} from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import MenuDatosImportantes from '../Componentes/Menu/MenuDatosImportantes';

const MenuDatosImportantesPage = () => {

  const navegar = useNavigate();
  const cookies = new Cookies();

  // useEffect(() => {
  //   if(!cookies.get('token')){
  //     navegar("/");
  //   }
  // }, []);
  
  return (
    <div>
      <MenuDatosImportantes />
    </div>
  );
};

export default MenuDatosImportantesPage;
