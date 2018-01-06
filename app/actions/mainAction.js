import uuid from 'uuid/v4'
import { remote } from 'electron'
import fs from 'fs'
import { judgeIdType, ssqpSend, serverIpPort, convertDate } from './index'
import { CMD_FRIEND, CMD_MESSAGE, CMD_FILE } from '../ssqp/utils'
export const INITIATE_DB = 'initiate_db',
            GO_CHAT_WITH_FRIEND = 'go_chat_with_friend',
            GO_CHAT_WITH_GROUP = 'go_chat_with_group',
            GO_CHAT_WITH_SYSTEM = 'go_chat_with_system',
            GROUP_MESSAGE_READED = 'group_message_readed', 
            FRIEND_MESSAGE_READED = 'friend_message_readed', 
            SYSTEM_MESSAGE_READED = 'system_message_readed',
            INITIATE_FRIEND_CHAT_RECORD = 'initiate_friend_chat_record',
            INITIATE_GROUP_CHAT_RECORD = 'initiate_group_chat_record'

export const RESPONSE_CREATE_GROUP = 'response_create_group',
            RESPONSE_JOIN_GROUP = 'response_join_group',
            ADD_SYSTEM_MESSAGE = 'add_system_message',
            RECEIVE_FILE_FROM_FRIEND = 'receive_file_from_friend',
            RECEIVE_FILE_FROM_GROUP = 'receive_file_from_group',
            RECEIVE_MESSAGE_FROM_FRIEND = 'receive_message_from_friend',
            RECEIVE_MESSAGE_FROM_GROUP = 'receive_message_from_group',
            RECEIVE_CONFIRM_ADD_FRIEND = 'receive_confirm_add_friend',
            RECEIVE_FRIEND_GO_ONLINE = 'receive_friend_go_online',
            RECEIVE_FRIEND_GO_OFFLINE = 'receive_friend_go_offline',
            ADD_FRIEND_TO_LIST = 'add_friend_to_list' 

export const CHANGE_CHAT_INPUT = 'change_chat_input',
            SEND_FRIEND_CHAT_MESSAGE = 'send_friend_chat_message',
            SEND_GROUP_CHAT_MESSAGE = 'send_group_chat_message',
            ADD_EMOJI = 'add_emoji',
            SEND_FRIEND_FILE = 'send_friend_file',
            SEND_GROUP_FILE = 'send_group_file'


export function goChatting(id) {
    const idType = judgeIdType(id)
    return (dispatch, getStore) => {
        switch (idType) {
            case 'friend':
                if (!(getStore().chat.record.friend[id])) {
                    dispatch({ type: INITIATE_FRIEND_CHAT_RECORD, id })
                }
                dispatch(messageReaded(id, 'friend'))
                return dispatch(goChatWithFriend(id))
            case 'group':
                if (!(getStore().chat.record.group[id])) {
                    dispatch({ type: INITIATE_GROUP_CHAT_RECORD, id })
                }
                dispatch(messageReaded(id, 'group'))
                return dispatch(goChatWithGroup(id))
            case 'systemMessage':
                dispatch(messageReaded(id, 'systemMessage'))
                return dispatch(goChatWithSystem())
            default:
                return 
        }
    }
} 

export function messageReaded(id, idType) {
    switch (idType) {
        case 'friend':
            return { type: FRIEND_MESSAGE_READED, id }
        case 'group':
            return { type: GROUP_MESSAGE_READED, id }
        case 'systemMessage':
            return { type: SYSTEM_MESSAGE_READED }
        default:
            return 
    }
}

export function goChatWithFriend(id) {
    return { type: GO_CHAT_WITH_FRIEND, id }
}

export function goChatWithGroup(id) {
    return { type: GO_CHAT_WITH_GROUP, id }
}

export function goChatWithSystem() {
    return { type: GO_CHAT_WITH_SYSTEM }
}

export function confirmAddFriend(selfId, tarInfo) {
    return dispatch => {
        const des = {
            type: 'confirmAddFriend',
            target: tarInfo.userId,
            userId: selfId
        }
        ssqpSend(serverIpPort, CMD_FRIEND, des)
        .then(response => {
            if (response.descriptor.code === 200) {
                dispatch({
                    type: ADD_FRIEND_TO_LIST,
                    payload: tarInfo
                })
            } else {
                alert('confirm add friend error!!')
            }
        })
        .catch(err => alert(err))
    }
}

export function changeChatInput(value) {
    return { type: CHANGE_CHAT_INPUT, value }
}

export function addEmoji(value) {
    return { type: ADD_EMOJI , value }
}

function sendSth(dispatch, cmd, targetType, messageType, tarInfo, selfId, fileInfo, data) {
    let con, ipPort, actionType, groupId
    if (targetType === 'friend') {
        ipPort = tarInfo.ipPort
        actionType = cmd !== CMD_FILE ? SEND_FRIEND_CHAT_MESSAGE: SEND_FRIEND_FILE
    } else {
        ipPort = Object.values(tarInfo.member).reduce((acc, m) => {
            acc.push(m.ipPort)
            return acc
        }, [])
        actionType = cmd !== CMD_FILE ? SEND_GROUP_CHAT_MESSAGE: SEND_GROUP_FILE   
        groupId = tarInfo.groupId   
    }
    const descriptor = {
        id: uuid(),
        userId: selfId,
        type: targetType,
        messageType,
        groupId,
        fileInfo
    }
    const content = cmd !== CMD_FILE ? data : `你发送了文件${fileInfo.filename}`
    const localMessagePayload = [{
        isSelf: true,
        time: convertDate(new Date()),
        messageId: uuid(),
        content,
        messageType,
        userId: tarInfo.userId,
        groupId
    }]
    dispatch({type: actionType, payload: localMessagePayload})
    ssqpSend(ipPort, cmd, descriptor, data)
    .then(() => console.log('send sth success'))
    .catch((err) => alert(err))

}

export function sendChatMessage(targetType, tarInfo, selfId) {
    return (dispatch, getStore) => {
        const { chatInput } = getStore().chat
        sendSth(dispatch, CMD_MESSAGE, targetType, 'message', tarInfo, selfId, undefined, chatInput)
    }
}

export function sendImage(targetType, tarInfo, selfId) {
    return dispatch => {
        remote.dialog.showOpenDialog({
        title: '发送图片',
        filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]
    }, (filePaths => {
        console.log(`file path is ${filePaths[0]}`)
        fs.readFile(filePaths[0], (err, data) => {
            if (err) throw new Error(err)
            const imgBase64 = data.toString('base64')
            sendSth(dispatch, CMD_MESSAGE, targetType, 'image', tarInfo, selfId, undefined, imgBase64) 
        })
        })
    )
    }
}
export function sendFile(targetType, tarInfo, selfId) {
    return dispatch => {
        remote.dialog.showOpenDialog({title: '发送文件'}
    , (filePaths => {
        console.log(filePaths)
        console.log(`file path is ${filePaths[0]}`)
        const filename = /\w+\.\w+$/.exec(filePaths[0])
        fs.stat(filePaths[0], (err, info) => {
            if (err) throw new Error(err)
            const fileInfo = {
                filename,
                filesize: info.size / 1024
            }
            fs.readFile(filePaths[0], (err, data) => {
                if (err) throw new Error(err)
                sendSth(dispatch, CMD_FILE, targetType, 'file', tarInfo, selfId, fileInfo, data) 
            })
        })
        })
    )
    }
}
//test
