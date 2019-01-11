import axios from 'axios'
import * as objectStores from './objectStoreConfig.js'

let wss;
let heartbeat;
const heartbeatTime = 1000;  //心跳检测的事件间隔
const reconnectTime = 2000; //尝试重连的时间间隔
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
    readLog.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        var successCount = 0;
        var failCount = 0;

        if (cursor) {
            console.log("READ LOG",cursor.value)
            axios({
                method: cursor.value.method,
                url: cursor.value.url,
                data: cursor.value.to
            }).then(()=>{
                successCount++;
                db.objectStore('log').delete(cursor.value.key);
            }).catch(()=>{
                failCount++;
            })
            cursor.continue();
        } else {
            console.log('log提交完成。成功：'+successCount+'条，失败：' + failCount+'条');
            for (let ob in objectStores) {
                objectStores[ob].init(database)
            }
        }
    };
})
window.addEventListener("lineOff", () => {
    console.log("== offline ==")
    window.storage.setItem("networkStatus", "offline");
})

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
let firstOpen = false; //标记是否首次打开页面
let openDB = window.indexedDB.open("menusifu");

openDB.onsuccess = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    console.log('open indexedDB');
    window.dispatchEvent(databaseReady);
    initWebsocket();
};

openDB.onupgradeneeded = (event) => {
    firstOpen = true;
    database = event.target.result;
    db.database = event.target.result;
    // 新建log表，自增主键
    if (!database.objectStoreNames.contains("log")) {
        database.createObjectStore("log", { autoIncrement: true });
        console.log('log表 新建成功');
    }
    // 新建配置文件中的表
    for (let ob in objectStores) {
        if (!database.objectStoreNames.contains(objectStores[ob].name)) {
            database.createObjectStore(objectStores[ob].name, { keyPath: objectStores[ob].keyPath });
            console.log(objectStores[ob].name + '表 新建成功');
            // 初始化数据表（indexedDB没有数据前，无法操作页面）
            // 逻辑待补充...
        }
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

function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}
db.uuid = uuid;
db.objectStore = function (name) {
    return this.database.transaction([name], 'readwrite').objectStore(name)
}
/**
 * 数据库操作方法（添加/修改/删除）
 * name 表名
 * data 数据
 * 返回一个Promise
 */
db.add = (name, data) => {
    return new Promise((resolve, reject) => {
        var addRequest = db.objectStore(name).add(data);
        addRequest.onsuccess = () => {
            resolve();
            let logInfo = {
                url: objectStores[name].url,
                method: "post",
                name,
                from: null,
                to: data
            }
            console.log("LOG", logInfo);
            db.objectStore("log").add(logInfo);
        }
        addRequest.onerror = (e) => {
            reject();
            console.log("ADD ERROR",e)
        }
    })
}

db.edit = (name, data) => {
    return new Promise((resolve, reject) => {
        let logInfo = {
            url: objectStores[name].url,
            method: "put",
            name,
            from: null,
            to: data
        }
        var oldValueRequest = db.objectStore(name).get(data[objectStores[name].keyPath]);
        oldValueRequest.onsuccess = (e) => {
            logInfo.from = oldValueRequest.result;
            var editRequest = db.objectStore(name).put(data);
            editRequest.onsuccess = () => {
                resolve();
                console.log("LOG", logInfo);
                db.objectStore("log").add(logInfo);
            }
            editRequest.onerror = (e) => {
                console.log("EDIT ERROR", e)
                reject()
            }
        }

    })
}

db.delete = (name, key) => {
    return new Promise((resolve, reject) => {
        let logInfo = {
            url: objectStores[name].url,
            method: "put",
            name,
            from: null,
            to: null
        }
        var oldValueRequest = db.objectStore(name).get(key);
        oldValueRequest.onsuccess = (e) => {
            logInfo.from = oldValueRequest.result;
            var delRequest = db.objectStore(name).delete(key);
            delRequest.onsuccess = () => {
                resolve();
                console.log("LOG", logInfo);
                db.objectStore("log").add(logInfo);
            }
            delRequest.onerror = (e) => {
                console.log("DELETE ERROR", e)
                reject()
            }
        }
    })
}

export default db;
