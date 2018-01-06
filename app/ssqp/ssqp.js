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
        }).listen(port, () => console.log(`server is listening on ${this.server.address().address}:${this.server.address().port}:${this.server.address().family}`))
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
            socket.write(packet.makePacket(cmd, descriptor, dataLength))
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
                        newSocket.connect(desport, 'localhost', () => resolve())
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
                    while (this.isReadingHeader && (this.data.length > 0) && (this.packetHeader.length < 4)) {
                        let packetHeader = this.data.slice(0, 4)
                        this.packetHeader = packetHeader
                        this.data = this.data.slice(4, this.data.length)
                        this.cmd = packet.extractField(packetHeader, 'command')
                        this.descriptorLength = packet.extractField(packetHeader, 'descriptorLength')
                        this.dataLength = packet.extractField(packetHeader, 'dataLength')
                        this.isReadingHeader = false
                    }
                    while((this.data.length > 0) && (this.readedDescriptor.length < this.descriptorLength)) {
                        let neededLength = this.descriptorLength - this.readedDescriptor.length
                        this.readedDescriptor = Buffer.concat([this.readedDescriptor, this.data.slice(0, neededLength)])
                        this.data = this.data.slice(neededLength, this.data.length)
                    }
                    while((this.data.length > 0) && (this.readedData.length < this.dataLength)){
                        let neededLength = this.dataLength - this.readedData.length
                        this.readedData = Buffer.concat([this.readedData, this.data.slice(0, neededLength)])
                        this.data = this.data.slice(neededLength, this.data.length)   
                    }


                    if ((this.readedDescriptor.length === this.descriptorLength) && (this.readedData.length === this.dataLength)) {
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