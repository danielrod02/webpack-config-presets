'use strict';

const path = require('path');
const fs = require('fs');

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
                entries[name.replace('.js', '')] = info.absPath;//.replace(normalizedPath, `.`); webpack doesnt recognize relative 
                                                                // paths that use windows-style path separator
                continue;
            }

            if ( info.type === 'file' && 
                path.basename(info.absPath).replace('.js', '') === getParentDirName(info.absPath)
            ) {
                entries[name.replace('.js', '')] = info.absPath;//.replace(normalizedPath, `.`); webpack doesnt recognize relative 
                                                                // paths that use windows-style path separator
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
 * }[]}
 */
function pages(entries, contextPath = path.resolve(__dirname, 'src/pages')) {
    const entriesArr = Object.entries(entries);

    return entriesArr.map( ([entryName, entryPath], index) => {
        const parentDir = getParentDirName(entryPath);
        let template, filename;
        const chunks = [entryName, 'shared'];

        template = (
            fs.existsSync(path.resolve(parentDir, `${entryName}.html`)) ? 
            path.resolve(parentDir, `${entryName}.html`) :
            path.resolve(contextPath, `index.html`)
        );

        const url = urlTo(entryName, entries, contextPath);
        // console.log(`url of entry ${entryName}: ${url}`);
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
 
function throwError(mssg = 'ERROR') {
    throw Error(mssg);
}*/

/**
 * 
 * @param {string} entryName 
 * @param {Entries} fromEntries 
 */
function urlTo(
    entryName, 
    fromEntries,
    contextDir
    ) {
        // console.log(`\n----------------from urlTo: ${entryName}----------------\n`);
        let dirOfEntry; 

        if (fromEntries[entryName]) {
            dirOfEntry = path.dirname(fromEntries[entryName]);
            let result = dirOfEntry
                .replace(contextDir, '')
                .replaceAll(path.sep, '/')
                .replace('.', '');
    
            if (result[0] === '/') {
                result = result.slice(1);
            }
    
            return result;
        }

        return entryName;
}

/**
 * 
 * @param {string} entryName 
 * @param {Entries} fromEntries
 */
function filenameOf(
    entryName,
    fromEntries,
    contextDir
    ) {
        const urlToEntry = urlTo(entryName, fromEntries, contextDir);
        let result = '';

        if (urlToEntry === '') {
            result = `${entryName}-[contenthash].bundle.js`
        } else {
            result = `${urlToEntry}/${entryName}-[contenthash].bundle.js`
        }

        return result;
}

function entryDescriptor(entries) {
    const newEntries = {};

    for (let [entryName, entryPath] of Object.entries(entries)) {
        newEntries[entryName] = {
            import: entryPath,
            dependOn: 'shared',
        };
    }

    return newEntries;
}

module.exports = {
    discoverEntries,
    pages,
    filenameOf,
    entryDescriptor
};