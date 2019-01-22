import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Tabs, Table, Form, Input, Divider, Select, message } from 'antd';
import ajax from '../../utils/ajax'
import AddSaleModel from './addSaleModal'
import EditSaleModel from './editSaleModal'
const confirm = Modal.confirm;
const Option = Select.Option;

const mapStateToProps = state => ({
    tax: state.tax
})
const mapDispatchToProps = dispatch => ({
    editCategory: (param) => dispatch({
        type: 'CATEGORY_EDIT',
        param
    })
})

const TabPane = Tabs.TabPane;

class editModal extends React.Component {

    state = {
        editSaleVisible: false,
        editSaleData: {},
        addSaleVisible: false,
        choose: ""
    }

    editCategory() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                ajax.put("/cloudmenu/category/", values).then((data) => {
                    this.props.editCategory(Object.assign(this.props.data, values));
                    message.success("修改成功");
                }, () => {
                    message.error("修改失败")
                })
            }
        });
    }

    showEditSale(data) {
        this.setState({
            editSaleVisible: true,
            editSaleData: data
        })
    }
    hideEditSale() {
        this.setState({
            editSaleVisible: false
        })
    }
    handleEditSale(data) {
        data.categoryId = this.props.data.id;
        data.mapId = "categoryId";
        ajax.put('/cloudmenu/sale-item/', data).then(() => {
            let index = this.props.data.saleItems.findIndex((item) => {
                return item.id === data.id
            })
            this.props.data.saleItems[index] = data;
            this.props.editCategory(this.props.data)
            message.success("修改成功")
            this.setState({
                addSaleVisible: false
            })
        }, (error) => {
            message.error("修改失败")
        })
        this.setState({
            editSaleVisible: false
        })
    }

    showAddSale() {
        this.setState({
            addSaleVisible: true
        })
    }
    hideAddSale() {
        this.setState({
            addSaleVisible: false
        })
    }
    handleAddSale(data) {
        data.categoryId = this.props.data.id;
        data.mapId = "categoryId";
        data.need_id = true;
        ajax.post('/cloudmenu/sale-item/', data).then((response) => {
            data.id = response.id;
            if (!this.props.data.saleItems) {
                this.props.data.saleItems = [];
            }
            this.props.data.saleItems.push(data);
            this.props.editCategory(this.props.data)
            message.success("添加成功")
            this.setState({
                addSaleVisible: false
            })
        }, (error) => {
            message.error("添加失败")
        })
    }

    showDeleteSale(id) {
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                ajax.delete('/cloudmenu/sale-item/' + id).then((data) => {
                    let index = this.props.data.saleItems.findIndex((item) => {
                        return item.id === id;
                    })
                    this.props.data.saleItems.splice(index, 1);
                    this.props.editCategory(this.props.data);
                    message.success("删除成功")
                }, (error) => {
                    message.error("删除失败")
                })
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
                let newData = Object.assign({}, this.props.data);
                newData.tax = {};
                ajax.put('/cloudmenu/category/').then((data) => {
                    this.props.data.tax = {};
                    this.props.editCategory(newData);
                    message.success("删除成功")
                }, (error) => {
                    message.error("删除失败")
                })
            }
        });
    }
    addTax() {
        let newData = Object.assign({}, this.props.data);
        newData.tax = this.props.tax.find(item => item.id === this.state.choose);
        ajax.put('/cloudmenu/category/', newData).then(() => {
            this.props.data.tax = newData.tax;
            this.props.editCategory(newData);
            message.success("添加成功")
        }, (error) => {
            message.error("添加失败")
        })
    }

    handleChange(value) {
        this.setState({
            choose: value
        })
    }

    render() {
        const { data } = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            }
        };

        const saleColumns = [{
            title: 'name',
            dataIndex: 'itemName'
        }, {
            title: 'price',
            dataIndex: 'price'
        }, {
            title: 'thumb path',
            dataIndex: 'thumbPath'
        }, {
            title: "printer names",
            dataIndex: "printerNames"
        }, {
            title: 'Options',
            width: 120,
            render: (record) => (
                <span>
                    <span className="tableBtn" onClick={this.showEditSale.bind(this, record)}>修改</span>
                    <Divider type="vertical" />
                    <span className="tableBtn" onClick={this.showDeleteSale.bind(this, record.id)}>删除</span>
                </span>
            )
        }];

        const taxColumns = [{
            title: 'name',
            dataIndex: 'name'
        }, {
            title: 'description',
            dataIndex: 'description'
        }, {
            title: 'rate',
            dataIndex: 'rate'
        }, {
            title: 'Options',
            width: 120,
            render: (record) => (
                <span>
                    <span className="tableBtn" onClick={this.deleteTax.bind(this, record.id)}>删除</span>
                </span>
            )
        }];

        return (
            <Modal
                width="900px"
                title="Edit Category"
                visible={this.props.visible}
                onCancel={() => { this.props.handleCancel() }}
                footer={null}
            >
                <div style={{ minHeight: "300px" }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Info" key="1">
                            <div style={{ lineHeight: '50px' }}>
                                <Form>
                                    {getFieldDecorator("id", {
                                        initialValue: data.id,
                                    })(<Input type='hidden' />)}
                                    <Form.Item label="name" {...formItemLayout}>
                                        {getFieldDecorator("categoryName", {
                                            initialValue: data.categoryName,
                                            rules: [{ required: true, message: 'Please input!' }]
                                        })(<Input />)
                                        }
                                    </Form.Item>
                                    <Form.Item label="description" {...formItemLayout}>
                                        {getFieldDecorator("description", {
                                            initialValue: data.description,
                                            rules: [{ required: true, message: 'Please input!' }]
                                        })(<Input />)
                                        }
                                    </Form.Item>
                                </Form>
                                <p style={{ textAlign: 'center' }}><Button type="primary" onClick={this.editCategory.bind(this)}>修改</Button></p>
                            </div>
                        </TabPane>
                        <TabPane tab="Sale Item" key="2">
                            <Table dataSource={data.saleItems} columns={saleColumns} rowKey="id" pagination={false} />
                            <p style={{ textAlign: 'center', marginTop: '20px' }}><Button type="primary" onClick={this.showAddSale.bind(this)}>新增</Button></p>
                        </TabPane>
                        <TabPane tab="Tax" key="3">
                            <Table dataSource={data.tax && data.tax.id ? [data.tax] : []} columns={taxColumns} rowKey="id" pagination={false} />
                            {(data.tax && data.tax.id) ? (
                                <div></div>
                            ) : (

                                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                        <Select style={{ width: 180, marginRight: "20px" }} onChange={this.handleChange.bind(this)} placeholder="请选择tax">
                                            {this.props.tax.map((item, index) => (<Option value={item.id} key={item.id}>{item.name}</Option>))}
                                        </Select>
                                        <Button type="primary" onClick={this.addTax.bind(this)}>新增</Button>
                                    </div>
                                )
                            }
                        </TabPane>
                    </Tabs>
                    <AddSaleModel visible={this.state.addSaleVisible} handleCancel={this.hideAddSale.bind(this)} handleOk={this.handleAddSale.bind(this)}></AddSaleModel>
                    <EditSaleModel data={this.state.editSaleData} visible={this.state.editSaleVisible} handleCancel={this.hideEditSale.bind(this)} handleOk={this.handleEditSale.bind(this)}></EditSaleModel>
                </div>
            </Modal >
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(editModal));