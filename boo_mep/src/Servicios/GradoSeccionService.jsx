import axios from 'axios';

export const getGradoSecciones = async (cicloId, institucionId) => {
    try {
        const response = await axios.get(`http://localhost:3000/grado_secciones/?cicloId=${cicloId}&institucionId=${institucionId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postGradoSeccion = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/grado_secciones', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}