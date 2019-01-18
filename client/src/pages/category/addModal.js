import React from 'react';
import { Modal,  Input, Form } from 'antd';

class detaiModal extends React.Component {

    submit(){
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.form.resetFields();
                this.props.handleOk(values);
            }
        });
    }

    render() {
        const { getFieldDecorator, resetFields } = this.props.form;
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
            <Modal
                title="Add Category"
                visible={this.props.visible}
                onOk={this.submit.bind(this)}
                onCancel={() => { resetFields();this.props.handleCancel() }}
            >
                <div>
                    <Form>
                        <Form.Item label="name" {...formItemLayout}>
                            {getFieldDecorator("categoryName", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="description" {...formItemLayout}>
                            {getFieldDecorator("description", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        );
    }
}

export default Form.create()(detaiModal);