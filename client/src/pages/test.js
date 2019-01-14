import React, { Component } from 'react';
import { connect } from 'react-redux';
import ajax from '../utils/ajax';
import { Form, Input, Button, message, Divider, Table, Modal } from 'antd';
import './test.css';
import uid from '../utils/uid.js'
import * as testAction from '../actions/test';

const confirm = Modal.confirm;

const mapStateToProps = state => ({
    list: state.list
})

const mapDispatchToProps = dispatch => ({
    get: (param) => dispatch(testAction.testGet(param)),
    add: (param) => dispatch(testAction.testAdd(param)),
    edit: (param) => dispatch(testAction.testEdit(param)),
    del: (param) => dispatch(testAction.testDelete(param))
})

class List extends Component {

    constructor(props){
        super(props);
        this.state = {
            visible:false,
            addEdit:'add'
        }
    }

    componentDidMount() {
        ajax.get('./list').then((data) => {
            this.props.get(data);
        }, (error) => {
            console.log("ERROR",error)
        })
    }

    // 添加数据
    submitAdd(data) {
        message.success('添加成功');
    }


    addItem() {
        this.setState({
            visible: true,
            addEdit: "add"
        });
        this.props.form.setFieldsValue({
            id: uid(),
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
            onOk:()=> {
                this.props.del({
                    id
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
                    this.props.add(values)
                } else {
                    this.props.edit(values)
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
    }, {
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
        const { list } = this.props;
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
                    <Table columns={this.columns} dataSource={list} rowKey="id" />
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
                    </Form>
                </Modal>
            </div>
        );
    }
}

const ListPage = Form.create()(List);

export default connect(mapStateToProps, mapDispatchToProps)(ListPage);