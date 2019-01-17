import React from 'react';
import { Modal, Button, Row, Col, Tabs, Table } from 'antd';

const TabPane = Tabs.TabPane;

class detaiModal extends React.Component {

    render() {
        const { data } = this.props;

        const saleColumns = [{
            title: 'item name',
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
        }];

        return (
            <Modal
                width="800px"
                title="Category Detail"
                visible={this.props.visible}
                onCancel={() => { this.props.handleCancel() }}
                footer={[<Button key="submit" type="primary" onClick={() => { this.props.handleCancel() }}>确定</Button>,]}
            >
                <div style={{ minHeight: "300px", maxHeight: "500px" }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Info" key="1">
                            <div style={{ lineHeight: '30px' }}>
                                <Row>
                                    <Col span={8}>Category Name:</Col>
                                    <Col span={16}>{data.categoryName}</Col>
                                </Row>
                                <Row>
                                    <Col span={8}>Description:</Col>
                                    <Col span={16}>{data.description}</Col>
                                </Row>
                                <Row>
                                    <Col span={8}>Last Updated By:</Col>
                                    <Col span={16}>{data.lastUpdatedBy}</Col>
                                </Row>
                            </div>
                        </TabPane>
                        <TabPane tab="Sale Item" key="2">
                            <Table dataSource={data.saleItems} columns={saleColumns} rowKey="id" pagination={false} />
                        </TabPane>
                        <TabPane tab="Tax" key="3">
                            <Table dataSource={data.tax} columns={taxColumns} rowKey="id" pagination={false} />
                        </TabPane>
                    </Tabs>
                </div>
            </Modal>
        );
    }
}

export default detaiModal;