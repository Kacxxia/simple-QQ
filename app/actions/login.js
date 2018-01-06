import { push } from 'react-router-redux'
import { ssqpSend, serverIpPort, enterInMainPage } from './index'
import { INITIATE_DB } from './mainAction'
import { CMD_REGIST, CMD_LOGIN } from '../ssqp/utils'

export const LOGIN_FAILED = 'login_failed',
            LOGIN_WAITING = 'login_waiting',
            LOGIN_CHANGE_ID = 'login_change_id',
            LOGIN_CHANGE_PASSWORD = 'login_change_password',
            OPEN_BOARD = 'login_open_board',
            CLOSE_BOARD = 'login_close_board',
            REGIST_FAILED = 'regist_failed',
            REGIST_WAITING = 'regist_waiting',
            REGIST_CHANGE_NAME = 'regist_change_name',
            REGIST_CHANGE_PASSWORD = 'regist_change_password',
            GO_LOGIN = 'go_login',
            GO_REGIST = 'go_regist'

export function login() {
    return (dispatch, getStore) => {
        const { userId, password } = getStore().loginer.login
            const desc = { userId, password }
            dispatch({ type: LOGIN_WAITING })
            ssqpSend(serverIpPort, CMD_LOGIN, desc)
            .then((response) => {
                const { descriptor, data } = response
                if (descriptor.code === 200) {
                    dispatch({
                        type: INITIATE_DB,
                        payload: data
                    })
                    enterInMainPage()
                    dispatch(push('main'))
                } else {
                    dispatch({
                        type: OPEN_BOARD,
                        title: '失败',
                        content: descriptor.message,
                        code: descriptor.code
                    })
                }
                return Promise.resolve()
            })
            .catch(err => {
                dispatch({
                    type: OPEN_BOARD,
                    title: '失败',
                    content: err,
                    code: 400
                })
            })
    }
}

export function regist() {
    return (dispatch, getStore) => {
        const { name, password } = getStore().loginer.regist
        const desc = { name, password }
        dispatch({ type: REGIST_WAITING })
        ssqpSend(serverIpPort, CMD_REGIST, desc)
        .then(response => {
            const { descriptor, data } = response
            if (descriptor.code === 200) {
                dispatch({
                    type: OPEN_BOARD,
                    title: '注册成功！',
                    content: `你的ssqpId为${data.userId}`
                })
                dispatch({
                    type: INITIATE_DB,
                    payload: {
                        group: {},
                        friend: {},
                        self: {
                            name: data.name,
                            userId: data.userId
                        }
                    }
                })
                
            } else {
                dispatch({
                    type: OPEN_BOARD,
                    title: '失败',
                    content: descriptor.message,
                    code: descriptor.code
                })
            }
            return Promise.resolve()
        })
        .catch(err => {
            dispatch({
                type: OPEN_BOARD,
                title: '失败',
                content: err,
                code: 400
            })
        })
    }
}

export function closeBoard() {
    return { type: CLOSE_BOARD }
}

export function goLogin() {
    return { type: GO_LOGIN }
}

export function goRegist() {
    return { type: GO_REGIST }
}

export function loginChangeId(value) {
    return { type: LOGIN_CHANGE_ID, value }
}

export function loginChangePassword(value) {
    return { type: LOGIN_CHANGE_PASSWORD, value }
}

export function registChangeName(value) {
    return { type: REGIST_CHANGE_NAME, value }
}
export function registChangePassword(value) {
    return { type: REGIST_CHANGE_PASSWORD, value }
}
