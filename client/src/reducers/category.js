let index;
let newState;

const category = (state = {
    category: [{
        categoryName: 'T1',
        description: 'local test data',
        id: "1",
        lastUpdatedBy: 'admin',
        saleItems: [{
            categoryId: "1",
            description: 'local test saleItem',
            id: "11",
            itemName: "sale1",
            lastUpdatedBy: "admin",
            price: 99,
            printerNames: ["a", "bb"],
            thumbPath: "path1path1path1"
        }, {
            categoryId: "2",
            description: 'local test saleItem',
            id: "22",
            itemName: "sale2",
            lastUpdatedBy: "admin",
            price: 88,
            printerNames: ["a", "bb"],
            thumbPath: "path1path1path1"
        }]
    }],
    tax: [{
        description: "some tax tax",
        id: "1",
        categoryId: ["1"],
        name: "tax1",
        rate: 0
    }]
}, action) => {
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

        // 添加列表项
        case 'CATEGORY_ADD':
            return [action.param, ...state];

        // 编辑列表项
        case 'CATEGORY_EDIT':
            return state.map(((item) => {
                if (item.id === action.param.id) {
                    return action.param
                }
                return item;
            }));

        // 删除列表项
        case 'CATEGORY_DELETE':
            index = state.findIndex((value) => {
                return value.id === action.param.id
            });
            newState = [...state];
            newState.splice(index, 1);
            return newState;

        default:
            return state
    }
}

export default category