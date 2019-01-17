import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Tabs, Table, Form, Input, Divider, Select } from 'antd';
const confirm = Modal.confirm;
const Option = Select.Option;

const mapStateToProps = state => ({
    tax: state.tax
})
const mapDispatchToProps = dispatch => ({
    editBasicInfo: (param) => dispatch({
        type: 'CATEGORY_EDIT',
        param
    }),
    addSale: (param) => dispatch({
        type: 'ADD_CATEGORY_SALE',
        param
    }),
    editSale: (param) => dispatch({
        type: 'EDIT_CATEGORY_SALE',
        param
    }),
    deleteSale: (param) => dispatch({
        type: 'DELETE_CATEGORY_SALE',
        param
    }),
    addCategoryTax: (param) => dispatch({
        type: "ADD_CATEGORY_TAX",
        param
    }),
    deleteCategoryTax: (param) => dispatch({
        type: "DELETE_CATEGORY_TAX",
        param
    })
})

const TabPane = Tabs.TabPane;

class editModal extends React.Component {
    // this.props.form.setFieldsValue(this.props.data);

    state = {
        editSaleVisible: false,
        editSaleData: {},
        addSaleVisible: false,
        addSaleData: {

        },
        choose:""
    }
    showEditSale() { }
    hideEditSale() { }
    showAddSale() { }
    hideAddSale() { }
    showDeleteSale(id) {
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                // ajax.delete('/list',{params:{id}}).then((data)=>{
                //     this.props.del({id});
                //     message.success("删除成功")
                // },(error)=>{
                //     message.error("删除失败")
                // })
            }
        });
    }

    deleteTax() {
        confirm({
            title: '删除',
            content: '确定删除此条记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                // ajax.delete('/list',{params:{id}}).then((data)=>{
                //     this.props.del({id});
                //     message.success("删除成功")
                // },(error)=>{
                //     message.error("删除失败")
                // })
            }
        });
    }
    addTax() { }

    handleChange(value) {
        console.log(value)
        this.setState({
            choose:value
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
                                    {getFieldDecorator("id")(<Input type='hidden' />)}
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
                                <p style={{ textAlign: 'center' }}><Button type="primary">确定</Button></p>
                            </div>
                        </TabPane>
                        <TabPane tab="Sale Item" key="2">
                            <Table dataSource={data.saleItems} columns={saleColumns} rowKey="id" pagination={false} />
                            <p style={{ textAlign: 'center', marginTop: '20px' }}><Button type="primary">新增</Button></p>
                        </TabPane>
                        <TabPane tab="Tax" key="3">
                            <Table dataSource={data.tax} columns={taxColumns} rowKey="id" pagination={false} />
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Select style={{ width: 180,marginRight:"20px" }} onChange={this.handleChange.bind(this)} placeholder="请选择tax">
                                        {this.props.tax.map((item,index)=>(<Option value={item.id} key={item.id}>{item.name}</Option>))}
                                </Select>
                                <Button type="primary">新增</Button>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </Modal>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(editModal));