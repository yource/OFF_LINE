class Table {
    constructor(db, name, key, indexs, syncFun) {
        this.db = db;
        this.name = name; // 表名
        this.key = key; // 主键名
        this.indexs = indexs; //索引（可用于索引的列名）
        this.syncFun = syncFun; //向服务器同步的接口和方法
    }

    objectStore = null;

    // 创建数据表，并配置主键和索引
    create() {
        if (!this.db.objectStoreNames.contains('person')) {
            this.objectStore = this.db.createObjectStore(this.name, { keyPath: this.key });
            for (let i = 0; i < this.indexs.length; i++) {
                this.objectStore.createIndex(this.indexs[i].name, this.indexs[i].name, {
                    unique: this.indexs[i].unique
                });
            }
            // 标记此条数据是否需要向服务器同步
            this.objectStore.createIndex("syncFlag", "syncFlag", { unique: false });
        }
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
    del(param, successCB, failCB) {
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

export default Table;