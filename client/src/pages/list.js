import React, { Component } from 'react';
// import api from '../database/api'
import './list.css';
import { Form, Input, Button, message, Divider, Table, Modal } from 'antd';
import db from '../database';

const confirm = Modal.confirm;

class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            menu: [],
            visible: false,
            addEdit: "add",
            editData: {

            }
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
                message.warning('未找到记录');
            }
        }
    }

    // 添加数据
    submitAdd(data) {
        db.add("list", data).then(() => {
            message.success('添加成功');
            this.getList();
        }, () => {
            message.error('添加失败');
        })
    }

    // 编辑数据
    submitEdit(data) {
        db.edit("list", data).then(() => {
            message.success('修改成功');
            this.getList();
        }, () => {
            message.error('修改失败');
        })

    }

    addItem() {
        this.setState({
            visible: true,
            addEdit: "add"
        });
        this.props.form.setFieldsValue({
            id: db.uuid(),
            itemName: "",
            price: "",
            description: "",
            thumbPath: "",
            lastUpdatedBy: "",
            printerNames: ""
        })
    }

    editItem(data) {
        this.setState({
            visible: true,
            addEdit: "edit"
        });
        this.props.form.setFieldsValue(data)
    }

    delItem(id) {
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                //删除数据
                db.delete("list", id).then(() => {
                    message.success("删除成功");
                }, () => {
                    message.error("删除失败");
                })
            }
        });
    }
    handleOk(e) {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    visible: false
                });
                if (this.state.addEdit === "add") {
                    this.submitAdd(values)
                } else {
                    this.submitEdit(values)
                }
            }
        });
    }
    handleCancel(e) {
        this.setState({
            visible: false
        });
    }

    columns = [{
        title: 'id',
        dataIndex: 'id',
        width: 150,
        render: id => (
            <span>#{id}</span>
        )
    }, {
        title: 'Title',
        dataIndex: 'itemName',
    }, {
        title: 'Price',
        dataIndex: 'price',
    }, {
        title: 'ThumbPath',
        dataIndex: 'thumbPath',
    }, {
        title: 'Description',
        dataIndex: 'description',
    },
    // {
    //     title: 'printerNames',
    //     dataIndex: 'printerNames',
    //     render: printerNames => (
    //         <span>{printerNames.join(", ")}</span>
    //     )
    // },
    {
        title: 'Options',
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
        const { getFieldDecorator } = this.props.form;
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
                    visible={this.state.visible}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <Form.Item label="ID" {...formItemLayout}>
                            {getFieldDecorator("id")(<Input disabled />)
                            }
                        </Form.Item>

                        <Form.Item label="Title" {...formItemLayout}>
                            {getFieldDecorator("itemName", {
                                rules: [{ required: true, message: 'Please input title!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="Price" {...formItemLayout}>
                            {getFieldDecorator("price", {
                                rules: [{ required: true, message: 'Please input price!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="ThumbPath" {...formItemLayout}>
                            {getFieldDecorator("thumbPath", {
                                rules: [{ required: true, message: 'Please input thumbPath!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="Description" {...formItemLayout}>
                            {getFieldDecorator("description", {
                                rules: [{ required: true, message: 'Please input description!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        {/* <Form.Item label="printerNames" {...formItemLayout}>
                            <Input defaultValue={this.state.editData.printerNames} />
                        </Form.Item> */}
                    </Form>
                </Modal>
            </div>
        );
    }
}

const ListPage = Form.create()(List);
export default ListPage;
// export default List;