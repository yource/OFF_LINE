import React from 'react';
import { Modal, Input, Form } from 'antd';

class addSaleModal extends React.Component {

    submit() {
        this.props.form.validateFields((err, values) => {
            values.price = parseFloat(values.price) || 0;
            if (!err) {
                this.props.handleOk(values)
            }
        });
    }

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
            <Modal
                title="Add Sale"
                visible={this.props.visible}
                onOk={this.submit.bind(this)}
                onCancel={() => { this.props.handleCancel() }}
            >
                <div>
                    <Form>
                        <Form.Item label="name" {...formItemLayout}>
                            {getFieldDecorator("itemName", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="price" {...formItemLayout}>
                            {getFieldDecorator("price", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="printer name" {...formItemLayout}>
                            {getFieldDecorator("printerNames", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="thumb path" {...formItemLayout}>
                            {getFieldDecorator("thumbPath", {
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

export default Form.create()(addSaleModal);