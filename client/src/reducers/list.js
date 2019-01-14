let index;
let newState;

const list = (state = [], action) => {
  switch (action.type) {
    case 'LIST_GET':
      newState = JSON.parse(JSON.stringify(state));
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
    case 'LIST_ADD':
      newState = JSON.parse(JSON.stringify(state));
      newState.unshift(action.param)
      return newState;
    case 'LIST_EDIT':
      index = state.findIndex((value) => {
        return value.id === action.param.id
      });
      newState = JSON.parse(JSON.stringify(state));
      newState[index] = action.param;
      return newState;
    case 'LIST_DELETE':
      index = state.findIndex((value) => {
        return value.id === action.param.id
      });
      newState = JSON.parse(JSON.stringify(state));
      newState.splice(index, 1);
      return newState;
    default:
      return state
  }
}

export default list