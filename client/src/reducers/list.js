let index;
let newState;

const list = (state = [], action) => {
  switch (action.type) {
    case 'LIST_GET':
      action.param.map(function (item) {
        index = state.findIndex(function (value, index) {
          return value.id === item.id
        })
        if (index > -1) {
          state[index] = item;
        } else {
          state.unshift(item)
        }
        return item;
      })
      return state;
    case 'LIST_ADD':
      state.unshift(action.param)
      return state
    case 'LIST_EDIT':
      index = state.findIndex((value) => {
        return value.id === action.param.id
      });
      state[index] = action.param;
      return state
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