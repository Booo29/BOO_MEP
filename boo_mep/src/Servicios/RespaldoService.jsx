import axios from 'axios';

export const crearRespaldo = async () => {
    try {
        const response = await axios.post('http://localhost:3000/respaldo');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const restaurarRespaldo = async (file) => {
    const formData = new FormData();
    formData.append('respaldo', file);

    try {
        const response = await axios.post('http://localhost:3000/restaurar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al restaurar:", error);
        throw error;
    }
};

