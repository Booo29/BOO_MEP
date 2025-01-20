import axios from 'axios';

export const guardarDatos = async ( datos) => {
    try {
        const response = await axios.post('http://localhost:3000/user/register', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

