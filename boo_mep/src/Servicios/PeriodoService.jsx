import axios from 'axios';

export const getPeriodos = async (idCiclo) => {
    try {
        const response = await axios.get(`http://localhost:3000/periodos/${idCiclo}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getPeriodo = async (idPeriodo) => {
    try {
        const response = await axios.get(`http://localhost:3000/periodo/${idPeriodo}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const postPeriodo = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/periodo', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putPeriodo = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/periodo', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deletePeriodo = async (idPeriodo) => {
    try {
        const response = await axios.delete(`http://localhost:3000/periodo/${idPeriodo}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

