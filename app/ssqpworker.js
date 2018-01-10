importScripts('./ssqp/ssqp-box.js')

const server = new ssqpBox(this)


onmessage = function worker(e) {
    if (e.data.type === 'send') {
        const { ipPort, cmd, descriptor, data } = e.data
        console.log('11111111111111111111111111')
        console.log(descriptor.length)
        console.log(Buffer.from(JSON.stringify(descriptor)))
        let p = ipPort
        if (!(p[0] instanceof Array)) p = Array(p)
        console.log(p)
        p.forEach(ippor => server.sendPacket(ippor[0], ippor[1], cmd, descriptor, data))
    }
}
