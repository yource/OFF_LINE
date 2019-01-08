import React, { Component } from 'react';
import './about.css';
import { } from 'antd';

class About extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {

  }

  render() {

    return (
      <div className="about">
        {/* <p><img src={require('../static/logo.png')} /></p> */}
        <p>Menusifu 点菜大师餐馆电脑点餐系统，是美国领先的华人餐饮互联网公司提供智能餐饮点餐系统及相关互联网餐饮服务。Menusifu 点菜大师服务于餐馆帮助餐馆适应互联网时代的需求节约成本提高收益高效管理。</p>
      </div>
    );
  }
}

export default About;
