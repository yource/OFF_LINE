import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers'
import './utils/storage'
import db from './utils/database'
import App from './App';

window.addEventListener("databaseReady", () => {
    var store;
    var storeRequest = db.database.transaction(['state'], 'readwrite').objectStore('state').get("state");
    storeRequest.onsuccess = function () {
        if (!storeRequest.result.stateInit) {
            store = createStore(rootReducer, storeRequest.result);
        } else {
            store = createStore(rootReducer);
        }
        // 页面关闭前，保存state
        window.onbeforeunload = function(){
            db.saveState(store.getState())
        }
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            document.getElementById('root')
        );
    }
})