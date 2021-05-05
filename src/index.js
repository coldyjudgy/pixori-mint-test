import "./config"
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import {AuthCluster} from './clusters/auth-cluster';
import {RecoilRoot} from "recoil"
import {CurrentUserSubscription} from "./hooks/current-user"


ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <AuthCluster />
      <CurrentUserSubscription />
      <App />
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);
