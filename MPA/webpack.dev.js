'use strict';


module.exports = {
    mode: 'development',
    // The base directory, an absolute path, for resolving entry points and loaders from configuration
    // plugins: [
    //     // new ESLintPlugin({
    //     // }), */
    // ],
    devtool: 'eval-source-map',
    devServer: {
        contentBase: './dist',
        compress: true,
        host: '0.0.0.0',
        port: 8080,
    },
}