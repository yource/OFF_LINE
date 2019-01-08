import './App.css';
import React, { Component } from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from './pages/home.js'
import Edit from './pages/edit.js'
import Test from './pages/test.js'
import About from './pages/about.js'
import axios from 'axios'

import * as serviceWorker from './serviceWorker';
serviceWorker.register();

const { Header, Content } = Layout;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current: 'home'
    }
  }

  componentDidMount() { }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Layout className="mainLayout">
            <Header>
              <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal" className="headerMenu">
                <Menu.Item key="home">
                  <Link to="/" >Home</Link>
                </Menu.Item>
                <Menu.Item key="edit">
                  <Link to="/edit" >Edit</Link>
                </Menu.Item>
                <Menu.Item key="test">
                  <Link to="/test" >Test</Link>
                </Menu.Item>
                <Menu.Item key="about">
                  <Link to="/about">About</Link>
                </Menu.Item>
              </Menu>
            </Header>
            <Content className="mainContent">
              <div style={{ padding: '20px', background: '#fff', borderRadius: '5px' }}>
                <Route exact path="/" component={Home} />
                <Route path="/edit" component={Edit} />
                <Route path="/test" component={Test} />
                <Route path="/about" component={About} />
              </div>
            </Content>
          </Layout>
        </div>
      </Router>
    );
  }
}

export default App;