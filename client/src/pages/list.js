import React, { Component } from 'react';
// import db from '../database'
import './list.css';
import { Form, Input, Button, Icon, message, Divider, Table } from 'antd';
import Mock from 'mockjs';

// console.log(db.database)
// setTimeout(function () { console.log(db.database)},2000)

class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            editData:{
                id:"",
                itemName:"",
                price:"",
                description:"",
                thumbPath:"",
                lastUpdatedBy:"",
                printerNames:""
            }
        }
    }

    componentDidMount() {
        let listData = Mock.mock({
            'list|20': [{
                'id|+1': 0,
                itemName: '@word(5,12)',
                price: '@integer(10,300)',
                description: '@sentence(4,10)',
                thumbPath: '@word(8,16)',
                lastUpdatedBy: '@name',
                lastUpdated: '@datetime',
                'printerNames|3-10': ["@string('lower', 3, 10)"]
            }]
        });
        this.setState({
            list:listData.list
        })
    }

    addItem(){}

    editItem() {}

    delItem() { }

    columns = [{
        title: 'id',
        dataIndex: 'id',
        width: 150,
        render: id => (
            <span>#{id}</span>
        )
    }, {
        title: 'itemName',
        dataIndex: 'itemName',
    }, {
        title: 'price',
        dataIndex: 'price',
    }, {
        title: 'thumbPath',
        dataIndex: 'thumbPath',
    }, {
        title: 'description',
        dataIndex: 'description',
    }, {
        title: 'printerNames',
        dataIndex: 'printerNames',
        render: printerNames => (
            <span>{printerNames.join(", ")}</span>
        )
    }, {
        title: 'options',
        width: 140,
        render: (record) => (
            <span>
                <span className="tableBtn" onClick={this.editItem.bind(this)}>修改</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.delItem.bind(this)}>删除</span>
            </span>
        )
    }];

    render() {
        // const { getFieldDecorator } = this.props.form;
        return (
            <div className="list" id="list">
                <div className="topButtons">
                    <Button type="primary" onClick={this.addItem.bind(this)}>新增记录</Button>
                </div>
                <div className="tableCon">
                    <Table columns={this.columns} dataSource={this.state.list} rowKey="id" />
                </div>
            </div>
        );
    }
}

// const ListPage = Form.create()(List);
// export default ListPage;
export default List;