import axios from 'axios';
import db from '../database'
const instance = axios.create();
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

function ajax() {
    instance.interceptors.request.use(
        (config) => {
            if (window.storage.getItem("networkStatus") !== "online") {
                config.cancelToken = source.token;
                source.cancel("OFFLINE");
                db.log(JSON.stringify(config));
            }
            return config;
        }
    );
    // instance.interceptors.response.use(function (response) {
    //     return response;
    // }, function (error) {
    //     // 对响应错误做点什么
    //     return Promise.reject(error);
    // });
    // return instance;
}

export default ajax();