import axios from 'axios';

export const recuperarContrasena = async (email) => {
    try {
        const response = await axios.post('http://localhost:3000/recuperacionContrasena', { email });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const cambiarContrasena = async (token, newPassword) => {
    try {
        const response = await axios.put('http://localhost:3000/recuperacionContrasena', { token, newPassword });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}