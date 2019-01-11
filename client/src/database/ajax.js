import axios from 'axios';
import db from './database.js'

const CancelToken = axios.CancelToken;
const source = CancelToken.source();


// 网络错误时，记录请求
function log(){
    
}

export default function (){
    if(window.sessionStorage.getItem("networkStatus")=="online"){
        return axios;
    }else{
        log()
    }
    axios.interceptors.request.use(
        (config) => {
            config.cancelToken = source.token;
            return config;
        },
        (err) => {
            const error = err;
            return Promise.reject(error);
        },
    );
}