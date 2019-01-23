/**
 * websocket心跳机制
 * 注册lineOn/lineOff事件
 **/

import './storage';

let wss = null;
let heartbeat;
let heartbeatResponseCheck;
const heartbeatTime = 1000; //心跳检测的事件间隔
const reconnectTime = 2000; //尝试重连的时间间隔
let count = 0;
let msgCount = 0;
const initWebsocket = () => {
    if (!window.navigator.onLine) {
        return;
    }
    wss = new WebSocket(websocketUrl);
    wss.onopen = () => {
        if (window.storage.getItem("networkStatus") !== "online") {
            window.dispatchEvent(lineOn)
        }
        count++;
        heartbeatCheck();
        wss.onmessage = (msg) => {
            msgCount++;
            if (heartbeat) {
                window.clearTimeout(heartbeat);
                heartbeat = null;
            }
            if (heartbeatResponseCheck) {
                window.clearTimeout(heartbeatResponseCheck)
                heartbeatResponseCheck = null;
            }
            heartbeatCheck();
        }
        wss.onclose = () => {
            hanldeWebscoketError()
        }
    }
    wss.onerror = () => {
        if (wss.onclose) {
            wss.close();
        } else {
            hanldeWebscoketError()
        }
    }
}

const hanldeWebscoketError = function() {
    count = 0;
    msgCount = 0;
    if (heartbeat) {
        window.clearTimeout(heartbeat);
        heartbeat = null;
    }
    if (heartbeatResponseCheck) {
        window.clearTimeout(heartbeatResponseCheck)
        heartbeatResponseCheck = null;
    }
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.dispatchEvent(lineOff)
    }
    wss = null;
    setTimeout(() => {
        initWebsocket();
    }, reconnectTime)
}

const heartbeatCheck = function() {
    if (heartbeat) {
        window.clearTimeout(heartbeat)
        heartbeat = null;
    }
    if (heartbeatResponseCheck) {
        window.clearTimeout(heartbeatResponseCheck)
        heartbeatResponseCheck = null;
    }

    heartbeat = setTimeout(() => {
        if (!wss || !wss.close) return;
        count++;
        wss.send(count);
        heartbeatResponseCheck = setTimeout(() => {
            if (count - msgCount > 0 && wss) {
                if (window.storage.getItem("networkStatus") !== "offline") {
                    window.dispatchEvent(lineOff)
                }
                wss.close()
            }
        }, heartbeatTime);
    }, heartbeatTime);
}

window.onbeforeunload = function() {
    if (wss.close) {
        wss.close();
    }
    wss = null;
}

// 自定义line事件
const lineOn = document.createEvent('HTMLEvents');
lineOn.initEvent('lineOn', false, false);

const lineOff = document.createEvent('HTMLEvents');
lineOff.initEvent('lineOff', false, false);

// 初始保存networkStatus
if (window.navigator.onLine) {
    window.storage.setItem("networkStatus", "online");
} else {
    window.storage.setItem("networkStatus", "offline");
    window.dispatchEvent(lineOff);
}

// 监听html5的line事件
window.addEventListener("offline", function() {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.dispatchEvent(lineOff);
    }
    if (!!wss) {
        wss.close();
        wss = null;
    }
});
window.addEventListener("online", function() {
    if (window.storage.getItem("networkStatus") !== "online") {
        if (!!wss && !!wss.close) {
            wss.close();
        } else {
            initWebsocket();
        }
    }
});

// 监听自定义的line事件
window.addEventListener("lineOn", () => {
    console.log("== online ==")
    window.storage.setItem("networkStatus", "online");
})
window.addEventListener("lineOff", () => {
    console.log("== offline ==")
    window.storage.setItem("networkStatus", "offline");
})

export default initWebsocket;