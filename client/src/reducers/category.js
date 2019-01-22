let index;
let newState;

const category = (state = [], action) => {
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
            return state.length > 0 ? state.map(item=>{
                if (item.tax && item.tax.id && item.tax.id===action.param.id){
                    return Object.assign({},item,{tax:{}})
                }
                return item;
            }):state;

        default:
            return state
    }
}

export default category