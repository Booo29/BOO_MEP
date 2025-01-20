import axios from 'axios';

export const getMaterias = async () => {
    try {
        const response = await axios.get('http://localhost:3000/materia');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postMateria = async (nombre) => {
    try {
        const response = await axios.post('http://localhost:3000/materia', { nombre });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putMateria = async (nombre, idMateria) => {
    try {
        const response = await axios.put('http://localhost:3000/materia', { nombre, idMateria });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteMateria = async (idMateria) => {
    try {
        const response = await axios.delete(`http://localhost:3000/materia/${idMateria}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}