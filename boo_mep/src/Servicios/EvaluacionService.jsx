import axios from 'axios';

export const GetNivelesDesempeno = async () => {
    try {
        const response = await axios.get('http://localhost:3000/nivelesDesempeno');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetIndicadores = async () => {
    try {
        const response = await axios.get('http://localhost:3000/indicadores');
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const GetEvaluaciones = async (Eva_Materia, Eva_Grado, Periodo_idPeriodo) => {
    try {
        const response = await axios.get(`http://localhost:3000/evaluaciones/?Eva_Materia=${Eva_Materia}&Eva_Grado=${Eva_Grado}&Periodo_idPeriodo=${Periodo_idPeriodo}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PostNivelesDesempeno = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/nivelesDesempeno', data);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PostIndicadores = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/indicadores', data);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PostEvaluaciones = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/evaluaciones', data);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const PostIndicadoresEvaluacionNiveles = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/indicadoresEvaluacionNiveles', data);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


export const DeleteEvaluacion = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/evaluaciones/${id}`);
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}