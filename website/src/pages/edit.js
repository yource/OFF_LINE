import React, { Component } from 'react';
import './edit.css';
import { Form, Input, Button, Icon, message } from 'antd';
import Mock from 'mockjs';
import axios from 'axios';

class Add extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'id': Mock.Random.integer(100000, 999999),
            title: "",
            content: [],
            time: Mock.Random.datetime()
        }
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
                if (window.storage.getItem("networkState") === 0) {
                    axios.post('/makeOrder', this.state).then((response) => {
                        this.setState({
                            'id': Mock.Random.integer(100000, 999999),
                            title: "",
                            content: [],
                            time: Mock.Random.datetime()
                        });
                        message.success('提交成功');
                    }).catch(function (error) {
                        message.error('提交失败');
                    });
                } else {
                    // 离线模式下存入indexedDB
                    window.db.addListItem(this.state, () => {
                        this.setState({
                            'id': Mock.Random.integer(100000, 999999),
                            title: "",
                            content: [],
                            time: Mock.Random.datetime()
                        });
                        message.success('离线存储成功');
                    }, () => {
                        message.error('离线存储失败');
                    })
                }
            }
        });
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 9 },
            wrapperCol: { span: 6 }
        };
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="Add">
                <p>新增记录</p>
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <Form.Item label="id" {...formItemLayout}>
                        <Input disabled value={this.state.id} />
                    </Form.Item>
                    <Form.Item label="title" {...formItemLayout}>
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: 'Please input title' }],
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item label="content" {...formItemLayout}>
                        {this.state.content.map((item) => (
                            <span style={{ marginRight: 8, border: '1px solid #ccc', borderRadius: 3, padding: '0 10px' }}>{item}</span>
                        ))}
                        <Icon type="plus-circle" className="addIcon" onClick={this.addContent.bind(this)} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 14, offset: 9 }}>
                        <Button type="primary" htmlType="submit">提交</Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

const AddForm = Form.create()(Add);

export default AddForm;