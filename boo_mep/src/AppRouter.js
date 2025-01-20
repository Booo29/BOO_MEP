import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from "./Paginas/LoginPage";

const RutaProtegida = ({ element: Component, ...rest }) => {
    const usuarioAutenticado = localStorage.getItem('token');

    if(usuarioAutenticado){
       return <Route {...rest} element={Component} />
    }
    else{
      return <Route path="/LoginPage" element={<LoginPage/>}/>
    }
    
};

export default RutaProtegida;