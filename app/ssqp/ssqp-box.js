const uuid = require('uuid/v4')
const ssqp = require('./ssqp/ssqp')
const utils = require('./ssqp/utils')
const router = require('./ssqp/router')

class ssqpBox {
    constructor(context) {
        this.ssqp = new ssqp(3003)
        this.callbackList = {}
        this.ssqp.on('receivePacket', this.packetHandler.bind(this))
        this.context = context
    }
    async packetHandler(cmd, socket, descriptor, data) {
        if (cmd !== utils.CMD_RESPONSE) {
                console.log('receive request!!! the descriptor is:')
                console.log(descriptor)
                const desc = {
                    id: descriptor.id,
                    code: 200,
                    messsage: 'get!!'
                }
                this.ssqp.send(socket, null, null, utils.CMD_RESPONSE, desc)
        }
        console.log(`received data(stringfied): \n ${data}`)
        console.log('data(raw): ')
        console.log(data)
        this.context.postMessage({
            type: 'get',
            cmd,
            descriptor,
            data
        })
    }

    sendPacket(ip, port, cmd, descriptor, data) {
        console.log('sending packet!!!')
        console.log(ip, port, cmd, descriptor, data)
        this.ssqp.send(null, ip, port, cmd, descriptor, data)
    }

}


module.exports = ssqpBox
