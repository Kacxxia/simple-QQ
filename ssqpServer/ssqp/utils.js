const CMD_REGIST = 0
const CMD_LOGIN = 1
const CMD_GET = 2
const CMD_RESPONSE = 3
const CMD_MESSAGE = 4
const CMD_FILE = 5
const CMD_PING = 6
const CMD_PUSH_UPDATE = 7
const CMD_FRIEND = 8
const CMD_GROUP = 9

function isToServer(command) {
    switch (command) {
        case CMD_REGIST:
        case CMD_LOGIN:
        case CMD_GET:
        case CMD_PING:
        case CMD_FRIEND:
        case CMD_GROUP:
            return true
        case CMD_MESSAGE:
        case CMD_FILE:
        case CMD_PUSH_UPDATE:
            return false
        default:
            return true
    }
}

function isDirectUpdate(command) {
    switch (command) {
        case CMD_MESSAGE:
        case CMD_FILE:
        case CMD_PUSH_UPDATE:
            return true
        default:
            return false
    }
}

function serializeDataIfNotBuffer(data) {
    if (!(data instanceof Buffer)) {
        return Buffer.from(JSON.stringify(data))
    }
        return data
}

module.exports = {
    CMD_REGIST,
    CMD_LOGIN,
    CMD_GET,
    CMD_RESPONSE,
    CMD_MESSAGE,
    CMD_FILE,
    CMD_PING,
    CMD_PUSH_UPDATE,
    CMD_FRIEND,
    CMD_GROUP,
    isToServer,
    isDirectUpdate
}
