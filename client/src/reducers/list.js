let index;
let newState;

const list = (state = [], action) => {
  switch (action.type) {

    // 从服务器获取数据，与本地数据合并
    case 'LIST_GET':
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
    case 'LIST_ADD':
      return [action.param,...state];

    // 编辑列表项
    case 'LIST_EDIT':
      return state.map(((item)=>{
        if(item.id === action.param.id){
          return action.param
        }
        return item;
      }));

    // 删除列表项
    case 'LIST_DELETE':
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

export default list