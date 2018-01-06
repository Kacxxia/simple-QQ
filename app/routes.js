/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import LoginPage from './containers/LoginPage'
import MainPage from './containers/mainPage'
export default () => (
  <App>
    <Switch>
      <Route path="/main" component={MainPage} />    
      <Route path="/" component={LoginPage} />
    </Switch>
  </App>
);
