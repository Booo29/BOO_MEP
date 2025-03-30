import axios from 'axios';

export const GetInformeAsistenciaEstudiante = async (seccionId, estudianteId, fechaInicio, fechaFin) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/asistencia/?seccionId=${seccionId}&estudianteId=${estudianteId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetInformeAsistenciaSeccion = async (seccionId, fechaInicio, fechaFin) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/asistencia/?seccionId=${seccionId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetInformeNotasEstudiante = async (estudianteID, seccionID, periodoID) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/notas/?estudianteID=${estudianteID}&seccionID=${seccionID}&periodoID=${periodoID}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetInformeNotasSeccion = async (seccionID, periodoID) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/notas/?seccionID=${seccionID}&periodoID=${periodoID}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetAsistenciaTotalEstudiante = async (estudianteId, seccionId, periodoID) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/asistencia/total/?estudianteId=${estudianteId}&seccionId=${seccionId}&periodoID=${periodoID}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetAsistenciaTotalSeccion = async (seccionID, periodoID) => {
    try {
        const response = await axios.get(`http://localhost:3000/informe/asistencia/total/?seccionId=${seccionID}&periodoID=${periodoID}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}