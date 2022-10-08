const base = require('./webpack.config.base');

module.exports = {
    devtool: 'source-map',
    watch: true,
    mode: 'development',
    ...base,
};
