import axios from 'axios';

export const getCiclos = async (idInstitucion) => {
    try {
        const response = await axios.get(`http://localhost:3000/ciclo/${idInstitucion}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postCiclo = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/ciclo', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putCiclo = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/ciclo', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteCiclo = async (idCiclo) => {
    try {
        const response = await axios.delete(`http://localhost:3000/ciclo/${idCiclo}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

