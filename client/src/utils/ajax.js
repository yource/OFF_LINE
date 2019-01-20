import axios from 'axios';
import db from './database'
import uid from './uid'

const instance = axios.create();
const CancelToken = axios.CancelToken;
/**
 * 离线状态下，ajax请求会被拦截
 * 返回undefined，执行success回调
 */
function ajax() {
    instance.interceptors.request.use(
        (config) => {
            if (window.storage.getItem("networkStatus") === "offline") {
                // 对非get请求进行记录
                if (config.method !== 'get') {
                    db.log(JSON.stringify(config));
                    let source = CancelToken.source();
                    config.cancelToken = source.token;
                    let message = "REQUEST CANCEL";
                    // 检测参数中是否包含need_id属性
                    // 如果有need_id=true，则在对应位置生成id
                    // 保持数据结构不变，作为返回值返回
                    if (config.data && checkNeedID(config.data, false)) {
                        message = makeID(Object.assign({}, config.data))
                        config.data = message;
                    } else if (config.param && checkNeedID(config.param, false)) {
                        message = makeID(Object.assign({}, config.param));
                        config.param = message;
                    }
                    source.cancel(message);
                }
            } else {
                // 在线状态下，替换参数中的本地id为服务器id
                if(config.data){
                    config.data = replaceId(config.data);
                }else if (config.param){
                    config.param = replaceId(config.param);
                }
            }
            return config;
        }
    );
    instance.interceptors.response.use(function (response) {
        console.log("Before Response")
        if (response && response.data) {
            return response.data
        } else {
            return response
        }
    }, function (error) {
        if (axios.isCancel(error)) {
            return Promise.resolve(error.message);
        } else {
            return Promise.reject(error);
        }
    });
    return instance;
}

// 检测对象是否有need_id属性
function checkNeedID(obj, flag) {
    if (flag === true) {
        return true;
    }
    if (obj instanceof Array === true) {
        obj.forEach(item => {
            flag = checkNeedID(item, flag);
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.need_id) {
            flag = true;
        } else {
            Object.keys(obj).forEach(function (key) {
                flag = checkNeedID(obj[key], flag)
            });
        }
    }
    return flag;
}

// 遍历对象，生成id
function makeID(obj) {
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return makeID(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.need_id) {
            obj.id = uid();
        }
        Object.keys(obj).forEach(key => {
            makeID(obj[key])
        })
        return obj;
    }
}

function replaceId(obj){
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return replaceId(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.id && !!db.idMap[obj.id]) {
            obj.id = db.idMap[obj.id];
            if(obj.need_id){
                obj.need_id = false;
            }
        }
        Object.keys(obj).forEach(key => {
            replaceId(obj[key])
        })
        return obj;
    }
}

export default ajax();