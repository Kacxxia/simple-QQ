import { ipcRenderer, remote } from 'electron'
import fs from 'fs'

import uuid from 'uuid/v4'

import { store } from '../index'

import {
    isDirectUpdate,
    CMD_FILE,
    CMD_MESSAGE,
    CMD_GET,
    CMD_FRIEND,
    CMD_GROUP,
    CMD_PUSH_UPDATE
 } from '../ssqp/utils'

 import {
     RESPONSE_JOIN_GROUP,
     RESPONSE_CREATE_GROUP,
     ADD_SYSTEM_MESSAGE,
     RECEIVE_FILE_FROM_FRIEND,
     RECEIVE_FILE_FROM_GROUP,
     RECEIVE_MESSAGE_FROM_FRIEND,
     RECEIVE_MESSAGE_FROM_GROUP,
     RECEIVE_CONFIRM_ADD_FRIEND,
     RECEIVE_FRIEND_GO_ONLINE,
     RECEIVE_FRIEND_GO_OFFLINE
 } from './main'

const callbackList = {
    // uuid: callback
}

const filelist = {
    // uuid: file
}

export const IO_NORMAL = 'io_normal',
            IO_SUCCESS = 'io_success',
            IO_WAITING = 'io_waiting',
            IO_FAILED = 'io_failed'

export const serverIpPort = ['127.0.0.1', '11111']

export function ssqpSend(ipPort, cmd, descriptor, data) {
    return new Promise((resolve, reject) => {
        try {
            const id = uuid()
            descriptor.id = id
            callbackList[id] = resolve

            const obj = { ipPort, cmd, descriptor, data }
            obj.type = 'send'

            worker.postMessage(obj)
        } catch (err) {
            reject(err)
        }
    })
}

worker.onmessage = function getdata(e) {
    const { type, cmd, descriptor, data } = e.data
    const id = descriptor.id
    if (type === 'get') {
        if (isDirectUpdate(cmd)) {
            if (cmd === CMD_FILE) {
                const { filename, filesize } = descriptor
                const fileId = uuid()
                filelist[fileId] = data
                switch (descriptor.type) {
                    case 'friend':
                        store.dispatch({
                            type: RECEIVE_FILE_FROM_FRIEND,
                            payload: [{
                                userId: descriptor.userId,
                                messageType: 'file',
                                isSelf: false,
                                time: convertDate(new Date()),
                                fileId,
                                filename,
                                filesize,
                                content: `发送了文件${filename}, 大小为${filesize}, 是否接收？`
                            }]
                        })
                        break;
                    case 'group':
                        store.dispatch({
                            type: RECEIVE_FILE_FROM_GROUP,
                            payload: [{
                                messageType: 'file',
                                isSelf: false,
                                userId: descriptor.userId,
                                groupId: descriptor.groupId,
                                time: convertDate(new Date()),
                                fileId,
                                filename,
                                filesize,
                                content: `发送了文件${filename}, 大小为${filesize}, 是否接收？`
                            }]
                        })
                        break;
                    default:
                        throw new Error('receive invalid type!!expect friend/group')
                }
            } else if (cmd === CMD_MESSAGE) {
                const messageType = descriptor.messageType
                const message = messageType === 'image' ? data.toString('base64') : data.toString()
                switch (descriptor.type) {
                    case 'friend':
                        store.dispatch({
                            type: RECEIVE_MESSAGE_FROM_FRIEND,
                            payload: [{
                                type: messageType,
                                isSelf: false,
                                content: message,
                                time: convertDate(new Date()),
                                userId: descriptor.userId
                            }]
                        })
                        break;
                    case 'group':
                        store.dispatch({
                            type: RECEIVE_MESSAGE_FROM_GROUP,
                            payload: [{
                                userId: descriptor.userId,
                                groupId: descriptor.groupId,
                                type: messageType,
                                isSelf: false,
                                content: message,
                                time: convertDate(new Date())
                            }]
                        })
                        break;
                    default: 
                        throw new Error('receive invalid message type!')
                }
            } else {
                if (cmd === CMD_PUSH_UPDATE) {
                    const { type, userId } = descriptor
                    switch (type) {
                        case 'confirmAddFriend':{
                        const payload = { 
                            userId,
                            name: descriptor.name,
                            ipPort: descriptor.ipPort,
                            isOnline: descriptor.isOnline
                         }
                                store.dispatch({
                                    type: RECEIVE_CONFIRM_ADD_FRIEND,
                                    payload
                                })
                                store.dispatch({
                                    type: ADD_SYSTEM_MESSAGE,
                                    payload: [{
                                        type: 'confirmAddFriend',
                                        messageId: uuid(),
                                        time: convertDate(new Date()),
                                        content: `${payload.name}(${payload.userId})同意添加你为好友了`
                                    }]
                                })
                            break;
                            }
                        case 'requestAddFriend':{
                            const { name, ipPort, isOnline, userId } = descriptor
                            const payload = { name, ipPort, isOnline, userId }
                                store.dispatch({
                                    type: ADD_SYSTEM_MESSAGE,
                                    payload: [{
                                        type: 'requestAddFriend',
                                        messageId: uuid(),
                                        time: convertDate(new Date()),
                                        content: `${name}(${userId})请求添加你为好友`,
                                        info: payload
                                    }]
                                })
                            break;
                            }
                        case 'goOnline':{
                            const { name } = descriptor
                            store.dispatch({ type: RECEIVE_FRIEND_GO_ONLINE, userId })
                            store.dispatch({
                                type: ADD_SYSTEM_MESSAGE,
                                payload: [{
                                    type: 'goOnline',
                                    messageId: uuid(),
                                    time: convertDate(new Date()),
                                    content: `${name}(${userId})上线了`
                                }]
                            })
                            break;
                        }
                        case 'goOffline':{
                            const { name } = descriptor
                            store.dispatch({ type: RECEIVE_FRIEND_GO_OFFLINE, userId })
                            store.dispatch({
                                type: ADD_SYSTEM_MESSAGE,
                                payload: [{
                                    type: 'goOffline',
                                    messageId: uuid(),
                                    time: convertDate(new Date()),
                                    content: `${name}(${userId})下线了`
                                }]
                            })
                            break;
                        }
                    }
                }
            }

            // store.dispatch()
            //
        } else {
            // if callback, callback
            // callback = undefined
            const receivedData = data.length > 0 ? JSON.parse(Buffer.from(data).toString()) : null
            const o = {
                descriptor,
                data: receivedData
            }

            if (callbackList[id]) {
                callbackList[id](o)
                delete callbackList[id]
            }
        }
    }
}

export function closeWindow() {
    ipcRenderer.send('closeWindow')
}

export function enterInMainPage() {
    ipcRenderer.send('enterInMainPage')
}

export function judgeIdType(idx) {
    const id = parseInt(idx, 10)
    if (id >= 100 && id < 1000) {
        return 'group'
    } else if (id >= 1000 && id < 10000) {
        return 'friend'
    } else if (idx === 'systemMessage') {
        return idx
    } 
        throw new Error(`Id类型出错！！${idx}`)
}

const { BrowserWindow } = remote
const selfWin = BrowserWindow.getAllWindows()[0]
const winSelfId = selfWin.id
ipcRenderer.on('eventFromAdd', (e, payload) => {
    console.log('eventFromAdd')
    console.log(payload)
    const { type, id, userSelf: userSelfId } = payload
    switch (type) {
        case 'addFriend':
            ssqpSend(serverIpPort, CMD_FRIEND, { 
                userId: userSelfId,
                target: id,
                type: 'requestAddFriend'
            }).then(response => {
                if (response.descriptor.code === 200) {
                    store.dispatch({
                        type: ADD_SYSTEM_MESSAGE,
                        payload: [{
                            type: 'requestToAddFriend',
                            content: `你已经向${id}提出好友申请`,
                            messageId: uuid(),
                            time: convertDate(new Date())
                        }]
                    })
                }
            })
            .catch(err => alert(err))
            break;
        case 'joinGroup':
            ssqpSend(serverIpPort, CMD_GROUP, { 
                userId: userSelfId,
                target: id,
                type: 'join'
            }).then(response => {
                if (response.descriptor.code === 200) {
                    store.dispatch({ 
                        type: RESPONSE_JOIN_GROUP,
                        payload: response.data
                    })
                    store.dispatch({
                        type: ADD_SYSTEM_MESSAGE,
                        payload: [{
                            type: 'joinGroup',
                            content: `成功加入群${id}`,
                            time: convertDate(new Date()),
                            messageId: uuid()
                        }]
                    })
                }
                return Promise.resolve()
            })
            .catch(err => alert(err))
            break;
        default:
            throw new Error('incorrect type in adding')
    }
})

export function addSth(userSelfId) {
    const child = new BrowserWindow({ width: 800, height: 600, parent: selfWin })
    child.loadURL(`file://${__dirname}/add.html`)

    child.webContents.on('did-finish-load', () => {
        child.webContents.send('initiate', { winSelfId, userSelfId })
        ssqpSend(serverIpPort, CMD_GET, {
            type: 'both',
            userId: userSelfId
        })
        .then(response => {
            console.log('sending data')
            console.log(response)
            if (response.descriptor.code === 200) {
                console.log('tetetetet')
                child.webContents.send('data', response.data)
                return Promise.resolve()
            }
                throw new Error('error occured in getting group/friend')
        })
        .catch(err => {
            alert(err)
        })
    })
}


export function convertDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

function isBase64(str) {
    return /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(str)
}

export function confirmReceiveFile(fileId) {
    remote.dialog.showSaveDialog({title: '保存文件'}, (filename) => {
        fs.writeFile(filename, filelist[fileId], (err) => {
            if (err) throw new Error(err)
            alert('保存成功')
        })
    })
}