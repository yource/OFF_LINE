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
    var os = db.database.transaction(['systerm'], 'readwrite').objectStore('systerm');
    var storeRequest = os.get("state");
    storeRequest.onsuccess = function () {
        var idRequest = os.get("id");
        idRequest.onsuccess = function () {
            db.idMap = idRequest.result.map||{};
            var initState = storeRequest.result.state;
            if (!storeRequest.result.init) {
                initState = db.replaceId(initState);
                db.clearIdMap();
                store = createStore(rootReducer, initState);
            } else {
                store = createStore(rootReducer);
            }

            ReactDOM.render(
                <Provider store={store}>
                    <App />
                </Provider>,
                document.getElementById('root')
            );
            store.subscribe(() => {
                console.log("STORE CHANGE ", store.getState())
            })
        }

        // 页面关闭前，保存数据
        window.onbeforeunload = function () {
            db.saveState(store.getState())
            db.saveIdMap()
        }
    }
})