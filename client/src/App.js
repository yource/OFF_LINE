import 'antd/dist/antd.css'; 
import './App.css';
import React, { Component } from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from './pages/home.js'
import Test from './pages/test.js'

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
              </Menu>
            </Header>
            <Content className="mainContent">
              <div style={{ padding: '20px', background: '#fff', borderRadius: '5px' }}>
                <Route exact path="/" component={Home} />
                <Route path="/test" component={Test} />
              </div>
            </Content>
          </Layout>
        </div>
      </Router>
    );
  }
}

export default App;