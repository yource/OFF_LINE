import React from 'react';
import ReactDOM from 'react-dom';
import './utils/storage.js'
import './database/index.js'
import App from './App';

// window.addEventListener("databaseReady",()=>{
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
// })

