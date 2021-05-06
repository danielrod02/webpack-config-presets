'use strict';

const path = require('path');
const fs = require('fs');

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
        const chunks = [entryName, 'react', 'react-dom'];

        template = (
            fs.existsSync(path.resolve(parentDir, `${entryName}.html`)) ? 
            path.resolve(parentDir, `${entryName}.html`) :
            path.resolve(contextPath, `index.html`)
        );

        return ({
            template,
            filename,
            chunks
        });
    } );
}

function throwError(mssg) {
    throw Error(mssg);
}

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

String.prototype.replaceAll = function(subStr, replace) {
    let result = this;
    while (result.includes(subStr)) {
        result = result.replace(subStr, replace);
    }
    return result;
};

// console.log(('C:\\Users\\OSCAR\\repo\\webpack-config\\src').replaceAll(path.sep, '/'));

const entries = discoverEntries('C:\\Users\\OSCAR\\repo\\webpack-config\\src');

console.log(JSON.stringify(entries, null, 2));
// console.log(path.resolve(__dirname, 'src/pages'));
console.log( Object.entries(entries).map( ([entryName, entryPath]) => {
    return [urlTo(entryName), filenameOf(entryName)];
}));