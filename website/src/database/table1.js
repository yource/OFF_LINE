export default {
    name: "table1", //表名
    key: "id", //主键
    indexs: [{
        name: "title", //索引名
        unique: false //是否唯一
    },{
        name: "content",
        unique: false
    }]
}