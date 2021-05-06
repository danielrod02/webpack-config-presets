'use strict';

const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');


module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        host: '0.0.0.0',
        port: 8080,
    },
    plugins: [
        new ESLintPlugin({
            threads: 6,
        }),
    ],
}