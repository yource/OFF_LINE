import React, { Component } from 'react';
import './edit.css';
import { Form, Input, Button, Icon, message, Divider, Table } from 'antd';
import Mock from 'mockjs';
import axios from 'axios';

class Add extends Component {

    constructor(props) {
        super(props);
        this.state = Mock.mock({
            'list|20': [{
                'id|+1': 0,
                itemName: '@word(5,12)',
                price: 'integer(10,300)',
                description: '@sentence(4,10)',
                thumbPath: '@word(8,16)',
                lastUpdatedBy: '@name',
                lastUpdated: '@datetime',
                'printerNames|3-10': ["@string('lower', 3, 10)"]
            }]
        });
    }

    componentDidMount() { }

    addContent = () => {
        this.setState({
            content: this.state.content.concat([Mock.Random.string('lower', 3, 10)])
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // this.setState({
                //     title: values.title
                // });
                this.state.title = values.title;
            }
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
                <a href="javascript:;" >修改</a>
                <Divider type="vertical" />
                <a href="javascript:;" >删除</a>
            </span>
        )
    }];

    render() {
        const formItemLayout = {
            labelCol: { span: 9 },
            wrapperCol: { span: 6 }
        };
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="Edit">
                <p>新增记录</p>
                <div className="editForm">
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Form.Item label="id" {...formItemLayout}>
                            <Input disabled  />
                        </Form.Item>
                        <Form.Item label="title" {...formItemLayout}>
                            {getFieldDecorator('title', {
                                rules: [{ required: true, message: 'Please input title' }],
                            })(
                                <Input />
                            )}
                        </Form.Item>
                        <Form.Item label="content" {...formItemLayout}>
                            
                            <Icon type="plus-circle" className="addIcon"  />
                        </Form.Item>
                        <Form.Item wrapperCol={{ span: 14, offset: 9 }}>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="tableCon">
                    <Table columns={this.columns} dataSource={this.state.list} rowKey="id" />
                </div>
            </div>
        );
    }
}

const AddForm = Form.create()(Add);

export default AddForm;