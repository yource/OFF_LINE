import React, { Component } from 'react';
// import api from '../database/api'
import './list.css';
import { Form, Input, Button, Icon, message, Divider, Table, Modal } from 'antd';
import db from '../database';

const confirm = Modal.confirm;

class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            menu: [],
            addVisible: false,
            addData:{},
            editVisible: false,
            editData: {}
        }
    }

    componentDidMount() {
        this.getList()
        this.getMenu()
    }

    getList() {
        let listData = [];
        //遍历数据库
        const listRequest = db.objectStore("list").openCursor();
        listRequest.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                listData.push(cursor.value);
                cursor.continue();
            } else {
                this.setState({
                    list: listData
                })
            }
        }
    }

    getMenu() {
        //获取单个数据
        const menuRequest = db.objectStore("menu").get("menu");
        menuRequest.onsuccess = (e) => {
            if (menuRequest.result) {
                this.setState({
                    menu: menuRequest.result
                })
            } else {
                console.log('未获得数据记录');
            }
        }
    }

    addItem() {
        this.setState({
            addData: {
                id: db.uuid(),
                itemName: "",
                price: "",
                description: "",
                thumbPath: "",
                lastUpdatedBy: "",
                printerNames: ""
            },
            addVisible: true
        });
    }

    editItem(data) {
        this.setState({
            editData: data,
            editVisible: true
        });
    }

    delItem(id) {
        var that = this;
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                //删除数据
                const delRequest = db.objectStore("list").delete(id);
                delRequest.onsuccess = (e) => {
                    console.log("删除成功");
                    that.getList()
                }
            }
        });
    }

    handleAddOk(e) {
        this.setState({
            visible: false
        });
    }
    handleEditOk(e) {
        this.setState({
            visible: false
        });
    }
    handleCancel(e) {
        this.setState({
            editData:{},
            addData:{},
            addVisible:false,
            editVisible: false
        });
        console.log(this.state.editData)
    }

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
                <span className="tableBtn" onClick={this.editItem.bind(this, record)}>修改</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.delItem.bind(this, record.id)}>删除</span>
            </span>
        )
    }];

    render() {
        // const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        return (
            <div className="list" id="list">
                <div className="topButtons">
                    <Button type="primary" onClick={this.addItem.bind(this)}>新增记录</Button>
                </div>
                <div className="tableCon">
                    <Table columns={this.columns} dataSource={this.state.list} rowKey="id" />
                </div>
                <Modal
                    title="编辑"
                    visible={this.state.editVisible}
                    onOk={this.handleEditOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <Form.Item label="ID" {...formItemLayout}>
                            <Input disabled value={this.state.editData.id} />
                        </Form.Item>
                        <Form.Item label="itemName" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.itemName} />
                        </Form.Item>
                        <Form.Item label="price" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.price} />
                        </Form.Item>
                        <Form.Item label="thumbPath" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.thumbPath} />
                        </Form.Item>
                        <Form.Item label="description" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.description} />
                        </Form.Item>
                        <Form.Item label="printerNames" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.printerNames} />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="新增"
                    visible={this.state.addVisible}
                    onOk={this.handleAddOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <Form.Item label="ID" {...formItemLayout}>
                            <Input disabled value={this.state.addData.id} />
                        </Form.Item>
                        <Form.Item label="itemName" {...formItemLayout}>
                            <Input defaultValue={this.state.addData.itemName} />
                        </Form.Item>
                        <Form.Item label="price" {...formItemLayout}>
                            <Input defaultValue={this.state.addData.price} />
                        </Form.Item>
                        <Form.Item label="thumbPath" {...formItemLayout}>
                            <Input defaultValue={this.state.addData.thumbPath} />
                        </Form.Item>
                        <Form.Item label="description" {...formItemLayout}>
                            <Input defaultValue={this.state.addData.description} />
                        </Form.Item>
                        <Form.Item label="printerNames" {...formItemLayout}>
                            <Input defaultValue={this.state.addData.printerNames} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

// const ListPage = Form.create()(List);
// export default ListPage;
export default List;