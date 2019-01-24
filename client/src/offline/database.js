/**
 * indexedDB的操作
 * 
 **/

let db = {
    database: null, //数据库对象
    idMap: { //id对应关系
        c2s: {}, //本地ID-服务端ID
        s2c: {}  //服务端ID- 本地ID
    },
    idClear: [], //记录已同步的id，用于删除多余数据
    executing: false
};

const databaseReady = document.createEvent('HTMLEvents');
databaseReady.initEvent('databaseReady', false, false);

// 初始化indexedDB数据库
db.init = function (startHeartbeat) {
    let openDB = window.indexedDB.open("menusifu");

    openDB.onsuccess = (event) => {
        db.database = event.target.result;
        var getRequest = db.database.transaction(['idMap'], 'readwrite').objectStore('idMap').get("map");
        getRequest.onsuccess = function () {
            db.idMap = getRequest.result.map;
            window.dispatchEvent(databaseReady);
            startHeartbeat();
        }
    };

    openDB.onupgradeneeded = (event) => {
        db.database = event.target.result;
        // 新建log表，记录离线时的request
        if (!db.database.objectStoreNames.contains("log")) {
            db.database.createObjectStore("log", { autoIncrement: true });
        }
        // 新建state表，记录全局和组件内的state
        if (!db.database.objectStoreNames.contains("state")) {
            let os = db.database.createObjectStore("state", { keyPath: "keyPath" });
            os.add({ keyPath: "globalState", init: true, data: {} });
        }
        // 新建idMap表，记录前后端id对应关系
        if (!db.database.objectStoreNames.contains("idMap")) {
            let os = db.database.createObjectStore("idMap", { keyPath: "keyPath" });
            os.add({ keyPath: "map", init: true, map: db.idmap });
        }
    };

    openDB.onerror = function (event) {
        console.log('Fail to open indexedDB');
    };
}

// 记录失败的ajax请求
db.log = function (config) {
    this.database.transaction(['log'], 'readwrite').objectStore('log').add(config);
}

// 保存state
db.saveState = function (stateName, state) {
    var saveData = {
        state: db.replaceId(state),
        keyPath: stateName
    }
    var os = this.database.transaction(['state'], 'readwrite').objectStore('state');

    var saveRequest = os.put(saveData);
    saveRequest.onerror = function () {
        os.add(saveData)
    }
}

// 读取state
db.getState = function (stateName = 'globalState') {
    return new Promise(function (resolve, reject) {
        var getRequest = this.database.transaction(['state'], 'readwrite').objectStore('state').get(stateName);
        getRequest.onsuccess = function (e) {
            if (getRequest.result) {
                resolve(getRequest.result.state);
            } else {
                reject(e);
            }
        }
        getRequest.onerror = function (e) {
            reject(e);
        }
    })
}

// 保存idMap
db.saveIdMap = function (clientId) {
    this.database.transaction(['idMap'], 'readwrite').objectStore('idMap').put({
        keyPath: "map",
        map: db.idMap,
        init: false
    })
}

// 替换state里的本地id为服务端id
db.replaceId = function (obj) {
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return db.replaceId(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.id && db.idMap && db.idMap.c2s && db.idMap.c2s[obj.id]) {
            obj.id = db.idMap.c2s[obj.id];
            if (obj.need_id) {
                obj.need_id = false;
            }
            if (db.idClear.indexOf(obj.id) < 0) {
                db.idClear.push(obj.id)
            }
        }
        Object.keys(obj).forEach(key => {
            db.replaceId(obj[key])
        })
        return obj;
    }
}

// 清理idMap数据
db.clearIdMap = function () {
    for (var i = 0; i < db.idClear.length; i++) {
        delete db.idMap.c2s[db.idClear[i]]
    }
    db.idMap.s2c = {};
    Object.keys(db.idMap.c2s).map((item) => {
        db.idMap.s2c[db.idMap.c2s[item]] = item;
        return item;
    })
}

// 读取request log，并执行request
db.executeRequest = function (ajax) {
    this.executing = true;
    var readLog = db.database.transaction(['log']).objectStore('log');
    var logger = [];
    readLog.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let config = JSON.parse(cursor.value);
            config.indexedKeyPath = cursor.key;
            logger.unshift(config)
            cursor.continue();
        } else {
            if (logger.length > 0) {
                executeRequest(logger, logger.length - 1, ajax)
            }
        }
    };
}

function executeRequest(arr, idx, ajax) {
    var config = arr[idx];
    if (config.cancelToken) {
        delete config.cancelToken;
    }
    if (config.data) {
        config.data = replaceId(config.data);
    } else if (config.param) {
        config.param = replaceId(config.param);
    }
    // 遍历id，写入idMap表
    var cids = [];

    if (config.data) {
        cids = getClientID(config.data, [], []);
    } else if (config.param) {
        cids = getClientID(config.param, [], []);
    }

    ajax(config).then((response) => {
        //同步完成，删除log记录
        db.database.transaction(['log'], 'readwrite').objectStore('log').delete(arr[idx].indexedKeyPath);
        if (cids.length > 0) {
            var sids = cids.map(item => {
                var sid = response.data;
                if (item.position.length > 0) {
                    for (var i = 0; i < item.position.length; i++) {
                        sid = sid[item.position[i]]
                    };
                    item.sid = sid.id;
                } else {
                    item.sid = sid.id;
                }
                return item;
            })
            sids.map(item => {
                db.idMap.c2s[item.cid] = item.sid;
                db.idMap.s2c[item.sid] = item.cid;
                return item;
            })
        }
        // 进行下一个request同步
        if (idx > 0) {
            setTimeout(() => {
                executeRequest(arr, idx - 1, ajax);
            }, 10)
        } else {
            db.executing = false;
        }
    })
}

function getClientID(obj, position, result) {
    if (obj instanceof Array === true) {
        return obj.map((item, index) => {
            return getClientID(item, [...position, index], result)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.need_id) {
            result.push({
                cid: obj.id,
                position: position
            })
            delete obj.id
        }
        Object.keys(obj).forEach(key => {
            getClientID(obj[key], [...position, key], result)
        })
    }
    return result;
}

function replaceId(obj) {
    if (obj instanceof Array === true) {
        return obj.map(item => {
            return replaceId(item)
        })
    } else if (typeof obj === "object" && obj != null) {
        if (obj.id && db.idMap && db.idMap.c2s && db.idMap.c2s[obj.id]) {
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

window.onbeforeunload = function () {
    if (db.database) {
        // 检查所有state里面的id，清理idMaP

        db.database.close();
    }
}

export default db;