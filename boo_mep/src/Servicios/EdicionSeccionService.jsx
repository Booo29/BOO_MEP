import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export const postEdicionSeccion = async (data) => {
    try {
        const response = await axios.post(`${API_BASE}/edicionseccion`, data);
        return response.data;
    } catch (error) {
        console.error("Error en postSeccion:", error);
        throw error;
    }
};

export const getEdicionSecciones = async (cicloId, institucionId) => {
    try {
        const response = await axios.get(`${API_BASE}/edicionseccion`, {
            params: { cicloId, institucionId }
        });
        return response.data;
    } catch (error) {
        console.error("Error en getSecciones:", error);
        throw error;
    }
};

export const putEdicionSeccion = async (seccionId, data) => {
    try {
        const response = await axios.put(`${API_BASE}/edicionseccion/${seccionId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error en putSeccion:", error);
        throw error;
    }
};

export const deleteEdicionSeccion = async (seccionId, institucionId) => {
    try {
        const response = await axios.delete(`${API_BASE}/edicionseccion/${seccionId}`, {
            params: { institucionId }
        });
        return response.data;
    } catch (error) {
        console.error("Error en deleteSeccion:", error);
        throw error;
    }
};
