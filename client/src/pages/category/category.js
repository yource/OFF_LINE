import React, { Component } from 'react';
import { connect } from 'react-redux';
import ajax from '../../utils/ajax';
import { Button, message, Divider, Table, Modal } from 'antd';
import './category.css';
import DetailModal from './detailModal'
import AddModal from './addModal'

const mapStateToProps = state => ({
    category: state.category.category
})

const mapDispatchToProps = dispatch => ({
    get: (param) => dispatch({
        type: "CATEGORY_GET",
        param
    }),
    add: (param) => dispatch({
        type: "CATEGORY_ADD",
        param
    }),
    edit: (param) => dispatch({
        type: "CATEGORY_EDIT",
        param
    }),
    del: (param) => dispatch({
        type: "CATEGORY_DELETE",
        param
    })
})

const confirm = Modal.confirm;

class category extends Component {

    state = {
        detailVisible: false,
        editVisible: false,
        addVisible: false,
        detailData: {}
    }

    componentDidMount() {
        // ajax.get('./list').then((data) => {
        //     console.log("GET SUCCESS")
        //     this.props.get(data);
        // }, (error) => {
        //     console.log("GET ERROR", error)
        // })
    }

    showDetail(data) {
        this.setState({
            detailVisible: true,
            detailData: data
        })
    }
    hideDetail() {
        this.setState({
            detailVisible: false
        })
    }

    showAdd() {
        this.setState({
            addVisible: true
        })
    }
    hideAdd() {
        this.setState({
            addVisible: false
        })
    }
    handleAdd(data) {
        console.log(data)
        this.setState({
            addVisible: false
        })
    }

    editCategory(data) {
        // 跳转到编辑
    }

    delCategory(id) {
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

    copyCategory() {
        confirm({
            title: '复制',
            content: '确定复制此条记录?',
            okText: '确定',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                //
            }
        });
    }

    columns = [{
        title: 'Index',
        dataIndex: 'id',
        render: (text, record, index) => (<span>{index + 1}</span>)
    }, {
        title: 'CategoryName',
        dataIndex: 'categoryName',
    }, {
        title: 'Description',
        dataIndex: 'description',
    }, {
        title: 'Sale',
        dataIndex: 'saleItems',
        render: saleItems => (
            <span>
                {saleItems.map((item, index) => <span className="saleItem" key={index}>{item.itemName}</span>)}
            </span>
        )
    }, {
        title: 'Tax',
        dataIndex: 'tax',
        render: tax => (
            <span>
                {tax.map((item, index) => {
                    return <span className="saleItem" key={index}>{item.name}</span>
                })}
            </span>
        )
    }, {
        title: 'Options',
        width: 250,
        render: (record) => (
            <span>
                <span className="tableBtn" onClick={this.showDetail.bind(this, record)}>详情</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.editCategory.bind(this, record)}>修改</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.copyCategory.bind(this, record)}>复制</span>
                <Divider type="vertical" />
                <span className="tableBtn" onClick={this.delCategory.bind(this, record.id)}>删除</span>
            </span>
        )
    }];

    render() {
        return (
            <div className="list" id="list">
                <div className="topButtons">
                    <Button type="primary" onClick={this.showAdd.bind(this)}>新增记录</Button>
                </div>
                <div className="tableCon">
                    <Table columns={this.columns} dataSource={this.props.category} rowKey="id" />
                </div>
                <DetailModal data={this.state.detailData} visible={this.state.detailVisible} handleCancel={this.hideDetail.bind(this)}></DetailModal>
                <AddModal visible={this.state.addVisible} handleCancel={this.hideAdd.bind(this)} handleOk={this.handleAdd.bind(this)}></AddModal>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(category);