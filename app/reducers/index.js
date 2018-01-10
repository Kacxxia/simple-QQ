// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
  import loginer from './loginer'
  import main from './mainReducer'
  import chat from './chat'

const rootReducer = combineReducers({
  counter,
  router,
  loginer,
  main,
  chat
});

export default rootReducer;
