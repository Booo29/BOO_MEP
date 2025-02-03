import axios from 'axios';

export const getEstudiantesNotas = async (materiaGradoSeccionId, materiaId, evaluacionId) => {
    try {
        const response = await axios.get(`http://localhost:3000/estudiantesNotas/?materiaGradoSeccionId=${materiaGradoSeccionId}&materiaId=${materiaId}&evaluacionId=${evaluacionId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postEstudianteNota = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/estudianteNota', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}



export const putEstudianteNota = async (datos) => {
    try {
        const response = await axios.put(`http://localhost:3000/estudianteNota`, datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}
