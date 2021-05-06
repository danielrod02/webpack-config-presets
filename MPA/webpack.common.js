'use strict';

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Utils
const path = require('path');
const fs = require('fs');

const { merge } = require('webpack-merge');

// Discover if running in NODE_ENV=PROD or NODE_END=ENV
const MODE = process.env['NODE_ENV'] || 'ENV';

const context = path.resolve(__dirname, 'src/pages');
const entries = discoverEntries(context);

const commonConfig = {
    // The base directory, an absolute path, for resolving entry points and loaders from configuration
    context,
    entry: entries,
    output: {
        // filename: '[name].bundle.js',
        filename: (chunkData) => {
            if ( chunkData.chunk.name === 'index' ) {
                return 'index.bundle.js';
            } else {
                return filenameOf(chunkData.chunk.name);
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
                        options: {
                          hmr: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader',
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
                        options: {
                          hmr: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                    },
                ]
            }
        ]
    },
    plugins: [
        ...pages(entries).map((page) => new HtmlWebpackPlugin(page)),
        /* new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: 'index.html',
            chunks: ['index']
        }), */
        /* new HtmlWebpackPlugin({
            template: 'src/about/index.html',
            filename: 'about/index.html',
            chunks: ['about']
        }),
        new HtmlWebpackPlugin({
            template: 'src/temp/index.html',
            filename: 'temp/index.html',
            chunks: ['temp']
        }),
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: '[name].css',
        }),
        // new ESLintPlugin({
        // }), */
    ],
    target: 'web'
};

let config = {};

switch (MODE) {
    case 'DEV':
        config = merge(commonConfig, require('./webpack.dev.js'));
        break;
    case 'PROD':
        config = merge(commonConfig, require('./webpack.prod.js'));
        break;
}

module.exports = config;

/*
$$\   $$\ $$$$$$$$\ $$$$$$\ $$\       $$$$$$\  
$$ |  $$ |\__$$  __|\_$$  _|$$ |     $$  __$$\ 
$$ |  $$ |   $$ |     $$ |  $$ |     $$ /  \__|
$$ |  $$ |   $$ |     $$ |  $$ |     \$$$$$$\  
$$ |  $$ |   $$ |     $$ |  $$ |      \____$$\ 
$$ |  $$ |   $$ |     $$ |  $$ |     $$\   $$ |
\$$$$$$  |   $$ |   $$$$$$\ $$$$$$$$\\$$$$$$  |
 \______/    \__|   \______|\________|\______/ 
*/

/**
 * Polyfill of `String.prototype.replaceAll`
 * @param {string} subStr 
 * @param {string} replace 
 */
String.prototype.replaceAll = function(subStr, replace) {
    let result = this;
    while (result.includes(subStr)) {
        result = result.replace(subStr, replace);
    }
    return result;
};

/**
 * A string representing the basename of a file or directory.
 * @typedef {string} TreeEntryName
 */

/**
 * @typedef FsTreeEntry
 * @property {string} absPath
 * @property {("file"|"dir")} type
 */

/**
 * @typedef File
 * @extends FsTreeEntry
 * @property {"file"} type
 */

/**
 * @typedef Dir
 * @extends FsTreeEntry
 * @property {"dir"} type
 * @property {FsTree} children
 */

/**
 * @typedef {Object.<TreeEntryName, (File|Dir)>} FsTree
 * @alias SubTree
 */

/**
 * @typedef {string} RelativePathToEntry
 */

/**
 * @typedef {Object.<EntryName, RelativePathToEntry>} Entries
 */

/**
 * @param {string} pathtToDir
 * @returns FsTree
 */
function getTree(pathToDir) {
    const normalizedPath = path.normalize(pathToDir);
    const dirContents = fs.readdirSync(normalizedPath);
    
    if (dirContents.length !== 0) {
        return dirContents.reduce((acum, current, index) => {
            const absPath = path.resolve(normalizedPath, current);
            const stats = fs.lstatSync( absPath );
            const item = { absPath };

            item.type = stats.isDirectory() ? 'dir' : 'file';
            if (item.type === 'dir') {
                item.children = getTree(absPath);
            }

            return {
                ...acum,
                [current]: item,
            };
        }, {});
    } else {
        return {};
    }
}

/**
 * Returns the name (and only the name, not the path to the dir) of the file at {@link pathTo}
 * @param {string} pathTo 
 */
function getParentDirName(pathTo) {
    return path.basename(path.dirname(pathTo));
}

/**
 * 
 * @param {string} path 
 * @returns Entries
 */
function discoverEntries(pathToDir) {
    const normalizedPath = path.normalize(pathToDir);
    const entries = {};
    const dirTree = getTree(normalizedPath);

    // Recursively traverse the `dirTree` object and add properties to `entries`
    (function flatten(obj) {
        for (let [name, info] of Object.entries(obj)) {
            if ( info.type === 'file' && 
                normalizedPath === path.dirname(info.absPath) &&
                name === 'index.js'
            ) {
                entries[name.replace('.js', '')] = info.absPath.replace(normalizedPath, `.`);
                continue;
            }

            if ( info.type === 'file' && 
                path.basename(info.absPath).replace('.js', '') === getParentDirName(info.absPath)
            ) {
                entries[name.replace('.js', '')] = info.absPath.replace(normalizedPath, `.`);
                continue;
            } else if (info.type === 'dir' && info.children !== {}) {
                flatten(info.children);
            }
        }
    })(dirTree);

    return entries;
}

/**
 * 
 * @param {Entries} entries - The {@link Entries} to be parsed.
 * @param {string} [contextPath]
 * @returns {{
 *  template: string,
 *  filename: string,
 *  chunks: string[]
 * }}
 */
function pages(entries, contextPath = path.resolve(__dirname, 'src/pages')) {
    const entriesArr = Object.entries(entries);

    return entriesArr.map( ([entryName, entryPath], index) => {
        const parentDir = getParentDirName(entryPath);
        let template, filename;
        const chunks = [entryName/* , 'react', 'react-dom' */];

        template = (
            fs.existsSync(path.resolve(parentDir, `${entryName}.html`)) ? 
            path.resolve(parentDir, `${entryName}.html`) :
            path.resolve(contextPath, `index.html`)
        );

        const url = urlTo(entries);
        if (url === '') {
            filename = `index.html`;
        } else {
            filename = `${url}/index.html`;
        }

        return ({
            template,
            filename,
            chunks,
        });
    } );
}

/**
 * Helper to throw error functionally. Useful when using boolean operators to 
 * provide fallback behavior, likewise:
 *  someValueMaybeUndefined || throwError('The value is not defined');
 * @param {string} mssg 
 */
function throwError(mssg = 'ERROR') {
    throw Error(mssg);
}

/**
 * 
 * @param {string} entryName 
 * @param {Entries} fromEntries 
 */
function urlTo(
    entryName, 
    fromEntries = entries || throwError('No `entries` parameter was passed')
    ) {
        const dirOfEntry = path.dirname(entries[entryName]);
        let result = dirOfEntry.replaceAll(path.sep, '/').replace('.', '');

        if (result[0] === '/') {
            result = result.slice(1);
        }

        return result;
}

/**
 * 
 * @param {string} entryName 
 * @param {Entries} fromEntries
 */
function filenameOf(
    entryName,
    fromEntries = entries || throwError('No `entries` parameter was passed')
    ) {
        const urlToEntry = urlTo(entryName);
        let result = '';

        if (urlToEntry === '') {
            result = `${entryName}-[contenthash].bundle.js`
        } else {
            result = `${urlToEntry}/${entryName}-[contenthash].bundle.js`
        }

        return result;
}