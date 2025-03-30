import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { guardarDatos } from '../../Servicios/RegistrarProfesorService'; // Importa el servicio que creaste
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModalProfesor.css';

const FormularioRegistro = () => {
    const [formData, setFormData] = useState({
        usuario: '',
        password: '',
        identificacion: '',
        nombre: '',
        primerApellido: '',
        segundoApellido: '',
        correo: '',
    });

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const toast = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let valid = true;
        let errorList = {};
        Object.keys(formData).forEach((key) => {
            if (!formData[key]) {
                valid = false;
                errorList[key] = 'Este campo es obligatorio';
            }
        });
        setErrors(errorList);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                // Validar que las contraseñas coincidan
                if (formData.password !== formData.confirmarPassword) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
                    return;
                }
                const response = await guardarDatos(formData);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: response });
                setFormData({
                    usuario: '',
                    password: '',
                    identificacion: '',
                    nombre: '',
                    primerApellido: '',
                    segundoApellido: '',
                    correo: '',
                });
                setErrors({});
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso' });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
               
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el registro' });
            }
        }
    };

    return (
        <div className="main-container">
        <h1 className="titulo-principal">
            Bienvenido al Registro de Usuarios
        </h1>
        <div className="form-container">
            <Toast ref={toast} />
            <Card className="p-shadow-5 card-custom">
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="usuario" className='label-profesor' >Usuario</label>
                        <InputText
                            id="usuario"
                            name="usuario"
                            value={formData.usuario}
                            onChange={handleInputChange}
                            className={errors.usuario ? 'p-invalid' : ''}
                        />
                        {errors.usuario && <small className="p-error">{errors.usuario}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="password" className='label-profesor'>Contraseña</label>
                        <Password
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={errors.password ? 'p-invalid' : ''}
                            feedback={false}
                            toggleMask
                        />
                        {errors.password && <small className="p-error">{errors.password}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="confirmarPassword" className='label-profesor'>Confirmar Contraseña</label>
                        <Password
                            id="confirmarPassword"
                            name="confirmarPassword"
                            value={formData.confirmarPassword}
                            onChange={handleInputChange}
                            className={errors.confirmarPassword ? 'p-invalid' : ''}
                            feedback={false}
                            toggleMask
                        />
                        {errors.confirmarPassword && <small className="p-error">{errors.confirmarPassword}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="identificacion" className='label-profesor'>Identificación</label>
                        <InputText
                            id="identificacion"
                            name="identificacion"
                            value={formData.identificacion}
                            onChange={handleInputChange}
                            className={errors.identificacion ? 'p-invalid' : ''}
                        />
                        {errors.identificacion && <small className="p-error">{errors.identificacion}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="nombre" className='label-profesor'>Nombre</label>
                        <InputText
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className={errors.nombre ? 'p-invalid' : ''}
                        />
                        {errors.nombre && <small className="p-error">{errors.nombre}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="primerApellido" className='label-profesor'>Primer Apellido</label>
                        <InputText
                            id="primerApellido"
                            name="primerApellido"
                            value={formData.primerApellido}
                            onChange={handleInputChange}
                            className={errors.primerApellido ? 'p-invalid' : ''}
                        />
                        {errors.primerApellido && <small className="p-error">{errors.primerApellido}</small>}
                    </div>

                    <div className="p-field">
                        <label htmlFor="segundoApellido" className='label-profesor'>Segundo Apellido</label>
                        <InputText
                            id="segundoApellido"
                            name="segundoApellido"
                            value={formData.segundoApellido}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="correo" className='label-profesor'>Correo</label>
                        <InputText
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className={errors.correo ? 'p-invalid' : ''}
                        />
                        {errors.correo && <small className="p-error">{errors.correo}</small>}
                    </div>

                    <Button label="Registrar" className="p-mt-3 custom-button" type='submit' />
                </form>
            </Card>
        </div>
    </div>
    );
};

export default FormularioRegistro;
