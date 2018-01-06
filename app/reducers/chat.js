import {
    GO_CHAT_WITH_GROUP,
    GO_CHAT_WITH_SYSTEM,
    GO_CHAT_WITH_FRIEND,
    INITIATE_FRIEND_CHAT_RECORD,
    INITIATE_GROUP_CHAT_RECORD,
    ADD_SYSTEM_MESSAGE,
    RECEIVE_FILE_FROM_FRIEND,
    RECEIVE_FILE_FROM_GROUP,
    RECEIVE_MESSAGE_FROM_FRIEND,
    RECEIVE_MESSAGE_FROM_GROUP,
    CHANGE_CHAT_INPUT,
    ADD_EMOJI,
    SEND_FRIEND_CHAT_MESSAGE,
    SEND_GROUP_CHAT_MESSAGE,
    SEND_FRIEND_FILE,
    SEND_GROUP_FILE
} from '../actions/mainAction'

const INITIAL_STATE = {
    type: 'none', // none/friend/group/system
    target: '',
    chatInput: '',
    record: {
        friend: {},
        group: {},
        system: [] // {type: joinGroup/requestAddFriend/confirmAddFriend,
    }              // content, messageId, time}
}

export default function chatReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case GO_CHAT_WITH_FRIEND:
            return Object.assign({}, state, {
                type: 'friend',
                target: action.id,
                inputValue: ''
            })
        case GO_CHAT_WITH_GROUP:
            return Object.assign({}, state, {
                type: 'group',
                target: action.id,
                inputValue: ''
            })
        case GO_CHAT_WITH_SYSTEM:
            return Object.assign({}, state, {
                type: 'system',
                target: '',
                inputValue: ''
            })
        case INITIATE_FRIEND_CHAT_RECORD:
        case INITIATE_GROUP_CHAT_RECORD:
        case ADD_SYSTEM_MESSAGE:
        case RECEIVE_FILE_FROM_FRIEND:
        case RECEIVE_FILE_FROM_GROUP:
        case RECEIVE_MESSAGE_FROM_FRIEND:
        case RECEIVE_MESSAGE_FROM_GROUP:
        case SEND_FRIEND_FILE:
        case SEND_GROUP_FILE:
            return Object.assign({}, state, {
                record: handleRecord(state.record, action)
            })
        case SEND_FRIEND_CHAT_MESSAGE:
        case SEND_GROUP_CHAT_MESSAGE:
            return Object.assign({}, state, {
                chatInput: '',
                record: handleRecord(state.record, action)
            })
        case CHANGE_CHAT_INPUT:
            return Object.assign({}, state, {
                chatInput: action.value
            })
        case ADD_EMOJI:
            return Object.assign({}, state, {
                chatInput: state.chatInput.concat(action.value)
            })
        default:
            return state
    }
}

function handleRecord(state, action) {
    switch (action.type) {
        case INITIATE_FRIEND_CHAT_RECORD:
            return Object.assign({}, state, {
                friend: Object.assign({}, state.friend, {
                    [action.id]: []
                })
            })
        case INITIATE_GROUP_CHAT_RECORD:
            return Object.assign({}, state, {
                group: Object.assign({}, state.group, {
                    [action.id]: []
                })
            })
        case ADD_SYSTEM_MESSAGE:
            return Object.assign({}, state, {
                system: state.system.concat(action.payload)
            })
        case RECEIVE_FILE_FROM_FRIEND:
        case RECEIVE_MESSAGE_FROM_FRIEND:
        case SEND_FRIEND_CHAT_MESSAGE:
        case SEND_FRIEND_FILE:
            return Object.assign({}, state, {
                friend: handleDetailRecord(state.friend, action)
            })
        case RECEIVE_FILE_FROM_GROUP:
        case RECEIVE_MESSAGE_FROM_GROUP:
        case SEND_GROUP_CHAT_MESSAGE:
        case SEND_GROUP_FILE:
            return Object.assign({}, state, {
                group: handleDetailRecord(state.group, action)
            })
        default:
            return state
    }
}

function handleDetailRecord(state, action) {
    switch (action.type) {
        case RECEIVE_FILE_FROM_GROUP:
        case RECEIVE_MESSAGE_FROM_GROUP:
        case SEND_GROUP_CHAT_MESSAGE:
        case SEND_GROUP_FILE:
            return Object.assign({}, state, {
                [action.payload[0].groupId]: state[action.payload[0].groupId].concat(action.payload)
            })
        case RECEIVE_FILE_FROM_FRIEND:
        case RECEIVE_MESSAGE_FROM_FRIEND:
        case SEND_FRIEND_CHAT_MESSAGE:     
        case SEND_FRIEND_FILE:   
            return Object.assign({}, state, {
                [action.payload[0].userId]: state[action.payload[0].userId].concat(action.payload)
            })
        default:
            return state
    }
}
