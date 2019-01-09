/** 
 * 配置数据表、接口
 */
import axios from 'axios';

export default [{
    //表名
    name: "MENU",
    //主键（可以不设置，默认为'id'）
    keyPath:"id",
    //数据初始化方法（从服务器同步数据）
    init: (db,name) => {  
        axios.get("/menu").then((response) => {
            // 存入单条数据
            var data = response.data;
            data.uid = "menu";
            db.transaction([name], 'readwrite').objectStore(name).clear();
            var request = db.transaction([name], 'readwrite').objectStore(name).add(data);
            console.log(name+"表 更新成功");
        })
    }
}, {
    name: "LIST",
    init: (db,name) => {
        axios.get("/list").then((response) => { 
            // 存入多条数据
            var data = response.data.list;
            db.transaction([name], 'readwrite').objectStore(name).clear();
            var trans = db.transaction([name], 'readwrite');
            for (var i = 0; i < data.length; i++) {
                trans.objectStore(name).add(data[i]);
            }
            console.log(name+"表 更新成功");
        })
    }
}, {
    name: "TEST",
    init:()=>{}
}]




