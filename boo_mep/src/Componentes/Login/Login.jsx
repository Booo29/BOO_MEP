// En src/componentes/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from "universal-cookie";
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import imgLogin from '../../Recursos/Login.jfif';
import Swal from 'sweetalert2';

import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';    
import { Button } from 'primereact/button'; 
import { style } from 'framer-motion/client';

const Login = () => {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState('');

    const [password, setPassword] = useState('');

    const Login = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://127.0.0.1:3000/user/login', {
                usuario,
                password
            });
            if (res.data.status === 'error') {
               
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Usuario o contraseña incorrectos!',
                  
                  })

                  return alert(res.data.error);
            }
            else{
                const cookies = new Cookies();   
                cookies.set('token', res.data.token, { path: '/' });      
                navigate('/InstitucionesPage');
            }
        }
        catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Usuario o contraseña incorrectos!',
           
          })
            console.log(error);
        }
    }


  return (
    <div style={{ padding: "16px" }} >
       <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Bienvenido/a a EDUPLAN de plataforma de evaluación docente </h1>
        <div className="login-page" >
          <div className="login-card">
            <div className="login-left">
              <img
                src={imgLogin}
                alt="Imagen"
                className="login-image"
              />
            </div>
            <div className="login-right">
              <div className="login-logo">
                <h1>Iniciar Sesión</h1>
              </div>
              <form>
                <label htmlFor="usuario" style={{fontWeight: "bold", fontSize: "25px"}}>Usuario:</label>
                <InputText 
                  id="usuario" 
                  name="usuario" 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)} 
                  style={{fontSize: '20px'}}
                />
                {/* <input type="email" id="usuario" name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} /> */}

                <label htmlFor="password" style={{fontWeight: "bold", fontSize: "25px"}}>Contraseña:</label>
                <div className="p-field" >
                  <Password 
                    id="password" 
                    name="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{width: '100%',  fontSize: '20px'}}
                    feedback={false}
                    toggleMask
                  />
                </div>


                {/* <button type='button' className='button_loggin' onClick={Login}>Iniciar Sesión</button> */}
                <Button label="Iniciar Sesión" onClick={Login} style={{width: '100%'}} />
              </form>
              <div className="login-signup-link">
                ¿Es tu primera vez? <Link style={{fontWeight: "bold", fontSize: "25px"}} to="/RegistroProfesorPage">Crea tu usuario</Link>
              </div>
              {/* <div className="login-signup-link">
                ¿Olvidaste tu contraseña? <Link style={{fontWeight: "bold", fontSize: "25px"}} to="/RecuperarContrasenaPage">Recupera tu contraseña</Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
