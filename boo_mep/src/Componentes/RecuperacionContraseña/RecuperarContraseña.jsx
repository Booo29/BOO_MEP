import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState(''); // Correo electrónico
  const [code, setCode] = useState(''); // Código de seguridad
  const [newPassword, setNewPassword] = useState(''); // Nueva contraseña
  const [step, setStep] = useState(1); // Para controlar el paso en el flujo (1: correo, 2: código, 3: nueva contraseña)
  const [loading, setLoading] = useState(false); // Estado de carga
  const [timer, setTimer] = useState(300); // Temporizador de 5 minutos (300 segundos)
  const [isCodeValid, setIsCodeValid] = useState(false); // Validar si el código es correcto
  const toastRef = React.useRef(null); // Para las notificaciones

  // Función para manejar el envío del código de recuperación al correo
  const sendRecoveryCode = async () => {
    if (!email) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Por favor ingresa tu correo', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      // Llamada a la API para enviar el código de seguridad
      await axios.post('/api/send-recovery-code', { email });
      toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Te hemos enviado un código de seguridad a tu correo', life: 3000 });

      // Cambiar al paso 2: ingreso de código
      setStep(2);

      // Iniciar el temporizador de 5 minutos
      let countdown = 300;
      const timerInterval = setInterval(() => {
        if (countdown <= 0) {
          clearInterval(timerInterval);
          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'El código ha expirado', life: 3000 });
          setStep(1); // Volver al paso 1 si el código expira
        } else {
          setTimer(countdown);
          countdown -= 1;
        }
      }, 1000);
    } catch (error) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al enviar el código', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar el código ingresado por el usuario
  const verifyCode = async () => {
    if (!code) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Por favor ingresa el código', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      // Llamada a la API para verificar el código
      const response = await axios.post('/api/verify-recovery-code', { email, code });
      if (response.data.isValid) {
        setIsCodeValid(true);
        toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Código validado correctamente', life: 3000 });
        setStep(3); // Cambiar al paso 3: actualización de la contraseña
      } else {
        toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'El código no es válido', life: 3000 });
      }
    } catch (error) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al verificar el código', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la contraseña
  const updatePassword = async () => {
    if (!newPassword) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Por favor ingresa una nueva contraseña', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      // Llamada a la API para actualizar la contraseña
      await axios.post('/api/update-password', { email, newPassword });
      toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente', life: 3000 });
      setStep(1); // Volver al paso 1
      setEmail('');
      setCode('');
      setNewPassword('');
    } catch (error) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al actualizar la contraseña', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-d-flex p-flex-column p-ai-center">
      <Toast ref={toastRef} />
      {step === 1 && (
        <div className="p-field">
          <label htmlFor="email">Correo electrónico</label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Ingresa tu correo"
            className="p-inputtext-sm"
          />
          <Button label="Enviar código" icon="pi pi-paper-plane" onClick={sendRecoveryCode} loading={loading} />
        </div>
      )}

      {step === 2 && (
        <div className="p-field">
          <label htmlFor="code">Código de seguridad</label>
          <InputText
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el código enviado a tu correo"
            className="p-inputtext-sm"
          />
          <div>
            <span>{`Tiempo restante: ${Math.floor(timer / 60)}:${timer % 60}`}</span>
          </div>
          <Button label="Verificar código" icon="pi pi-check" onClick={verifyCode} loading={loading} />
        </div>
      )}

      {step === 3 && isCodeValid && (
        <div className="p-field">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <InputText
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            className="p-inputtext-sm"
          />
          <Button label="Actualizar contraseña" icon="pi pi-refresh" onClick={updatePassword} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default RecuperarContraseña;
