import uid from './uid'
import db from './database'

// 基于fetch
// 根据networkStatus判断是否进行请求
// 离线时，记录config和本地id
// 在线时，替换参数中的本地id

function $fetch(config) {
    if (window.storage.getItem("networkStatus") === "online" && db.executing === false) {
        if (config.data) {
            config.data = replaceId(config.data);
        }
        return fetch(config.url, {
            method: config.type,
            body: config.data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            let contentType = response.headers.get('content-type')
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json().then(r => Promise.reject(r))
            }
            return response.text().then(r => Promise.reject(r))
        }).then(function (response) {
            var data = response.json();
            return replaceServerId(data);
        });
    } else {
        // 离线时依然执行成功的回调
        let responseData = {};
        if (config.type !== 'get' && config.data) {
            if (config.data && checkNeedID(config.data, false)) {
                responseData = makeID(Object.assign({}, config.data))
            }
            db.log(JSON.stringify(config));
        }
        return new Promise(function (resolve, reject) {
            resolve(responseData)
        })
    }
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

function replaceId(obj) { //将参数中的本地id替换为服务器id
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return replaceId(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.id && db.idMap.c2s[obj.id]) {
            obj.id = db.idMap.c2s[obj.id];
            if (obj.need_id) {
                obj.need_id = false;
            }
        }
        if (obj.mapId) {
            obj[obj.mapId] = db.idMap.c2s[obj[obj.mapId]] || obj[obj.mapId];
            obj.mapId = false;
        }
        Object.keys(obj).forEach(key => {
            replaceId(obj[key])
        })
        return obj;
    }
}

function replaceServerId(obj) { //将返回值中的服务器id替换为本地id
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return replaceServerId(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.id && db.idMap.s2c[obj.id]) {
            obj.id = db.idMap.s2c[obj.id];
        }
        Object.keys(obj).forEach(key => {
            replaceServerId(obj[key])
        })
        return obj;
    }
}

export default $fetch;