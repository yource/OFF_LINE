import React from 'react';
import ReactDOM from 'react-dom';
import './utils/storage.js'
import App from './App';

window.storage.setItem("networkState",window.navigator.onLine ? 0:1);

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
