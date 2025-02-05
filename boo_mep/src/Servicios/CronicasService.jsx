import axios from 'axios';

export const GetCronicas = async (cicloId) => {
    try {
        const response = await axios.get(`http://localhost:3000/cronicas/${cicloId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PostCronica = async (cicloId, descripcion, fecha) => {
    try {
        const response = await axios.post("http://localhost:3000/cronica", { cicloId, descripcion, fecha });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PutCronica = async (cronicaId, descripcion, fecha) => {
    try {
        const response = await axios.put(`http://localhost:3000/cronica/${cronicaId}`, { descripcion, fecha });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const DeleteCronica = async (cronicaId) => {
    try {
        const response = await axios.delete(`http://localhost:3000/cronica/${cronicaId}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}