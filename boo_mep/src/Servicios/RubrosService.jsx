import axios from 'axios';

export const getRubros = async () => {
    try {
        const response = await axios.get('http://localhost:3000/rubros');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postRubros = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/rubros', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postRubrosConfigurados = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/rubros/configurados', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}
