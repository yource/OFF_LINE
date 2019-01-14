import axios from 'axios';
import db from './database'
const instance = axios.create();
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
/**
 * 离线状态下，ajax请求会被拦截
 * 返回undefined，执行success回调
 */
function ajax() {
    instance.interceptors.request.use(
        (config) => {
            if (window.storage.getItem("networkStatus") === "offline") {
                // 对非get请求进行记录
                if(config.method!=='get'){
                    config.cancelToken = source.token;
                    source.cancel("OFFLINE");
                    db.log(JSON.stringify(config));
                }
            }
            return config;
        }
    );
    instance.interceptors.response.use(function (response) {
        if(response && response.data){
            return response.data
        }else{
            return response
        }
    }, function (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
        } else {
            return Promise.reject(error);
        }
    });
    return instance;
}

export default ajax();