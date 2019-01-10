import React, { Component } from 'react';
import './home.css';
import { Table, Divider } from 'antd';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() { }

  render() {
    const tableData1 = [{
      name:"actionFlag",
      explain:"数据动作标记",
      values:"unchanged: 从服务器获取； new: 本地新增； edit: 从服务器获取并在本地编辑的； delete: 从服务器获取并被删除的"
    }]
    const tableColumns1 = [{
      title: '属性',
      dataIndex: 'name',
      key: 'name'
    }, {
        title: '说明',
        dataIndex: 'explain',
        key: 'explain'
      }, {
        title: '值',
        dataIndex: 'values',
        key: 'values'
      }]
    return (
      <div className="Home">
        <h1>OFF LINE 离线方案</h1>
        <h2>一、交互原则</h2>
        <p>离线状态下操作</p>
        <p>indexedDB中的数据需要添加索引：actionFlag，决定数据该如何存取和同步。</p>
        <Table dataSource={tableData1} columns={tableColumns1} rowKey={"name"} pagination={false} />
        {/* <p style={{textAlign:"center"}}><img src={require("../static/explain.png")} alt="交互示例图" /></p> */}
        <h2>二、流程示例</h2>
        <dl>
          <dt>1. 初始化</dt>
          <dd>首次加载页面时，创建数据库创建和表，并向服务器请求数据存入indexedDB。</dd>
          <dd>后续加载页面时，更新数据表。</dd>
          <dt>2. 前端新增数据</dt>
          <dd>在线状态下：先向服务器同步此改动，成功则将actionFlag改为unchanged，失败则将actionFlag改为new，再将此改动存入indexedDB。</dd>
          <dd>离线状态下：设置actionFlag为new。</dd>
          <dt>3. 前端修改数据</dt>
          <dd>在线状态下：先向服务器同步此改动，成功则将actionFlag改为unchanged，失败则将actionFlag改为edit，再将此改动存入indexedDB。</dd>
          <dd>离线状态下：如果原actionFlag为unchanged，则改为edit；如果原actionFlag为new或edit，则actionFlag不变。</dd>
          <dt>4. 前端删除数据</dt>
          <dd>在线状态下，先向服务器同步此改动，成功则在indexedDB中删除此条记录，失败则将actionFlag改为delete。</dd>
          <dd>离线状态下，将actionFlag改为delete。</dd>
          <dd>注意：如果服务器找不到跟请求数据对应的记录（uid），依然要返回成功。</dd>
        </dl>
        <h2>三、离线/在线切换</h2>
        <p>当离线状态切换为在线状态时：</p>
        <dl>
          <dt>1. 向服务端同步数据</dt>
          <dd>遍历各表，根据actionType提交数据：new->新增，edit->编辑，delete->删除。</dd>
          <dd>逐个提交数据，成功后将actionType设为unchanged再存入indexedDB。</dd>
          <dt>2. 同步服务端的数据</dt>
          <dd>接收服务端的数据，actionType设为unchanged，逐个存入indexedDB。</dd>
        </dl>
      </div>
    );
  }
}

export default Home;
