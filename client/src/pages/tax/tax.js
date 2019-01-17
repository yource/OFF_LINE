import React, { Component } from 'react';
import { connect } from 'react-redux';
import ajax from '../../utils/ajax';
import { Button, message, Divider, Table, Modal, Form, Input } from 'antd';

const mapStateToProps = state => ({
    tax: state.tax.tax
})

const mapDispatchToProps = dispatch => ({
    get: (param) => dispatch({
        type: "TAX_GET",
        param
    }),
    add: (param) => dispatch({
        type: "TAX_ADD",
        param
    }),
    edit: (param) => dispatch({
        type: "TAX_EDIT",
        param
    }),
    del: (param) => dispatch({
        type: "TAX_DELETE",
        param
    })
})

const confirm = Modal.confirm;

class tax extends Component {

    componentDidMount() {
        // ajax.get('./list').then((data) => {
        //     console.log("GET SUCCESS")
        //     this.props.get(data);
        // }, (error) => {
        //     console.log("GET ERROR", error)
        // })
    }

    state = {
        modalVisible: false,
        isAdd: true
    }

    showModal(data) {
        this.setState({
            isAdd: !(data && data.id),
            modalVisible: true
        });
        this.props.form.setFieldsValue(
            data && data.id ? data : {
                name: "",
                description: "",
                rate: ""
            }
        );
    }
    hideModal() {
        this.setState({
            modalVisible: false
        })
    }
    handleOk() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (this.state.isAdd) {
                    console.log('Add')
                } else {
                    console.log('Edit')
                }
            }
        });

    }

    deleteTax(id) {
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                ajax.delete('/list', { params: { id } }).then((data) => {
                    this.props.del({ id });
                    message.success("删除成功")
                }, (error) => {
                    message.error("删除失败")
                })
            }
        });
    }


    columns = [{
        title: 'Index',
        dataIndex: 'id',
        render: (text, record, index) => (<span>{index + 1}</span>)
    }, {
        title: 'name',
        dataIndex: 'name',
    }, {
        title: 'Description',
        dataIndex: 'description',
    }, {
        title: 'Rate',
        dataIndex: 'rate'
    }, {
        title: 'Options',
        width: 160,
        render: (record) => (
            <span>
                <span className="tableBtn" onClick={this.showModal.bind(this, record)}>修改</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.deleteTax.bind(this, record.id)}>删除</span>
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
            <div className="tax" id="tax">
                <div className="topButtons">
                    <Button type="primary" onClick={this.showModal.bind(this)}>新增记录</Button>
                </div>
                <div className="tableCon">
                    <Table columns={this.columns} dataSource={this.props.tax} rowKey="id" />
                </div>
                <Modal
                    title="Edit Tax"
                    visible={this.state.modalVisible}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.hideModal.bind(this)}
                >
                    <Form>
                        <Form.Item label="name" {...formItemLayout}>
                            {getFieldDecorator("name", {
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
                        <Form.Item label="rate" {...formItemLayout}>
                            {getFieldDecorator("rate", {
                                rules: [{ required: true, message: 'Please input!' }]
                            })(<Input />)
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(tax));