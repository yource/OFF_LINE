/**
 * websocket心跳机制
 * 注册lineOn/lineOff事件
 **/

import './storage';

let ws = {
    wss: null,
    heartbeatTime: 1000, //心跳检测的事件间隔
    reconnectTime: 2000, //尝试重连的时间间隔
    websocketUrl: 'ws://localhost:8888'
    // websocketUrl: 'ws://192.168.1.141:8080/cloudmenu/websocket/admin'
}

let count = 0;
let msgCount = 0;
let heartbeat = null;  //发送心跳的定时器
let heartbeatResponseCheck = null; //检测心跳返回的定时器
ws.initWebsocket = function (config) {
    if (!window.navigator.onLine) return;
    if (config.heartbeatTime) this.heartbeatTime = config.heartbeatTime;
    if (config.reconnectTime) this.reconnectTime = config.reconnectTime;
    if (config.websocketUrl) this.websocketUrl = config.websocketUrl;

    this.wss = new WebSocket(this.websocketUrl);
    this.wss.onopen = () => {
        if (window.storage.getItem("networkStatus") !== "online") {
            window.dispatchEvent(lineOn)
        }
        count++;
        heartbeatCheck();
        this.wss.onmessage = (msg) => {
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
        this.wss.onclose = () => {
            hanldeWebscoketError()
        }
    }
    this.wss.onerror = () => {
        if (this.wss.onclose) {
            this.wss.close();
        } else {
            hanldeWebscoketError()
        }
    }
}

const hanldeWebscoketError = function () {
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
    ws.wss = null;
    setTimeout(() => {
        ws.initWebsocket();
    }, ws.reconnectTime)
}

const heartbeatCheck = function () {
    if (heartbeat) {
        window.clearTimeout(heartbeat)
        heartbeat = null;
    }
    if (heartbeatResponseCheck) {
        window.clearTimeout(heartbeatResponseCheck)
        heartbeatResponseCheck = null;
    }

    heartbeat = setTimeout(() => {
        if (!ws.wss || !ws.wss.close) return;
        count++;
        ws.wss.send(count);
        heartbeatResponseCheck = setTimeout(() => {
            if (count - msgCount > 0 && ws.wss) {
                if (window.storage.getItem("networkStatus") !== "offline") {
                    window.dispatchEvent(lineOff)
                }
                ws.wss.close()
            }
        }, ws.heartbeatTime);
    }, ws.heartbeatTime);
}

window.onbeforeunload = function () {
    if (ws.wss.close) {
        ws.wss.close();
    }
    ws.wss = null;
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
window.addEventListener("offline", function () {
    if (window.storage.getItem("networkStatus") !== "offline") {
        window.dispatchEvent(lineOff);
    }
    if (!!ws.wss) {
        ws.wss.close();
        ws.wss = null;
    }
});
window.addEventListener("online", function () {
    if (window.storage.getItem("networkStatus") !== "online") {
        if (!!ws.wss && !!ws.wss.close) {
            ws.wss.close();
        } else {
            ws.initWebsocket();
        }
    }
});

export default ws;