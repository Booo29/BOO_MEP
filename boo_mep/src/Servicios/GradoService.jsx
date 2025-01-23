import axios from 'axios';

export const getGrados = async () => {
    try {
        const response = await axios.get('http://localhost:3000/grados');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postGrado = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/grados', datos);
        console.log("Response desde service cliente", response);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putGrado = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/grado', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteGrado = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/grado/${id}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


