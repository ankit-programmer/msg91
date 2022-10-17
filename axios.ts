import axios from 'axios';

const customAxios = axios.create({
    timeout: 10000
});

const requestHandler = (request: any) => {
    request.params = {...request.params, "pluginsource": "1100"};
    return request;
}

const errorHandler = (error: any) => {
    return Promise.reject(error);
}

customAxios.interceptors.request.use(request => requestHandler(request), (error) => errorHandler(error));

export default customAxios;