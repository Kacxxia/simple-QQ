const utils = require('./app/ssqp/utils')

const packet = {
    version: 0, // 2bit
    reserved: 0, // 2bit
    command: 0, // 4bit
    descriptorLength: 0, //12bit
    dataLength: 0, //12bit
    descriptor: ''
}

function makePacket (descriptor, dataLength) {
    descriptor = Buffer.from(JSON.stringify(descriptor))
    const headerBuffer = Buffer.alloc(8)

    headerBuffer.writeUInt32BE((0<< 30) + (0 << 28) + (4 << 24) + descriptor.length, 0)
    headerBuffer.writeUInt32BE(dataLength, 4)
    console.log(descriptor.length)
    return headerBuffer
}
const foo = Math.pow(2, 12) - 1
for (let i=0; i <18000; i+=500) {
    const p = makePacket({
        name: 'foo',
        count: 'bar',
        id: 'cuuid',
        content: '6666'
    }, i)
    console.log(`datalength: ${i}, descriptorLength: ${extractField(p, 'descriptorLength')}`)
}


function extractField(packet, field) {
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