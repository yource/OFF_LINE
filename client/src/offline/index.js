import esPromise from 'es6-promise';
import 'isomorphic-fetch';
import db from './database'
import ws from './websocket'
import axios from 'axios'

esPromise.polyfill();

// indexedDB初始化之后，连接websocket
db.init(ws.initWebsocket({
	heartbeatTime: 1000, //心跳检测的事件间隔
	reconnectTime: 2000, //尝试重连的时间间隔
	websocketUrl: 'ws://localhost:8888'
}));

// 监听自定义的line事件
window.addEventListener("lineOn", () => {
	window.storage.setItem("networkStatus", "online");
	db.executeRequest(ajax)
})
window.addEventListener("lineOff", () => {
	window.storage.setItem("networkStatus", "offline");
})

// 请求方法，要求返回一个promise
function ajax(config){
	return axios(config)
}
