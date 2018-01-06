import React, { Component } from 'react';
import { connect } from 'react-redux'

import { Modal, Button } from 'semantic-ui-react'

import Header from '../components/Header'
import LogoArea from '../components/LogoArea'
import Login from '../components/Login'

import { 
    goLogin,
    goRegist,
    login,
    regist,
    loginChangeId,
    loginChangePassword,
    registChangeName,
    registChangePassword,
    closeBoard
} from '../actions/login'

class LoginPage extends Component {
    render() {
        return (
            <div style={{ height: 414, width: 540 }}>
                <div style={{ height: 50, width: 540 }}>
                    <Header />
                </div>
                <div style={{ height: 180, width: 540 }}>
                    <LogoArea />
                </div>
                <div style={{ height: 184, width: 540 }}>
                    <Login
                        isLogin={this.props.isLogin}
                        login={this.props.login}
                        regist={this.props.regist}
                        onGoLogin={this.props.onGoLogin}
                        onGoRegist={this.props.onGoRegist}
                        onLogin={this.props.onLogin}
                        onRegist={this.props.onRegist}
                        onLoginChangeId={this.props.onLoginChangeId}
                        onLoginChangePassword={this.props.onLoginChangePassword}
                        onRegistChangeName={this.props.onRegistChangeName}
                        onRegistChangePassword={this.props.onRegistChangePassword}
                    />
                </div>
                <Modal
                    dimmer={true}
                    open={this.props.board.isOpen}
                >
                    <Modal.Header>{this.props.board.title}</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            {this.props.board.content}
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.props.onCloseBoard}>
                            关闭
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}

export default connect(state => {
    return {
        isLogin: state.loginer.isLogin,
        login: state.loginer.login,
        regist: state.loginer.regist,
        board: state.loginer.board
    }
}, dispatch => {
    return {
        onGoLogin: () => dispatch(goLogin()),
        onGoRegist: () => dispatch(goRegist()),
        onLogin: () => dispatch(login()),
        onRegist: () => dispatch(regist()),
        onLoginChangeId: (value) => dispatch(loginChangeId(value)),
        onLoginChangePassword: (value) => dispatch(loginChangePassword(value)),
        onRegistChangeName: (value) => dispatch(registChangeName(value)),
        onRegistChangePassword: (value) => dispatch(registChangePassword(value)),
        onCloseBoard: () => dispatch(closeBoard())
    }
})(LoginPage);
