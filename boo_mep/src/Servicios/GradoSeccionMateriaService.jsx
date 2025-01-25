import axios from 'axios';

export const getGradoSeccionesMateria = async (cicloId) => {
    try {
        const response = await axios.get(`http://localhost:3000/materia_grado_seccion/${cicloId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postGradoSeccionMateria = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/materia_grado_seccion', {
            data: datos
        });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}