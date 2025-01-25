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