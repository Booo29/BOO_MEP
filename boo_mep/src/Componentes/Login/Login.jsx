// En src/componentes/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from "universal-cookie";
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import imgLogin from '../../Recursos/Login.jfif';
import Swal from 'sweetalert2';


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
                console.log("Nueva pagina");       
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
    <div className="login-page">
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
            <h2>Iniciar Sesión</h2>
          </div>
          <form>
            <label htmlFor="usuario">Usuario:</label>
            <input type="email" id="usuario" name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />

            <label htmlFor="password">Contraseña:</label>
            <input type="password" id="password" name="password"value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type='button' className='button_loggin' onClick={Login}>Iniciar Sesión</button>
          </form>
          <div className="login-signup-link">
            ¿Es tu primera vez? <Link to="/RegistroProfesorPage">Crea tu usuario</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
