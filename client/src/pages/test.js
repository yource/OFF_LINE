import React, { Component } from 'react';
import './test.css';
import { Input, Button } from 'antd';
import Mock from 'mockjs';
import axios from 'axios';

class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            total: 0,
            list: []
        }
    }

    date = Date.now()

    componentDidMount() { }

    changeTotal = (e) => {
        this.setState({ total: e.target.value ? parseInt(e.target.value) : "" });
    }

    makeData() {
        console.log("正在生成假数据...")
        if (this.state.total > 1) {
            let temp = {}
            temp['list|' + this.state.total] = [{
                'id|+1': 0,
                itemName: '@name',
                price:'',
                description:'',
                thumbPath:'',
                lastUpdatedBy:'',
                lastUpdated: '@datetime',
                'printerNames|3-10': ["@string('lower', 3, 10)"]
            }]
            let list = Mock.mock({ temp });
            this.setState({
                list: list.temp.list
            });
        } else if (this.state.total === 1) {
            this.setState({
                list: [{
                    id: 0,
                    title: test,
                    time: Date.now(),
                    content: ["aaa", "bbb"]
                }]
            });
        } else {
            this.setState({
                list: []
            });
        }
        console.log("已生成" + this.state.total + "条假数据")
    }

    storageItem(i) {
        if (i > -1) {
            console.log(this.state.list[i].id)
            let request = window.db.database.transaction(['test'], 'readwrite').objectStore('test').add(this.state.list[i]);
            request.onsuccess = this.storageItem(i - 1)
        } else {
            console.log("数据存储完成，用时" + (Date.now() - this.date) + "ms")
        }
    }

    storage() {
        this.date = Date.now();
        this.storageItem(this.state.total - 1);
    }

    getData() {
        this.date = Date.now();
        var objectStore = window.db.database.transaction('test').objectStore('test');
        var result = [];
        objectStore.openCursor().onsuccess = (event) => {
            var cursor = event.target.result;
            if (cursor && cursor.value) {
                console.log(cursor.value.id);
                result.push(cursor.value);
                cursor.continue();
            } else {
                console.log("已读取数据" + result.length + "条，用时：" + (Date.now() - this.date) + "ms")
            }
        };
    }

    clearTable() {
        this.date = Date.now();
        var request = window.db.database.transaction(['test'], 'readwrite').objectStore('test').clear();
        request.onsuccess = () => {
            console.log("test表已清空，用时：" + (Date.now() - this.date) + "ms")
        }
    }

    deleteDB() {
        window.indexedDB.deleteDatabase('MENUSIFU');
    }

    render() {
        const { total } = this.state;
        return (
            <div className="Test">
                <h3>存储测试</h3>
                <p>数据量（条）：
                    <Input value={total} onChange={this.changeTotal} style={{ width: '10%', marginRight: 40 }} />
                    <Button style={{ marginRight: 15 }} onClick={this.makeData.bind(this)}>生成</Button>
                    <Button onClick={this.storage.bind(this)}>存储</Button>
                </p>
                <h3>读取测试</h3>
                <p>
                    <Button style={{ marginRight: 15 }} onClick={this.getData.bind(this)}>读取</Button>
                    <Button>读取并传递</Button>
                </p>
                <h3>删除数据</h3>
                <p>
                    <Button style={{ marginRight: 15 }} onClick={this.clearTable.bind(this)}>清空test表</Button>
                    <Button onClick={this.deleteDB.bind(this)}>删除数据库</Button>
                </p>
            </div>
        );
    }
}

export default Test;