import React, { Component } from 'react';
import { connect } from 'react-redux'

import Header from '../components/Header'
import Nav from '../components/Nav'
import Dashboard from '../components/Dashboard'

class MainPage extends Component {
    render() {
        return (
            <div style={{width: 1140, height: 732}}>
                <div style={{width: '100%', height: '10%'}}>
                    <Header add={true} userSelf={this.props.userSelf}/>
                </div>
                <div style={{width: '100%', height: '90%'}} className='d-flex'>
                    <div style={{width: '26%', height: '100%'}}>
                        <Nav />
                    </div>
                    <div style={{width: '74%', height: '100%'}}>
                        <Dashboard />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        userSelf: state.main.database.self
    }
})(MainPage);