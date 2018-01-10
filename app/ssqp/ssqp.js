const EventEmitter = require('events')
const net =require('net')
const utils = require('./utils')
const packet = require('./packet')
class ssqp extends EventEmitter {
    constructor(port) {
        super()
        this.availableSocketList = {}
        this.server = net.createServer((socket) => {
            this.socketInitialize(socket)
            this.listHandler(socket)
        }).listen(port, '127.0.0.2', () => console.log(`server is listening on ${this.server.address().address}:${this.server.address().port}:${this.server.address().family}`))
    }

    async send(socket, ip, port, cmd, descriptor, data) {
        try {
            socket = socket ? socket : await this.listHandler(null, ip, port)
            let dataLength
            if (data) {
                dataLength = data.length
            } else {
                data = Buffer.alloc(0)
                dataLength = 0
            }
            const p = packet.makePacket(cmd, descriptor, dataLength)
            console.log('22222222222222222222222')
            console.log(descriptor)
            console.log(Buffer.from(JSON.stringify(descriptor)).length)
            console.log(packet.extractField(p.slice(0, 8), 'descriptorLength'))
            socket.write(p)
            socket.isFree = socket.write(data)
            return [socket.localAddress, socket.localPort]
        } catch(e) {
            console.log(e)
        }
    }

    async listHandler(socket, desip, desport) {
        try {
            let list = this.availableSocketList
            if (socket) {
                const remote = '' + socket.remoteAddress + socket.remotePort
                const local = '' + socket.localAddress + socket.localPort
                list[remote] = Object.assign({}, list[remote], { [local]: socket })
            } else {
                let remote = '' + desip + desport
                for (let local in list[remote]) {
                    if(list[remote][local].isFree) return list[remote][local]
                }
                let newSocket = new net.Socket()
                await new Promise(resolve => {
                        newSocket.connect({
                            port: desport, 
                            host: desip,
                            localAddress: '127.0.0.2'
                        }, () => resolve())
                    }
                )
                console.log(`new socket is connecting ${desip}:${desport} on local ${newSocket.localAddress}:${newSocket.localPort}`)
                this.socketInitialize(newSocket)
                return newSocket
            }
        } catch (e) {
            console.error(e)
        }
    }
    socketInitialize(socket) {
        let that = this
        socket.isReadingHeader = true 
        socket.readedDescriptor = Buffer.alloc(0)
        socket.readedData = Buffer.alloc(0)
        socket.packetHeader = Buffer.alloc(0)
        socket.isFree = true
        socket.on('data', function(data){
            try {
                this.data = data
                while(this.data.length > 0 ) {
                    while (this.isReadingHeader && (this.data.length > 0) ) {
                        const prevPackHeaderLen = this.packetHeader.length
                        let pac = this.data.slice(0, 8 - prevPackHeaderLen)
                        this.packetHeader = Buffer.concat([this.packetHeader, pac])
                        this.data = this.data.slice(8 - prevPackHeaderLen, this.data.length)
                        if (this.packetHeader.length === 8) {
                            this.cmd = packet.extractField(this.packetHeader, 'command')
                            this.descriptorLength = packet.extractField(this.packetHeader, 'descriptorLength')
                            this.dataLength = packet.extractField(this.packetHeader, 'dataLength')
                            this.isReadingHeader = false
                        }
                    }
                    while((this.data.length > 0) && (this.readedDescriptor.length < this.descriptorLength)) {   
                        let neededLength = this.descriptorLength - this.readedDescriptor.length
                        console.log(`need length: ${neededLength}`)
                        this.readedDescriptor = Buffer.concat([this.readedDescriptor, this.data.slice(0, neededLength)])
                        this.data = this.data.slice(neededLength, this.data.length)
                    }
                    while((this.data.length > 0) && (this.readedData.length < this.dataLength)){
                        let neededLength = this.dataLength - this.readedData.length
                        this.readedData = Buffer.concat([this.readedData, this.data.slice(0, neededLength)])
                        this.data = this.data.slice(neededLength, this.data.length)   
                    }


                    if ((this.readedDescriptor.length === this.descriptorLength) && (this.readedData.length === this.dataLength)) {
                        console.log('ttt')
                        console.log(JSON.parse(this.readedDescriptor.toString()))
                        that.emit('receivePacket', this.cmd, this, JSON.parse(this.readedDescriptor.toString()), this.readedData)
                        this.isReadingHeader = true 
                        this.readedData = Buffer.alloc(0)
                        this.readedDescriptor = Buffer.alloc(0)
                        this.packetHeader = Buffer.alloc(0)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on('end', function() {console.log(`FIN on socket ${this.localAddress}:${this.localPort} -> ${this.remoteAddress}:${this.remotePort}`)})
        socket.on('drain', function() { this.isFree = true})
        socket.on('error', function(err) {console.log(`error on socket ${this.localAddress}:${this.localPort} -> ${this.remoteAddress}:${this.remotePort}`, err)})
        console.log(`socket initialize completed`)
    }
}

module.exports = ssqp