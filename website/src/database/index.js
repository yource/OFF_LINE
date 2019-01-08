/**
 * 建里websocket连接
 * 创建indexedDB数据库和表
 * 拉去服务器数据存入indexedDB
 * 导出数据处理方法
 */

import table1 from './table1.js'
import table2 from './table2.js'

const heartbeatUrl = "ws://localhost:8888/heartbeat";
const databaseUrl = "ws://localhost:8888/database";

/** websocket心跳机制，用于检测是否在线 **/
window.storage.setItem("networkStatus", "unknow");
var heartbeat;
const heartbeatInit = () => {
    heartbeat = new WebSocket(heartbeatUrl);
    heartbeat.onopen = () => {
        window.storage.setItem("networkStatus", "online");
        setTimeout(()=>{
            heartbeat.send("try connect")
        },500)
    }

    heartbeat.onerror = () => {
        window.storage.setItem("networkStatus", "offline");
        console.log("offline")
    }

    heartbeat.onmessage = () => {
        window.storage.setItem("networkStatus", "online");
    }

    heartbeat.onclose = () => {
        heartReconnect();
    }
}

const heartReconnect = () => {
    setTimeout(() => {
        heartbeatInit()
    }, 2000)
}

heartbeatInit();

/** 用websocket进行数据同步 **/
var websocket;
var websocketSendData; // 当前正在向服务器同步的数据
var asycStatus = "wait"; // 同步状态 wait/doing
if ("WebSocket" in window) {
    if (!window.dbWebsocket) {
        websocket = new WebSocket("ws://localhost:8888/database");
        websocket.onopen = onOpenWebsocket;
        websocket.onclose = function (evt) {
            console.log("database webscoket 关闭");
        };
        websocket.onmessage = onGetMessage;
        websocket.onerror = function (evt) {
            window.storage.setItem("networkStatus", "offline")
        };
    }
} else {
    console.log("浏览器不支持websocket")
}

// webscoket成功连接时
function onOpenWebsocket() {
    window.storage.setItem("networkStatus", "online");

}

// 接受websocket数据时
function onGetMessage() {

}

var db = {};

// 创建数据库
var database;
var createDB = window.indexedDB.open("menusifu");

createDB.onsuccess = function (event) {
    database = event.target.result;
    db.database = database;
    console.log('数据库打开成功');
};

createDB.onupgradeneeded = function (event) {
    database = event.target.result;
    db.database = database;
    console.log('数据库新建成功');
    // 新建表
    var objectStore;
    if (!database.objectStoreNames.contains('list')) {
        objectStore = database.createObjectStore('list', { keyPath: 'id' });
        objectStore.createIndex('title', 'title', { unique: false });
        console.log('list表新建成功');
    }
    if (!database.objectStoreNames.contains('test')) {
        objectStore = database.createObjectStore('test', { keyPath: 'id' });
        objectStore.createIndex('title', 'title', { unique: false });
        console.log('test表新建成功');
    }
};

createDB.onerror = function (event) {
    console.log('数据库创建失败');
};

// 新增多个数据
db.addList = function (params) {

}
// 新增单个数据
db.addListItem = function (param, successCB, failCB) {
    // param.actionType = "add";
    var request = database.transaction(['list'], 'readwrite')
        .objectStore('list')
        .add(param);

    request.onsuccess = function (event) {
        console.log('数据写入成功');
        successCB();
    };

    request.onerror = function (event) {
        failCB();
        console.log('数据写入失败');
    };
}
// 获取多个数据
db.getList = function (successCB, failCB, firstID, lastID) {
    if (!database) {
        console.log("数据库还未打开")
    } else {
        var objectStore = database.transaction('list').objectStore('list');
        var result = [];
        var record = 0;
        var date = Date.now();
        if (firstID && lastID) {
            // 获取特定数据
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor && cursor.value) {
                    if (cursor.id >= firstID && cursor.id <= lastID) {
                        result.push(cursor.value);
                        record++;
                        cursor.continue();
                    }
                } else {
                    console.log("已读取数据" + record + "条，用时：" + (Date.now() - date) + "ms")
                    successCB(result);
                }
            };
            objectStore.openCursor().onerror = function () {
                failCB();
            };
        } else {
            // 遍历所有数据
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor && cursor.value) {
                    result.push(cursor.value);
                    record++;
                    cursor.continue();
                } else {
                    console.log("已读取数据" + record + "条，用时：" + (Date.now() - date) + "ms")
                    successCB(result);
                }
            };
            objectStore.openCursor().onerror = function () {
                failCB();
            };
        }
    }

}
// 获取单个数据
db.getListItem = function (id, successCB, failCB) {
    var objectStore = database.transaction(['list']).objectStore('list');
    var request = objectStore.get(id);

    request.onerror = function (event) {
        failCB();
        console.log('读取失败，id:' + id);
    };

    request.onsuccess = function (event) {
        if (request.result) {
            successCB(request.result);
        } else {
            failCB();
            console.log('未获得数据记录，id:' + id);
        }
    };
}

// 更新单个数据
db.editListItem = function (param, successCB, failCB) {
    var request = database.transaction(['list'], 'readwrite')
        .objectStore('list')
        .put(param);

    request.onsuccess = function (event) {
        successCB();
        console.log('数据更新成功');
    };

    request.onerror = function (event) {
        failCB();
        console.log('数据更新失败');
    };
}

// 删除单个数据
db.deleteListItem = function (id, successCB, failCB) {
    var request = database.transaction(['list'], 'readwrite')
        .objectStore('list')
        .delete(id);

    request.onsuccess = function (event) {
        successCB();
        console.log('数据删除成功');
    };
    request.onerror = function (event) {
        failCB();
        console.log('数据删除失败');
    };
}

// 清空数据库
db.clear = function () {
    database.transaction(['list'], 'readwrite').objectStore('list').clear();
}

window.onunload = function () {
    database.close();
}

window.db = db;
