const uuid = require('uuid/v4')
const ssqp = require('./ssqp')
const utils = require('./utils')
const router = require('./router')

class ssqpBox {
    constructor(port) {
        this.ssqp = new ssqp(port)
        this.ssqp.on('receivePacket', this.packetHandler.bind(this))
    }
    // example
    requestHandler(cmd, desIpPort, descriptor, data) {
        switch (cmd) {
            case utils.CMD_REGIST:
                return router.handleRequestRegist(desIpPort, descriptor, data)
            case utils.CMD_LOGIN:
                return router.handleRequestLogin(desIpPort, descriptor, this)
            case utils.CMD_GET:
                return router.handleRequestGet(desIpPort, descriptor, data)
            case utils.CMD_PING:
                return router.handleRequestPing(desIpPort, descriptor, this)
            case utils.CMD_FRIEND:
                return router.handleRequestFriend(desIpPort, descriptor, this)
            case utils.CMD_GROUP:
                return router.handleRequestGroup(desIpPort, descriptor, this)
            default:
                return {
                    code: 501,
                    message: 'Bad Request'
                }
        }
    }
    async packetHandler(cmd, socket, descriptor, data) {
        if (cmd !== utils.CMD_RESPONSE) {
                const result = await (
                    this.requestHandler(
                        cmd, [socket.remoteAddress, socket.remotePort], descriptor, data
                    )
                )
                const desc = {
                    id: descriptor.id,
                    code: result.code,
                    message: result.message
                }
                // response to sender
                const resdata = result.payload ? Buffer.from(JSON.stringify(result.payload)) : undefined
                this.ssqp.send(socket, null, null, utils.CMD_RESPONSE, desc, resdata)
        }

    }
    sendPacket(ip, port, cmd, descriptor) {
        // used for router
        let data
        if (descriptor) {
            data = descriptor.payload
            delete descriptor.payload    
        }
        this.ssqp.send(null, ip, port, cmd, descriptor, data)
    }

}


module.exports = ssqpBox
