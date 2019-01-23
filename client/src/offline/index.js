import db from './database'
import axios from 'axios'

db.init();

window.addEventListener("lineOn", function() {
	db.syncRequest(requestFunc)
})

// 请求方法，要求返回一个promise
function requestFunc(config){
	return axios(config)
}
