import {combineReducers} from 'redux';
import app from './app';
import home from './home';
import layout from './layout';

export default combineReducers({
  home,
  app,
  layout
});