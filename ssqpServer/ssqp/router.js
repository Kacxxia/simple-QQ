const uuid = require('uuid/v4')
const utils = require('./utils')

const serverIpPort = ['127.0.0.1', '11111'],
    CLIENT_PORT = 3003

const USER_INITIAL_INFO = {
    name: '',
    password: '',
    ipPort: [],
    friend: [],
    group: [],
    isOnline: true
}

const database = {
    user: {
        // userId: { name, password, ipPort, friend, group, isOnline }
        '1234': {
            name: 'root',
            password: '123',
            ipPort: ['127.0.0.1', 3123],
            friend: [],
            group: ['111'],
            isOnline: false
        },
        '4567': {
            name: 'bar',
            password: '456',
            ipPort: ['127.0.0.1', CLIENT_PORT],
            friend: [],
            group: [],
            isOnline: false
        }
    },
    group: {
        // groupId: { groupName, member: [userId]}
        '111': {
            groupName: 'group111',
            member: ['1234']
        }
    }
}

const randomIdDatabase = {

}

const timingList = {

}

function handleRequestRegist(desIpPort, descriptor) {
    console.log(`get regist request from ${desIpPort[0]}:${desIpPort[1]}`)
    const { name, password } = descriptor
    try {
        const userId = generateUserId()
        const record = Object.assign({}, USER_INITIAL_INFO, {
            name,
            password,
            ipPort: desIpPort
        })
        database.user[userId] = record

        return {
            code: 200,
            message: 'regist operation success!!',
            payload: {
                userId,
                name
            }
        }
    } catch (e) {
        console.error(e)
        return {
            code: 500,
            message: `error occurred during registeration:\n ${e}`
        }
    }
}

function gernerateRandom(start, end) {
    let i
    do {
        i = Math.floor(Math.random() * (end - start)) + start
    } while (randomIdDatabase[i]);
    randomIdDatabase[i] = 1
    return i.toString()
}

function generateUserId() {
    return gernerateRandom(1000, 10000)
}

function pushUpdateToFriends(ssqpBox, type, userId) {
    const { friend, name } = database.user[userId]
    friend.forEach(f => {
        const { ipPort, isOnline } = database.user[f]
        if (isOnline) {
            const des = {
                id: uuid(),
                userId,
                type,
                name
            }
            ssqpBox.sendPacket(ipPort[0], ipPort[1], utils.CMD_PUSH_UPDATE, des)
        }
    })
}
function handleRequestLogin(desIpPort, descriptor, ssqpBox) {
    console.log(`login request from ${desIpPort[0]}:${desIpPort[1]}`)
    try {
        const { userId, password } = descriptor
        const u = database.user[userId]
        if (u) {
            if (u.password === password) {
                u.ipPort = desIpPort
                u.ipPort[1] = CLIENT_PORT
                u.isOnline = true
                pushUpdateToFriends(ssqpBox, 'goOnline', userId)
                timingList[userId] = setTimeout(() => {
                    pushUpdateToFriends(ssqpBox, 'goOffline', userId)
                    database.user[userId].isOnline = false
                }, 60000)
                return {
                    code: 200,
                    message: 'received login request!!',
                    payload: {
                        group: u.group.reduce((acc, g) => {
                            acc[g] = {
                                groupId: g,
                                groupName: database.group[g].groupName,
                                member: database.group[g].member.reduce((re, m) => {
                                    re[userId] = {
                                        userId: m,
                                        name: database.user[m].name,
                                        ipPort: database.user[m].ipPort,
                                        isOnline: database.user[m].isOnline
                                    }
                                    return re
                                }, {})
                            }
                            return acc
                        }, {}),
                        friend: u.friend.reduce((acc, f) => {
                            acc[userId] = {
                                userId: f,
                                name: database.user[f].name,
                                ipPort: database.user[f].ipPort,
                                isOnline: database.user[f].isOnline
                            }
                            return acc
                        }, {}),
                        self: {
                            name: u.name,
                            userId
                        }
                    }
                }
            }
        }
            return {
                code: 401,
                message: '认证失败'
            }
    } catch (e) {
        return {
            code: 500,
            message: `error: ${e}`
        }
    }
}

function handleRequestGet(desIpPort, descriptor) {
    console.log(`get request from ${desIpPort[0]}:${desIpPort[1]}`)
    // 默认both, get: friend&group
    const originId = descriptor.userId
    const groupInfo = Object.entries(database.group).reduce((rs, g) => {
        rs.push({
            groupId: g[0],
            groupName: g[1].groupName
        })
        return rs
    }, [])
    const friendInfo = Object.entries(database.user).reduce((rs, f) => {
        if (f[0] !== originId) {
            rs.push({
                userId: f[0],
                name: f[1].name
            })
        }
        return rs
    }, [])
    return {
        code: 200,
        message: '获取群组成功',
        payload: {
            group: groupInfo,
            friend: friendInfo
        }
    }
}

function handleRequestPing(desIpPort, descriptor, ssqpBox) {
    console.log(`ping request ${desIpPort[0]}:${desIpPort[1]}`)
    try {
        const { userId } = descriptor
        clearTimeout(timingList[userId])
        timingList[userId] = setTimeout(() => {
            pushUpdateToFriends(ssqpBox, 'goOffline', userId)
            database.user[userId].isOnline = false
        }, 60000)
        return {
            code: 200,
            message: 'received ping !!'
        }
    } catch (e) {
        return {
            code: 500,
            message: 'error in received ping'
        }
    }
}


async function handleRequestFriend(desIpPort, descriptor, ssqpBox) {
    console.log(`get friend operation from ${desIpPort}`)
    const { userId, type, target } = descriptor
    const { ipPort: tIpPort, isOnline: tIsOnline } = database.user[target].ipPort
    try {
        if (type === 'confirmAdd') {
            database.user[userId].friend.push(target)
            database.user[target].friend.push(userId)
            ssqpBox.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                id: uuid(),
                type: 'confirmAddFriend',
                userId,
                name: database.user[userId].name,
                ipPort: database.user[userId].ipPort,
                isOnline: database.user[userId].isOnline
            })
        } else if (type === 'remove') {
            database.user[userId].friend = database.user[userId].friend.filter(f => f !== target)
            ssqpBox.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                id: uuid(),
                type: 'removeFriend',
                userId
            })
        } else {
            //emulate
            const { ipPort, name, isOnline } = database.user[userId]
            const descriptor = {
                type: "confirmAddFriend",
                userId: target,
                target: userId,
                name: database.user[target].name,
                ipPort: database.user[target].ipPort,
                isOnline: database.user[target].isOnline
            }
            ssqpBox.sendPacket(ipPort[0], ipPort[1], utils.CMD_PUSH_UPDATE, descriptor)
            //-------
            if (tIsOnline) {
                ssqpBox.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                    id: uuid(),
                    type: 'requestAddFriend',
                    userId,
                    name,
                    ipPort,
                    isOnline
                })
            }
        }

        return {
            code: 200,
            message: 'friend operating success!!'
        }
    } catch (err) {
        console.error(err)
        return {
            code: 500,
            message: `error occured in handling friend: \n${err}`,
        }
    }
}

function generateGroupId() {
    return gernerateRandom(100, 1000)
}

function handleRequestGroup(desIpPort, descriptor, ssqpBox) {
    console.log('group request')
    const { userId, type, target } = descriptor
    console.log(desIpPort)
    console.log(database.user[userId])
    console.log(descriptor)
    try {
        const { member } = database.group[target]
        const { user } = database
        if (type === 'join') {
            member.forEach(m => {
                if (user[m].isOnline) {
                    ssqpBox.sendPacket(user[m].ipPort[0], user[m].ipPort[1], utils.CMD_PUSH_UPDATE, {
                        id: uuid(),
                        type: 'joinGroup',
                        userId,
                        name: user[m].name,
                        ipPort: user[m].ipPort,
                        isOnline: user[m].isOnline
                    })
                }
            })
            const memberDetail = member.reduce((re, m) => {
                re.push({
                    userId: m,
                    name: database.user[m].name,
                    ipPort: database.user[m].ipPort,
                    isOnline: database.user[m].isOnline
                })
                return re
            }, [])
            member.push(userId)                                   
            return {
                code: 200,
                message: 'received group request!!',
                payload: {
                    groupId: target,
                    groupName: database.group[target].groupName,
                    member: memberDetail
                }
            }
        } else if (type === 'quit') {
            member.forEach(m => {
                ssqpBox.sendPacket(user[m].ipPort[0], user[m].ipPort[1], utils.CMD_PUSH_UPDATE, {
                    id: uuid(),
                    type: 'quitGroup',
                    userId
                })
            })
        } else {
            const groupId = generateGroupId()
            const { groupName } = descriptor
            database.group[groupId] = { groupName, member: [userId] }
            return {
                code: 200,
                message: 'received group request!!',
                payload: Object.assign({}, database.group[groupId], { groupId })
            }
        }

        return {
            code: 200,
            message: 'received group request!!'
        }
    } catch (e) {
        return {
            code: 500,
            message: `error occured in handling group: \n${e}`
        }
    }
}


module.exports = {
    handleRequestRegist,
    handleRequestLogin,
    handleRequestGet,
    handleRequestPing,
    handleRequestFriend,
    handleRequestGroup
}
