import axios from 'axios'

let wss;
let heartbeat;
const heartbeatTime = 1000;  //心跳检测的事件间隔
const reconnectTime = 20000; //尝试重连的时间间隔
const websocketUrl = "ws://localhost:8888/admin";
// const websocketUrl = "ws://192.168.1.141:8080/cloudmenu/websocket/admin";

/**
 * 注册全局lineOn/lineOff/databaseReady事件
 * 监听方法 window.addEventListener("lineOn",callback)
 */
window.storage.setItem("networkStatus", "unknow");

const lineOn = document.createEvent('HTMLEvents');
lineOn.initEvent('lineOn', false, false);

const lineOff = document.createEvent('HTMLEvents');
lineOff.initEvent('lineOff', false, false);

const databaseReady = document.createEvent('HTMLEvents');
databaseReady.initEvent('databaseReady', false, false);

window.addEventListener("offline", function () {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.dispatchEvent(lineOff)
    }
});
window.addEventListener("lineOn", () => {
    console.log("== online ==")
    window.storage.setItem("networkStatus", "online");
    // 遍历log表，向服务端同步数据
    var readLog = database.transaction(['log']).objectStore('log');
    var logger = [];
    readLog.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let config = JSON.parse(cursor.value);
            config.indexedKeyPath = cursor.key;
            logger.unshift(config)
            cursor.continue();
        } else {
            syncLog(logger, logger.length - 1)
        }
    };
})
window.addEventListener("lineOff", () => {
    console.log("== offline ==")
    window.storage.setItem("networkStatus", "offline");
})

/**
 * 处理log记录
 * 递归执行ajax
 */
function syncLog(arr, idx) {
    var config = arr[idx];
    axios(config).then((response) => {
        //ajax完成，删除log记录
        database.transaction(['log'], 'readwrite').objectStore('log').delete(arr[idx].indexedKeyPath);
        // 遍历id，写入idMap表
        var cids = [];
        if (config.data) {
            cids = getClientID(config.data, [], []);
        } else if (config.param) {
            cids = getClientID(config.param, [], []);
        }
        if (cids.length > 0) {
            var sids = cids.map(item => {
                var sid = Object.assign({}, response.data);
                if (item.position.length > 0) {
                    for (var i = 0; i < item.position.length; i++) {
                        sid = sid[item.position[i]]
                    };
                    item.sid = sid.id;
                } else {
                    item.sid = sid.id
                }
                return item;
            })
            sids.map(item => {
                database.transaction(['idMap'], 'readwrite').objectStore('idMap').add({
                    cid: item.cid,
                    sid: item.sid
                });
                return item;
            })
        }


        getClientID(config, [], []);
        // 进行下一个ajax同步
        if (idx > 0) {
            setTimeout(() => {
                syncLog(arr, idx - 1);
            }, 10)
        } else {
            console.log("log 处理完成")
        }
    }, (error) => {
        console.log("log同步失败 ", idx)
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
        }
        Object.keys(obj).forEach(key => {
            getClientID(obj[key], [...position, key], result)
        })
    }
    return result;
}

/**
 * websocket心跳机制
 * 检测在线状态，触发lineOn/lineOff事件
 **/
const initWebsocket = () => {
    wss = new WebSocket(websocketUrl);
    wss.onopen = () => {
        if (window.storage.getItem("networkStatus") !== "online") {
            window.dispatchEvent(lineOn)
        }
        heartbeat = setInterval(() => {
            wss.send("check connect")
        }, heartbeatTime);
    }
    wss.onerror = () => {
        wss.close();
    }
    wss.onmessage = () => { }
    wss.onclose = () => {
        if (heartbeat) {
            heartbeat = window.clearInterval(heartbeat);
        }
        if (window.storage.getItem("networkStatus") !== "offline") {
            window.dispatchEvent(lineOff)
        }
        wsReconnect();
    }
}

const wsReconnect = () => {
    setTimeout(() => {
        wss = null;
        initWebsocket();
    }, reconnectTime)
}

/**
 * 初始化数据库
 * 第一次打开页面时，创建数据库和表
 * 后续打开/刷新/重连时，更新数据
 */

let db = {
    database: null //数据库对象
};
let database = null;
let openDB = window.indexedDB.open("menusifu");

openDB.onsuccess = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    console.log('open indexedDB');
    window.dispatchEvent(databaseReady);
    initWebsocket();
};

openDB.onupgradeneeded = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    // 新建log表
    if (!database.objectStoreNames.contains("log")) {
        database.createObjectStore("log", { autoIncrement: true });
        console.log('log表 新建成功');
    }
    // 新建state表
    if (!database.objectStoreNames.contains("state")) {
        let os = database.createObjectStore("state", { keyPath: "stateKey" });
        os.add({ stateKey: "state", stateInit: true });
        console.log('state表 新建成功');
    }
    // 新建idMap表
    if (!database.objectStoreNames.contains("idMap")) {
        database.createObjectStore("idMap", { keyPath: "cid" });
        console.log('state表 新建成功');
    }
};

openDB.onerror = function (event) {
    console.log('数据库打开失败');
};

window.onbeforeunload = function () {
    if (database) {
        database.close();
    }
}

// 记录失败的ajax请求
db.log = function (config) {
    this.database.transaction(['log'], 'readwrite').objectStore('log').add(config);
}

// 保存全局state
db.saveState = function (state) {
    let request = this.database.transaction(['state'], 'readwrite').objectStore('state').put({
        ...state,
        stateKey: "state"
    });
    request.onsuccess = function () {
        console.log("SAVE STATE SUCCESS")
    }
    request.onerror = function () {
        console.log("SAVE STATE ERROR")
    }
}

//saveClientId
db.saveClientId = function (clientId) {
    this.database.transaction(['idMap'], 'readwrite').objectStore('idMap').add({
        cid: clientId
    })
}


export default db;