'use strict';

// Utils for entry discovery and misc
const {
    discoverEntries,
    pages,
    filenameOf,
    entryDescriptor
} = require('./webpack-utils.js');
const path = require('path');
const fs = require('fs');

/**
 * TODO:
 *  rewrite the function `filenameOf` to support entries of vendor modules
 */

// Plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { merge } = require('webpack-merge');

// Discover if running in NODE_ENV=PROD or NODE_END=ENV
const MODE = process.env['NODE_ENV'] || 'development';

const context = path.resolve(__dirname, 'src/pages');
const entries = discoverEntries(context);

const extendedEntries = {
    ...entryDescriptor(entries),
    shared: ['react', 'react-dom']
};

console.log(extendedEntries);

const htmlPages = pages(entries);

const commonConfig = {
    // The base directory, an absolute path, for resolving entry points and loaders from configuration
    context,
    entry: extendedEntries,
    output: {
        // filename: '[name].bundle.js',
        filename: (chunkData) => {
            if ( chunkData.chunk.name === 'index' ) {
                return 'index-[contenthash].bundle.js';
            } else {
                const chunkName = chunkData?.chunk?.name;
                return filenameOf(chunkName, entries, context);
            }
        },
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            { // JSX LOADER
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-react']
                        }
                    },
                ]
            },
            { // SCSS LOADERS
                test: /\.scss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-preset-env',
                                    // 'autoprefixer' is not needed, it is included with 'postcss-preset-env'
                                ]
                            }
                        }
                    },
                    {
                        loader: 'sass-loader', // Remember to specify "sass": "^1.26.10" on package.json before installing this loader
                    },
                ]
            },
            { // CSS LOADERS
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-preset-env',
                                    // 'autoprefixer' is not needed, it is included with 'postcss-preset-env'
                                ]
                            }
                        }
                    },
                ]
            }
        ]
    },
    plugins: [
        ...htmlPages.map((page) => new HtmlWebpackPlugin(page)),
        new MiniCssExtractPlugin({
            filename: '[name]-[contenthash].css'
        }),
        new CleanWebpackPlugin(),
    ],
};

let config = {};

switch (MODE) {
    case 'development':
        config = merge(commonConfig, require('./webpack.dev.js'));
        // console.log(JSON.stringify(config, null, 2));
        break;
    case 'production':
        config = merge(commonConfig, require('./webpack.prod.js'));
        break;
}

module.exports = config;