import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { recuperarContrasena, cambiarContrasena } from '../../Servicios/RecuperacionContrasenaService';


const RecuperarContraseña = () => {

    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isTokenSent, setIsTokenSent] = useState(false);
    const [codeVerification, setCodeVerification] = useState('');
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = React.useRef(null);


    const handleRecuperarContrasena = async () => {
        setLoading(true);
        try {
            const response = await recuperarContrasena(email);
            console.log(response.length);
            if (response) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Token enviado al correo', life: 3000 });
                setIsTokenSent(true);
                setToken(response.token); 
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: response.message, life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Correo no encotrado', life: 3000 });
        } finally {
            setLoading(false);
        }
    }

    const handleCambiarContrasena = async () => {

        setLoading(true);
        try {
            
            if (newPassword !== confirmPassword) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden', life: 3000 });
                return;
            }
       
            if (parseInt(codeVerification) !== jwtDecode(token).codigoVerificacion) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Código de verificación incorrecto', life: 3000 });
                return;
            }

            const response = await cambiarContrasena(token, newPassword);
            console.log("response", response);

            if (response) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Contraseña cambiada con éxito', life: 3000 });
                setIsPasswordChanged(true);
                navigate('/LoginPage'); 
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: response.message, life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cambiar la contraseña', life: 3000 });
        } finally {
            setLoading(false);
        }
    }

    const handleLogin = () => {
        navigate('/LoginPage');
      };

    return (
        <div className="card flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Button label="Volver" icon="pi pi-arrow-left" onClick={handleLogin} className="mb-3" style={{marginBottom: "10px"}} severity="help"/>
            <Toast ref={toast} />
            <div className="card flex flex-column gap-3">
                <h2>En esta pantalla podrás cambiar la contraseña</h2>
                {!isTokenSent ? (
                    <div className="field">
                        <label htmlFor="email">Correo</label>
                        <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Ingrese el correo electronico usado en el sistema" />
                        <Button label="Enviar Token" icon="pi pi-check" onClick={handleRecuperarContrasena} loading={loading} className="mt-2" />
                    </div>
                ) : (
                    <div className="field">
                        <label htmlFor="token">Código de Verificación</label>
                        <InputText id="token" value={codeVerification} onChange={(e) => setCodeVerification(e.target.value)} type="text" placeholder="Ingrese el código de verificación" />
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <InputText id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Ingrese la nueva contraseña" />
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <InputText id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirme la nueva contraseña" />
                        <Button label="Cambiar Contraseña" icon="pi pi-check" onClick={handleCambiarContrasena} loading={loading} className="mt-2" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecuperarContraseña;
