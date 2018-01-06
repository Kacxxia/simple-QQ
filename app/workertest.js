importScripts('ssqp-box.js')

const ssqp = new ssqpBox()

this.ssqpfetch = ssqpfetch

export function ssqpfetch(payload, resolve, reject) {
    const { ipport, cmd, descriptor, data } = payload
    ssqp.sendPacket(ipport[0], ipport[1], cmd, descriptor, data)
    .then(resolve)
    .catch(reject)
}

export function test(resolve, reject) {
    setTimeout(() => resolve(), 3000)
}
