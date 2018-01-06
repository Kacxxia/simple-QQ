const path = require('path')
const config = {
    target: 'electron-renderer',
    context: __dirname,
    entry: './app/add.js',
    output: {
        path: path.resolve(__dirname, 'app'),
        filename: 'addBundle.js',
    },
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /jsx?$/,
            loader: 'babel-loader',
            options: {
                presets: ['env', 'react']
            }
        }]
    },
    devtool: 'inline-source-map'
}

module.exports = config
