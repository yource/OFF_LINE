/** 
 * 配置数据表名、主键、初始化接口
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
            var data = response.data;
            // 存入单条数据
            // MENU表中只有一条记录，通过 id=menu 获取
            data.id = "menu";
            // 删除原数据，加入新数据，完成更新
            db.transaction([name], 'readwrite').objectStore(name).clear();
            db.transaction([name], 'readwrite').objectStore(name).add(data);
            console.log(name + "表 更新成功");
        })
    }
}, {
    name: "LIST",
    init: (db,name) => {
        axios.get("/list").then((response) => { 
            //存入多条数据
            //每条数据有自己的id
            var data = response.data.list;
            // db.transaction([name], 'readwrite').objectStore(name).clear();
            var trans = db.transaction([name], 'readwrite');
            for (var i = 0; i < data.length; i++) {
                trans.objectStore(name).delete(data[i].id);
                trans.objectStore(name).add(data[i]);
            }
            console.log(name+"表 更新成功");
        })
    }
}, {
    name: "TEST",
    init:()=>{}
}]




