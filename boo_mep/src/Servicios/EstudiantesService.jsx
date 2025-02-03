import axios from 'axios';

export const postEstudiantes = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/estudiantes', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getEstudiantes = async (CicloId, SeccionId) => {
    try {
        const response = await axios.get(`http://localhost:3000/estudiantes/?CicloId=${CicloId}&SeccionId=${SeccionId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putEstudiante = async (id, datos) => {
    try {
        const response = await axios.put(`http://localhost:3000/estudiantes/${id}`, datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteEstudiante = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/estudiantes/${id}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}