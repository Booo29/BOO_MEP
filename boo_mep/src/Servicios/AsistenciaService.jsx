import axios from 'axios';

export const postAsistencia = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/asistencia', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putAsistencia = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/asistencia', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAsistencia = async (PeriodoId, MateriaId, SeccionId, Fecha ) => {
    try {
        const response = await axios.get(`http://localhost:3000/asistencia/?PeriodoId=${PeriodoId}&MateriaId=${MateriaId}&SeccionId=${SeccionId}&Fecha=${Fecha}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}