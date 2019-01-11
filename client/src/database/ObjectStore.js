import axios from 'axios';

class ObjectStore {
    constructor(config) {
        this.name = config.name; // 表名
        this.keyPath = config.keyPath || "id"; // 主键名
        this.indexs = config.indexs || []; //索引（需要用作索引的列名）
        this.initParam = config.initParam || {}; //向服务器同步的接口和方法
        this.single = !!config.single; //是否只存储一条数据
        this.url = config.url; //同步接口
    }
    // 初始化方法
    init(db) {
        axios.get(this.url, { params: this.initParam}).then((response) => {
            var data = response.data;
            if(this.single){
                // 存入单条数据
                data[this.keyPath] = this.name;
                db.transaction([this.name], 'readwrite').objectStore(this.name).clear();
                db.transaction([this.name], 'readwrite').objectStore(this.name).add(data);
                console.log(this.name + "表 更新成功");
            }else{
                //存入多条数据
                var trans = db.transaction([this.name], 'readwrite');
                trans.objectStore(this.name).clear();
                for (var i = 0; i < data.length; i++) {
                    trans.objectStore(this.name).add(data[i]);
                }
                console.log(this.name + "表 更新成功");
            }
        })
    }

    // 添加数据
    add(param, successCB, failCB) {
        param.syncType = true;
        let request = this.db.transaction([this.name], 'readwrite')
            .objectStore(this.name)
            .add(param);

        request.onsuccess = function (event) {
            successCB();
        };

        request.onerror = function (event) {
            failCB();
        };
    }

    // 修改数据
    edit(param, successCB, failCB) {
        param.syncType = true;
        var request = this.db.transaction([this.name], 'readwrite')
            .objectStore(this.name)
            .put(param);

        request.onsuccess = function (event) {
            successCB();
        };

        request.onerror = function (event) {
            failCB();
        };
    }

    /** 
     * 删除数据
     * 只根据主键
     * param {id:1}
     */
    delete(param, successCB, failCB) {
        var request = this.db.transaction([this.name], 'readwrite')
            .objectStore(this.name)
            .delete(param[this.key]);

        request.onsuccess = function (event) {
            successCB();
        };

        request.onerror = function (event) {
            failCB();
        };
    }


}

export default ObjectStore;