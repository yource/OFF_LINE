import 'antd/dist/antd.css'; 
import './App.css';
import React, { Component } from 'react';
import { Layout, Menu, notification  } from 'antd';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from './pages/home/home'
import Test from './pages/test/test'
import Category from './pages/category/category'
import Tax from './pages/tax/tax'

// import * as serviceWorker from './serviceWorker';
// serviceWorker.register();

const { Header, Content } = Layout;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current: 'home'
    }
  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }

  componentDidMount(){
    window.addEventListener("lineOn", function () {
      notification.success({
        message: '网络正常',
        description: '您的设备已与服务器连接成功',
      });
    })

    window.addEventListener("lineOff", function () {
      notification.warning({
        message: '断开连接',
        description: '您的设备与服务器断开连接，请检查网络设置',
      });
    })
  }

  render() {
    return (
      <Router>
        <div className="App" id="App">
          <Layout className="mainLayout">
            <Header>
              <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal" className="headerMenu">
                <Menu.Item key="home">
                  <Link to="/" >Home</Link>
                </Menu.Item>
                <Menu.Item key="test">
                  <Link to="/test" >Test</Link>
                </Menu.Item>
                <Menu.Item key="category">
                  <Link to="/category" >Category</Link>
                </Menu.Item>
                <Menu.Item key="tax">
                  <Link to="/tax" >Tax</Link>
                </Menu.Item>
              </Menu>
            </Header>
            <Content className="mainContent">
              <div style={{ padding: '20px', background: '#fff', borderRadius: '5px' }}>
                <Route exact path="/" component={Home} />
                <Route path="/test" component={Test} />
                <Route path="/category" component={Category} />
                <Route path="/tax" component={Tax} />
              </div>
            </Content>
          </Layout>
        </div>
      </Router>
    );
  }
}

export default App;