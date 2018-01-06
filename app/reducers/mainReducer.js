import { 
    INITIATE_DB, 
    GROUP_MESSAGE_READED, 
    FRIEND_MESSAGE_READED, 
    SYSTEM_MESSAGE_READED,
    RESPONSE_JOIN_GROUP,
    RESPONSE_CREATE_GROUP,
    ADD_SYSTEM_MESSAGE,
    RECEIVE_FILE_FROM_FRIEND,
    RECEIVE_FILE_FROM_GROUP,
    RECEIVE_MESSAGE_FROM_FRIEND,
    RECEIVE_MESSAGE_FROM_GROUP,
    RECEIVE_CONFIRM_ADD_FRIEND,
    RECEIVE_FRIEND_GO_ONLINE,
    RECEIVE_FRIEND_GO_OFFLINE,
    ADD_FRIEND_TO_LIST
} from '../actions/main'


const INITIATE_STATE = {
    database: {
        friend: {},
        group: {},
        self: {}
    },
    message: {
        list: {
            systemMessage: false
        },
        friendMessageSum: 0,
        groupMessageSum: 0
    }
}

const EMULATE_STATE = {
    database: {
        friend: {
            1111: {
                userId: '1111',
                name: '11',
                isOnline: true,
                ipPort: ['asd', '111']
            },
            1122: {
                userId: '1122',
                name: '22',
                isOnline: false,
                ipPort: ['asd', '111']
            },
            1133: {
                userId: '1133',
                name: '33',
                isOnline: true,
                ipPort: ['asd', '111']
            }
        },
        group: {
            321: {
                groupId: '321',
                groupName: 'group1',
                member: [{
                    userId: '1111',
                    name: '11',
                    isOnline: true,
                    ipPort: ['asd', '111']
                }, {
                    userId: '1122',
                    name: '22',
                    isOnline: false,
                    ipPort: ['asd', '111']
                }, {
                    userId: '1133',
                    name: '33',
                    isOnline: true,
                    ipPort: ['asd', '111']
                }]
            },
            322: {
                groupId: '322',
                groupName: 'group2',
                member: [{
                    userId: '1133',
                    name: '33',
                    isOnline: true,
                    ipPort: ['asd', '111']
                }]
            }
        },
        self: {
            userId: 'self1',
            name: 'myself'
        }
    },
    message: {
        list: {
            1111: true,
            1122: false,
            322: true,
            systemMessage: false
        },
        groupMessageSum: 1,
        friendMessageSum: 1
    }
}

export default function mainReducer(state = INITIATE_STATE, action) {
    switch (action.type) {
        case INITIATE_DB:
            return Object.assign({}, state, { database: action.payload })
        case GROUP_MESSAGE_READED:
        case FRIEND_MESSAGE_READED:
        case SYSTEM_MESSAGE_READED: 
        case ADD_SYSTEM_MESSAGE:
        case RECEIVE_FILE_FROM_FRIEND:
        case RECEIVE_FILE_FROM_GROUP:
        case RECEIVE_MESSAGE_FROM_FRIEND:
        case RECEIVE_MESSAGE_FROM_GROUP:
            return Object.assign({}, state, { message: handleMessage(state.message, action) })
        case RESPONSE_JOIN_GROUP:
        case RESPONSE_CREATE_GROUP:
        case RECEIVE_CONFIRM_ADD_FRIEND:
        case RECEIVE_FRIEND_GO_OFFLINE:
        case RECEIVE_FRIEND_GO_ONLINE:
        case ADD_FRIEND_TO_LIST:
            return Object.assign({}, state, {
                database: handleDatabase(state.database, action)
            })
        default:
            return state
        }
}

function handleMessage(state, action) {
    switch (action.type) {
        case GROUP_MESSAGE_READED:
            return Object.assign({}, state, {
                groupMessageSum: decreaseToZero(state.groupMessageSum),
                list: Object.assign({}, state.list, { [action.id]: false })
            })
        case FRIEND_MESSAGE_READED:
            return Object.assign({}, state, {
                friendMessageSum: decreaseToZero(state.friendMessageSum),
                list: Object.assign({}, state.list, { [action.id]: false })
            })
        case SYSTEM_MESSAGE_READED:
            return Object.assign({}, state, {
                list: Object.assign({}, state.list, { systemMessage : false })
            })
        case ADD_SYSTEM_MESSAGE:
            return Object.assign({}, state, {
                list: Object.assign({}, state.list, { systemMessage : true })
            })
        case RECEIVE_FILE_FROM_FRIEND:
        case RECEIVE_MESSAGE_FROM_FRIEND:        
            return Object.assign({}, state, {
                friendMessageSum: state.friendMessageSum + 1,
                list: Object.assign({}, state.list, { [action.payload[0].userId]: true })
            })
        case RECEIVE_FILE_FROM_GROUP:
        case RECEIVE_MESSAGE_FROM_GROUP:
        return Object.assign({}, state, {
                groupMessageSum: state.groupMessageSum + 1,
                list: Object.assign({}, state.list, { [action.payload[0].groupId]: true })
            })
        default:
            return state
    }
}

function decreaseToZero(origin) {
    return origin === 0 ? 0 : origin - 1
}

function handleDatabase(state, action) {
    switch (action.type) {
        case RESPONSE_CREATE_GROUP:
        case RESPONSE_JOIN_GROUP:
            return Object.assign({}, state, { 
                group: handleGroup(state.group, action)
            })
        case RECEIVE_CONFIRM_ADD_FRIEND:
        case RECEIVE_FRIEND_GO_OFFLINE:
        case RECEIVE_FRIEND_GO_ONLINE:
        case ADD_FRIEND_TO_LIST:
            return Object.assign({}, state, {
                friend: handleFriend(state.friend, action)
            })
        default:
            return state
    }
}
function handleGroup(state, action) {
    switch (action.type) {
        case RESPONSE_CREATE_GROUP:
        case RESPONSE_JOIN_GROUP:
            return Object.assign({}, state, { 
                [action.payload.groupId]: action.payload
            })
        default:
            return state
    }
}
function handleFriend(state, action) {
    switch (action.type) {
        case RECEIVE_CONFIRM_ADD_FRIEND:
        case ADD_FRIEND_TO_LIST:
            return Object.assign({}, state, {
                [action.payload.userId]: action.payload
            })
        case RECEIVE_FRIEND_GO_ONLINE:
        case RECEIVE_FRIEND_GO_OFFLINE:
            return Object.assign({}, state, {
                [action.payload.userId]: handleSpecificFriend(state[action.payload.userId], action)
            })
        default:
            return state
    }
}

function handleSpecificFriend(state, action) {
    switch (action.type) {
        case RECEIVE_FRIEND_GO_ONLINE:
            return Object.assign({}, state, { 
                isOnline: true
            })
        case RECEIVE_FRIEND_GO_OFFLINE:
            return Object.assign({}, state, { 
                isOnline: false
            })
    }
}