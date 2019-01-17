import axios from 'axios';
import db from './database'
import uid from './uid'
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
                    db.log(JSON.stringify(config));
                    config.cancelToken = source.token;
                    let message = config.data&&config.data.need_id?{id:uid()}:{}
                    source.cancel(message);
                }
            }
            return config;
        }
    );
    instance.interceptors.response.use(function (response) {
        console.log("Before Response")
        if(response && response.data){
            return response.data
        }else{
            return response
        }
    }, function (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled');
            return Promise.resolve(error.message);
        } else {
            return Promise.reject(error);
        }
    });
    return instance;
}

export default ajax();