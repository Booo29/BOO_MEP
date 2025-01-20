import axios from 'axios';

export const getInstituciones = async (idProfesor) => {
    try {
        const response = await axios.get(`http://localhost:3000/institucion/${idProfesor}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getInstitucionbyId = async (idInstitucion) => {
    try {
        const response = await axios.get(`http://localhost:3000/institucionById/${idInstitucion}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postInstitucion = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/institucion', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putInstitucion = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/institucion', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteInstitucion = async (idInstitucion) => {
    try {
        const response = await axios.delete(`http://localhost:3000/institucion/${idInstitucion}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postInstitucionConMaterias = async (datos) => {
    console.log("Datos a guardar service", datos);
    try {
        const response = await axios.post('http://localhost:3000/institucionConMaterias', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getInstitucionesConMaterias = async (idProfesor) => {
    try {
        const response = await axios.get(`http://localhost:3000/institucionMaterias/${idProfesor}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}