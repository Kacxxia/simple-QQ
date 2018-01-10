const utils = require('./utils')

const packet = {
    version: 0, // 2bit
    reserved: 0, // 2bit
    command: 0, // 4bit
    descriptorLength: 0, //12bit
    dataLength: 0, //12bit
    descriptor: ''
}


exports.makePacket = function (cmd, descriptor, dataLength) {
    descriptor = Buffer.from(JSON.stringify(descriptor))
    console.log(`descriptor in make packet: ${descriptor}`)
    const headerBuffer = Buffer.alloc(8)

    headerBuffer.writeUInt32BE((packet.version << 30) + (packet.reserved << 28) + (cmd << 24) + descriptor.length, 0)
    headerBuffer.writeUInt32BE(dataLength, 4)

    return Buffer.concat([headerBuffer, descriptor])
}

const foo = Math.pow(2, 24) - 1

exports.extractField = function(packet, field) {
    switch (field) {
        case 'version':
            return packet.readUInt8(0) >> 6
        case 'reserved':
            return (packet.readUInt8(0) & 48) >> 4
        case 'command':
            return packet.readUInt8(0) & 15
        case 'descriptorLength':
            return packet.readUInt32BE(0) & foo
        case 'dataLength':
            return packet.readUInt32BE(4)
        default:
            throw new Error('字段错误')
    }
}
