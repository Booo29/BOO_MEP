import axios from 'axios';

export const getMateriasInstitucion = async (idInstitucion) => {
    try {
        const response = await axios.get(`http://localhost:3000/materiaInstitucion/${idInstitucion}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postMateriaInstitucion = async (datos) => {
    try {
        const response = await axios.post('http://localhost:3000/materiaInstitucion', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const putMateriaInstitucion = async (datos) => {
    try {
        const response = await axios.put('http://localhost:3000/materiaInstitucion', datos);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteMateriaInstitucion = async (idMatIns) => {
    try {
        const response = await axios.delete(`http://localhost:3000/materiaInstitucion/${idMatIns}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}