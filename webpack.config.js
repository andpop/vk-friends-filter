const path = require('path');

const PATHS = {
        source: path.join(__dirname, './scripts/'),
        build: path.join(__dirname, './scripts/')
};

module.exports = {
    entry: PATHS.source + 'entry.js',
    output: {
        path: PATHS.build,
        filename: '_build.js'
    }
}