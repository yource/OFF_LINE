import axios from 'axios'
import objectStores from './objectStoreConfig.js'

/** 
 * 建立websocket心跳机制
 * 检测online/offline，存入storage
 */

window.storage.setItem("networkStatus", "unkonw");

window.addEventListener("offline", function () {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.storage.setItem("networkStatus", "offline");
    }
});

var wss;
var heartbeat;
const websocketUrl = "ws://localhost:8888/admin";
// const websocketUrl = "ws://192.168.1.141:8080/cloudmenu/websocket/admin";
const wsInit = () => {
    wss = new WebSocket(websocketUrl);

    wss.onopen = () => {
        if (window.storage.getItem("networkStatus") !== "online") {
            handleOnline()
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
            handleOffline()
        }
        wsReconnect();
    }
}

const wsReconnect = () => {
    setTimeout(() => {
        wss = null;
        wsInit();
    }, 10000)
}

const handleOnline = () => {
    console.log("== online ==")
    window.storage.setItem("networkStatus", "online");
    // online 更新数据
    for (let i = 0; i < objectStores.length; i++) {
        if (objectStores[i].init) {
            objectStores[i].init(database, objectStores[i].name)
        }
    }
}
const handleOffline = () => {
    console.log("== offline ==")
    window.storage.setItem("networkStatus", "offline");
}

/**
 * 初始化数据库
 */
var db = {};
var database = null;
var openDB = window.indexedDB.open("MENUSIFU");

openDB.onsuccess = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    console.log('open indexedDB');
    wsInit();
};

openDB.onupgradeneeded = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    for (let i = 0; i < objectStores.length; i++) {
        if (!database.objectStoreNames.contains(objectStores[i].name)) {
            database.createObjectStore(objectStores[i].name, { keyPath: objectStores[i].keyPath ? objectStores[i].keyPath : "id" });
            console.log(objectStores[i].name + '表 新建成功');
        }
    }
};

openDB.onerror = function (event) {
    console.log('数据库打开失败');
};

window.onbeforeunload = function () {
    if(database){
        database.close();
    }
}

window.db = db;
