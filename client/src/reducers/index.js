import { combineReducers } from 'redux'
import list from './list'
import category from './category'
import tax from './tax'

export default combineReducers({
  list,
  category,
  tax
})
