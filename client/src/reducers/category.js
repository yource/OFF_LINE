let index;
let newState;

const category = (state = [{
    categoryName: 'T1',
    description: 'local test data',
    id: "1",
    lastUpdatedBy: 'admin',
    saleItems: [{
        description: 'local test saleItem',
        id: "11",
        itemName: "sale1",
        lastUpdatedBy: "admin",
        price: 99,
        printerNames: "aaaaaa",
        thumbPath: "path1path1path1"
    }, {
        description: 'local test saleItem',
        id: "12",
        itemName: "sale2",
        lastUpdatedBy: "admin",
        price: 88,
        printerNames: ["a", "bb"],
        thumbPath: "path1path1path1"
    }],
    tax: {
        description: "some tax tax",
        id: "1",
        name: "tax1",
        rate: 0
    }
}], action) => {
    switch (action.type) {

        // 从服务器获取数据，与本地数据合并
        case 'CATEGORY_GET':
            newState = [...state];
            action.param.map(function (item) {
                index = newState.findIndex(function (value) {
                    return value.id === item.id
                })
                if (index > -1) {
                    newState[index] = item;
                } else {
                    newState.unshift(item)
                }
                return item;
            })
            return newState;

        // 添加category
        case 'CATEGORY_ADD':
            return [action.param, ...state];

        // 编辑category
        case 'CATEGORY_EDIT':
            return state.map(((item) => {
                if (item.id === action.param.id) {
                    return action.param
                }
                return item;
            }));

        // 删除category
        case 'CATEGORY_DELETE':
            index = state.findIndex((value) => {
                return value.id === action.param.id
            });
            newState = [...state];
            newState.splice(index, 1);
            return newState;

        // 当一个tax被删除时，同时删除此tax在category中的记录
        case 'CATEGORY_DELETE_TAX':
            return state.map(item=>{
                if(item.tax.id===action.param.id){
                    return Object.assign({},item,{tax:{}})
                }
                return item;
            })

        default:
            return state
    }
}

export default category