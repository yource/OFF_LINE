import React from 'react';
import { Modal, Button, Row, Col, Tabs } from 'antd';

const TabPane = Tabs.TabPane;

class detaiModal extends React.Component {

    render() {
        const data = this.props.data;
        return (
            <Modal
                title="Category Detail"
                visible={this.props.visible}
                onCancel={() => { this.props.handleCancel() }}
                footer={[<Button key="submit" type="primary" onClick={() => { this.props.handleCancel() }}>确定</Button>,]}
            >
                <div style={{ height: "300px" }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Info" key="1">
                            <div style={{lineHeight:'30px'}}>
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
                        <TabPane tab="Sale Item" key="2">Content of Tab Pane 2</TabPane>
                        <TabPane tab="Tax" key="3">Content of Tab Pane 3</TabPane>
                    </Tabs>
                </div>
            </Modal>
        );
    }
}

export default detaiModal;