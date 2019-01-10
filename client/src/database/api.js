import db from './index'

/**
 * db.objectStore(name).get(id) 获取单个数据
 * db.objectStore(name).openCursor() 逐个遍历数据
 * db.objectStore(name).add(param) 添加数据
 * db.objectStore(name).put(param) 修改数据
 * db.objectStore(name).delete(id) 删除数据
 */

export default {
    getList(){
        return db.objectStore("list").openCursor
    },
    getMenu(key){
        return db.objectStore("menu").get(key)
    }
}