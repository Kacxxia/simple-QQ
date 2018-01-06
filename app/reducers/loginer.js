import {
    LOGIN_WAITING,
    LOGIN_CHANGE_ID,
    LOGIN_CHANGE_PASSWORD,
    OPEN_BOARD,
    CLOSE_BOARD,
    REGIST_WAITING,
    REGIST_CHANGE_NAME,
    REGIST_CHANGE_PASSWORD,
    GO_LOGIN,
    GO_REGIST
} from '../actions/login'

import { IO_FAILED, IO_NORMAL, IO_WAITING } from '../actions/index'

const INITIAL_STATE = {
    isLogin: true,
    login: {
        userId: '',
        password: '',
        status: IO_NORMAL
    },
    regist: {
        name: '',
        password: '',
        status: IO_NORMAL
    },
    board: {
        isOpen: false,
        title: '',
        content: ''
    }
}

export default function loginReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case LOGIN_CHANGE_ID:
        case LOGIN_CHANGE_PASSWORD:
        case LOGIN_WAITING:
            return Object.assign({}, state, { login: handleLogin(state.login, action) })
        case REGIST_CHANGE_NAME:
        case REGIST_CHANGE_PASSWORD:
        case REGIST_WAITING:
            return Object.assign({}, state, { regist: handleRegist(state.regist, action) })
        case OPEN_BOARD:
            return Object.assign({}, state, {
                board: {
                    isOpen: true,
                    title: action.title,
                    content: action.content
                }
            })
        case CLOSE_BOARD:
            return Object.assign({}, state, {
                board: INITIAL_STATE.board,
                login: handleLogin(state.login, action),
                regist: handleRegist(state.regist, action)
            })
        case GO_LOGIN:
            return Object.assign({}, state, {
                isLogin: true,
                login: handleLogin(state.login, action)
            })
        case GO_REGIST:
            return Object.assign({}, state, {
                isLogin: false,
                regist: handleRegist(state.regist, action)
            })
        default:
            return state
    }
}

function handleLogin(state, action) {
    switch (action.type) {
        case LOGIN_CHANGE_ID:
            return Object.assign({}, state, { userId: action.value })
        case LOGIN_CHANGE_PASSWORD:
            return Object.assign({}, state, { password: action.value })
        case LOGIN_WAITING:
            return Object.assign({}, state, { status: IO_WAITING })
        case CLOSE_BOARD:
            return Object.assign({}, state, {
                password: '',
                status: IO_FAILED
             })
        case GO_LOGIN:
            return Object.assign({}, state, {
                password: '',
                status: IO_NORMAL
             })
        default:
            return state
    }
}

function handleRegist(state, action) {
    switch (action.type) {
        case REGIST_CHANGE_NAME:
            return Object.assign({}, state, { name: action.value })
        case REGIST_CHANGE_PASSWORD:
            return Object.assign({}, state, { password: action.value })
        case REGIST_WAITING:
            return Object.assign({}, state, { status: IO_WAITING })
        case CLOSE_BOARD:
            return Object.assign({}, state, {
                password: '',
                status: IO_FAILED
             })
        case GO_REGIST:
             return Object.assign({}, state, {
                 password: '',
                 status: IO_NORMAL
              })
        default:
            return state
    }
}
