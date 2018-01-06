import React from 'react';

import { Input, Button } from 'semantic-ui-react'

import { IO_WAITING } from '../actions/index'

const Login = ({
    isLogin,
    login,
    regist,
    onGoLogin,
    onGoRegist,
    onLogin,
    onRegist,
    onLoginChangeId,
    onLoginChangePassword,
    onRegistChangeName,
    onRegistChangePassword
}) => {
    return (
        <div style={{ padding: '18px 0 14px 18px' }} className="d-flex">
            <div style={{ width: 24, height: '100%' }}>&nbsp;</div>
            <div style={{ width: 112, height: '100%' }}>&nbsp;</div>
            <div style={{ width: 244, height: '100%' }}>
                <LoginOrRegist
                    isLogin={isLogin}
                    login={login}
                    regist={regist}
                    onLogin={onLogin}
                    onRegist={onRegist}
                    onGoLogin={onGoLogin}
                    onGoRegist={onGoRegist}
                    onLoginChangeId={onLoginChangeId}
                    onLoginChangePassword={onLoginChangePassword}
                    onRegistChangeName={onRegistChangeName}
                    onRegistChangePassword={onRegistChangePassword}
                />
            </div>
            <div style={{ width: 64, height: '100%' }}>&nbsp;</div>
            <div style={{ width: 24, height: '100%' }}>&nbsp;</div>
        </div>
    );
};

export default Login;


const LoginOrRegist = ({
    isLogin,
    login,
    regist,
    onLogin,
    onRegist,
    onGoLogin,
    onGoRegist,
    onLoginChangeId,
    onLoginChangePassword,
    onRegistChangeName,
    onRegistChangePassword
}) => {
    if (isLogin) {
        return (
            <div>
                <div>
                    <div 
                        style={{ width: 244, height: 37, position: 'relative'}} 
                        className='d-flex flex-column'
                    >
                        <Input placeholder="ssqpID" onChange={(e) => onLoginChangeId(e.target.value)} value={login.userId} fluid />
                        <div 
                            style={{ 
                                position: 'absolute', 
                                left: '256px', 
                                top: 0,
                                width: 64, 
                                height: 17, 
                                padding: '10px 0',
                                cursor: 'pointer'
                            }} 
                            onClick={onGoRegist}
                        >
                            注册
                        </div>
                    </div>
                    <div style={{ width: 244, height: 37 }}>
                        <Input placeholder="password" type="password" onChange={e => onLoginChangePassword(e.target.value)} value={login.password} fluid />
                    </div>
                </div>

                <div className="d-flex" style={{ margin: '8px 0' }}>
                    <div className="align-items-center"> 记住密码</div>
                </div>

                <div style={{ width: 244, height: 40 }}>
                    <Button fluid onClick={onLogin} loading={login.status === IO_WAITING}>
                        登录
                    </Button>
                </div>
            </div>
        )
    }
    return (
        <div>
        <div>
            <div style={{ width: 244, height: 37, position: 'relative' }}>
                <Input placeholder="name" onChange={e => onRegistChangeName(e.target.value)} value={regist.name} fluid />
                <div 
                    style={{ 
                        position: 'absolute', 
                        left: '256px',
                        top: 0, 
                        width: 64, 
                        height: 17, 
                        padding: '10px 0',
                        cursor: 'pointer'
                    }} 
                    onClick={onGoLogin} >
                    返回登录
                </div>
            </div>
            <div style={{ width: 244, height: 37, margin: '8px 0' }}>
                <Input placeholder="password" type="password" onChange={e => onRegistChangePassword(e.target.value)} value={regist.password} fluid />
            </div>
        </div>

        <div style={{ width: 244, height: 40 }}>
            <Button fluid onClick={onRegist} loading={regist.status === IO_WAITING}>
                注册
            </Button>
        </div>
    </div>
    )
}
