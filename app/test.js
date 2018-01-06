const path = require('path')
const regexp = /\w+\.\w+$/
const str = ["C:\Users\kacxx\Desktop\broadcast.png"]

console.log(regexp.exec(str[0]))