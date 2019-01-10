import * as objectStores from './objectStoreConfig.js'
/**
 * websocket心跳机制
 * 检测在线状态，触发lineOn/lineOff事件
 **/
let wss;
let heartbeat;
const websocketUrl = "ws://localhost:8888/admin";
// const websocketUrl = "ws://192.168.1.141:8080/cloudmenu/websocket/admin";

const lineOn = document.createEvent('HTMLEvents');
lineOn.initEvent('lineOn', false, false);
const lineOff = document.createEvent('HTMLEvents');
lineOff.initEvent('lineOff', false, false);
window.addEventListener("offline", function () {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.dispatchEvent(lineOff)
    }
});

const initWebsocket = () => {
    wss = new WebSocket(websocketUrl);
    wss.onopen = () => {
        if (window.storage.getItem("networkStatus") !== "online") {
            window.dispatchEvent(lineOn)
        }
        heartbeat = setInterval(() => {
            wss.send("check connect")
        }, 1000);
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
    }, 10000)
}

// 监听 lineOn/lineOff事件，重连时更新数据库
window.addEventListener("lineOn", () => {
    console.log("== online ==")
    window.storage.setItem("networkStatus", "online");
    for (let ob in objectStores) {
        objectStores[ob].init(database)
    }
})
window.addEventListener("lineOff", () => {
    console.log("== offline ==")
    window.storage.setItem("networkStatus", "offline");
})

/**
 * 初始化数据库
 * 第一次打开页面时，创建数据库和表
 * 后续打开/刷新/重连时，更新数据
 */
var db = {};
var database = null;
var openDB = window.indexedDB.open("menusifu");

openDB.onsuccess = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    console.log('open indexedDB');
    initWebsocket();
};

openDB.onupgradeneeded = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    for (let ob in objectStores) {
        if (!database.objectStoreNames.contains(objectStores[ob].name)) {
            database.createObjectStore(objectStores[ob].name, { keyPath: objectStores[ob].keyPath });
            console.log(objectStores[ob].name + '表 新建成功');
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

export default db;
