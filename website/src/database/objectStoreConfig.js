/** 
 * 配置数据表、接口
 */
import axios from 'axios';

export default [{
    //表名
    name: "MENU",
    //自动主键
    autoIncrement:true,
    //数据初始化方法（从服务器同步数据）
    init: (db,name) => {  
        axios.get("/menu").then((response) => {
            var data = response.data;
            console.log(name)
            // 存入单条数据
            var request = db.transaction([name], 'readwrite').objectStore(name).add(data);
            request.onsuccess = (event)=> {
                console.log(name+' 数据初始化成功');
            };

            request.onerror = (event)=> {
                console.log(name+' 数据初始化失败');
            };
        }).catch((error) => {
            console.log("get error",error)
         })
    }
}, {
    name: "LIST",
    //自定义主键
    key: "uid",  
    init: (db) => {
        axios.get("/list").then((response) => { 
            var data = response.data.list;
            // 存入多条数据
            var trans = db.transaction([this.name], 'readwrite');
            for (var i = 0; i < data.length; i++) {
                trans.objectStore(this.name).add(data[i]);
            }
        }).catch((error) => { })
    }
}, {
    name: "TEST",
    key: "uid",
    init:()=>{}
}]




