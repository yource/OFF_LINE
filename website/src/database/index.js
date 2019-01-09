import axios from 'axios'
import objectStores from './objectStoreConfig.js'

const websocketUrl = "ws://localhost:8888/admin";

// const websocketUrl = "ws://192.168.1.141:8080/cloudmenu/websocket/admin";

/**
 * 初始化数据库
 */
var db = {};
var database = null;
var updateDB = null;
var dbVersion = 0;
var openDB = window.indexedDB.open("menusifu");
console.log(objectStores)

openDB.onsuccess = (event) => {
    database = event.target.result;
    dbVersion = database.version;
    db.database = event.target.result;
    console.log('数据库打开成功， version: ' + dbVersion);
    var needUpdate = false;
    for (let i = 0; i < objectStores.length; i++) {
        if (!database.objectStoreNames.contains(objectStores[i].name)) {
            needUpdate = true;
            break;
        }
    }
    if (needUpdate) {
        database.close();
        openDB = null;
        updateDB = window.indexedDB.open("menusifu", dbVersion + 1);
        updateDB.onupgradeneeded = function (event) {
            database = event.target.result;
            db.database = event.target.result;
            console.log('update onupgradeneeded');
            var objectStore;
            for (let i = 0; i < objectStores.length; i++) {
                if (!database.objectStoreNames.contains(objectStores[i].name)) {
                    objectStore = database.createObjectStore(objectStores[i].name, { keyPath: objectStores[i].key });
                    objectStore.createIndex('actionFlag', 'actionFlag', { unique: false });
                    console.log(objectStores[i].name + '表 新建成功');
                    if (objectStores[i].init){
                        objectStores[i].init(database, objectStores[i].name)
                    }
                }
            }
        };
        updateDB.onerror = function () {
            console.log("update error")
        }
    }
};

openDB.onupgradeneeded = (event) => {
    database = event.target.result;
    db.database = event.target.result;
    var objectStore;
    for (let i = 0; i < objectStores.length; i++) {
        if (!database.objectStoreNames.contains(objectStores[i].name)) {
            objectStore = database.createObjectStore(objectStores[i].name, { keyPath: objectStores[i].key });
            objectStore.createIndex('actionFlag', 'actionFlag', { unique: false });
            console.log(objectStores[i].name + '表 新建成功');
            objectStores[i].init(database)
        }
    }
};

openDB.onerror = function (event) {
    console.log('数据库打开失败');
};

// 向服务器推送本地改动
const pushDatabase = () => {
    console.log("正在推送数据...")
    console.log(database.objectStoreNames);
}

// 标记 在线/离线
window.storage.setItem("networkStatus", "unkonw");

window.addEventListener("offline", function () {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.storage.setItem("networkStatus", "offline");
    }
});

/** 
 * 建立websocket
 * 检测服务器连接情况
 */
var wss;
var heartbeat;
const wsInit = () => {
    wss = new WebSocket(websocketUrl);

    wss.onopen = () => {
        console.log("websocket connect success");
        window.storage.setItem("networkStatus", "online");
        heartbeat = setInterval(() => {
            wss.send("check connect")
        }, 1000);
        // 进行数据同步
        setTimeout(() => {
            if (database) {
                pushDatabase();
            } else {
                console.log("indexDB未准备就绪")
            }
        }, 200)
    }

    wss.onerror = () => {
        wss.close();
    }

    wss.onmessage = (str) => { }

    wss.onclose = () => {
        console.log("websocket close");
        if (heartbeat) {
            heartbeat = window.clearInterval(heartbeat);
        }
        if (window.storage.getItem("networkStatus") !== "offline") {
            window.storage.setItem("networkStatus", "offline");
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

// wsInit();

/** 
 * ajax替换方法
 * 整合indexedDB操作
 */






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
