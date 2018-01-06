const uuid = require('uuid/v4')
const utils = require('./utils')

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
    },
    group: {
        // groupId: { groupName, member: [userId]}
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
                userId
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

function pushUpdateToFriends(ssqp, type, userId) {
    const { friend } = database.user[userId]
    friend.forEach(f => {
        const { ipPort } = database.user[f]
        const des = {
            id: uuid(),
            userId,
            type
        }
        ssqp.sendPacket(ipPort[0], ipPort[1], utils.CMD_PUSH_UPDATE, des)
    })
}
function handleRequestLogin(desIpPort, descriptor, ssqp) {
    console.log(`login request from ${desIpPort[0]}:${desIpPort[1]}`)
    try {
        const { userId, password } = descriptor
        const u = database.user[userId]
        if (u) {
            if (u.password === password) {
                u.ipPort = desIpPort
                u.isOnline = true
                pushUpdateToFriends(ssqp, 'goOnline', userId)
                timingList[userId] = setTimeout(() => {
                    pushUpdateToFriends(ssqp, 'goOffline', userId)
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
                                member: database.group[g].reduce((re, m) => {
                                    re.push({
                                        userId: m,
                                        name: database.user[m].name,
                                        ipPort: database.user[m].ipPort,
                                        isOnline: database.user[m].isOnline
                                    })
                                    return re
                                }, {})
                            }
                            return acc
                        }, []),
                        friend: u.friend.reduce((acc, f) => {
                            acc[userId] = {
                                userId: f,
                                name: database.user[f].name,
                                ipPort: database.user[f].ipPort,
                                isOnline: database.user[f].isOnline
                            }
                            return acc
                        }, {})
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
    // 默认group
    return {
        code: 200,
        message: '获取群组成功',
        payload: {
            group: database.group
        }
    }
}

function handleRequestPing(desIpPort, descriptor, ssqp) {
    console.log(`ping request ${desIpPort[0]}:${desIpPort[1]}`)
    try {
        const { userId } = descriptor
        clearTimeout(timingList[userId])
        timingList[userId] = setTimeout(() => {
            pushUpdateToFriends(ssqp, 'goOffline', userId)
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


async function handleRequestFriend(desIpPort, descriptor, ssqp) {
    console.log(`get friend operation from ${desIpPort}`)
    const { userId, type, target } = descriptor
    const { tIpPort } = database.user[target].ipPort
    try {
        if (type === 'confirmAdd') {
            database.user[userId].friend.push(target)
            database.user[target].friend.push(userId)
            ssqp.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                id: uuid(),
                type: 'confirmAddFriend',
                userId,
                payload: {
                    userId,
                    name: database.user[userId].name,
                    ipPort: database.user[userId].ipPort,
                    isOnline: database.user[userId].isOnline
                }
            })
        } else if (type === 'remove') {
            database.user[userId].friend = database.user[userId].friend.filter(f => f !== target)
            ssqp.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                id: uuid(),
                type: 'removeFriend',
                userId
            })
        } else {
            ssqp.sendPacket(tIpPort[0], tIpPort[1], utils.CMD_PUSH_UPDATE, {
                id: uuid(),
                type: 'requestAddFriend',
                userId,
                payload: {
                    userId,
                    name: database.user[userId].name
                }
            })
        }

        return {
            code: 200,
            message: 'friend operating success!!'
        }
    } catch (err) {
        return {
            code: 500,
            message: `error occured in handling friend: \n${err}`,
        }
    }
}

function generateGroupId() {
    return gernerateRandom(100, 1000)
}

function handleRequestGroup(desIpPort, descriptor, ssqp) {
    console.log('group request')
    const { userId, type, target } = descriptor
    try {
        const { member } = database.group[target].member
        const { user } = database
        if (type === 'join') {
            member.forEach(m => {
                ssqp.sendPacket(user[m].ipPort[0], user[m].ipPort[1], utils.CMD_PUSH_UPDATE, {
                    id: uuid(),
                    type: 'joinGroup',
                    userId,
                    payload: {
                        userId,
                        name: database.user[userId].name,
                        ipPort: database.user[userId].ipPort,
                        isOnline: database.user[userId].isOnline
                    }
                })
            })
        } else if (type === 'quit') {
            member.forEach(m => {
                ssqp.sendPacket(user[m].ipPort[0], user[m].ipPort[1], utils.CMD_PUSH_UPDATE, {
                    id: uuid(),
                    type: 'quitGroup',
                    userId
                })
            })
        } else {
            const groupId = generateGroupId()
            const { groupName } = descriptor
            database.group[groupId] = { groupName, member: [userId] }
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
