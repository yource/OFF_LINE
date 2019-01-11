/** 
 * 配置数据表
 * 继承 ObjectStoreClass，自动生成增删改查接口
 */

import ObjectStore from './ObjectStore'

export const menu = new ObjectStore({
    //表名
    name: "menu",
    //主键，默认为 "id"
    keyPath: "id",
    //索引，默认为空
    indexs: [],
    //跟服务器同步的url
    url:"/menu",
    //get方法的参数（用于获取初始化数据），默认为空，此参数会拼接到url
    initParam: {version:1},
    // 单条存储或多条存储，默认多条(false)
    single:true
})

export const list = new ObjectStore({
    name: "list",
    url:"/list"
})
