import "./config"
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import {AuthCluster} from './clusters/auth-cluster';
import {RecoilRoot} from "recoil"
import {CurrentUserSubscription} from "./hooks/current-user"

import {MintCluster} from './clusters/mint-cluster'
import {TransferCluster} from './clusters/transfer-cluster'
import {useCurrentUser} from './hooks/current-user'

import {TokenCluster} from './clusters/token-cluster'

function Transfer() {
  const cu = useCurrentUser()
  return (
    <TransferCluster address={cu.addr} />
  )
}

function Token() {
  const cu = useCurrentUser()
  return (
    <TokenCluster address={cu.addr} />
  )
}



ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <AuthCluster />
    
      <CurrentUserSubscription />
      <App />
      <Transfer />
      <Token />
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);
