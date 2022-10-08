const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    entry: {
        main: './src/script/main.ts',
        'content-script': './src/script/content-script.ts',
        background: './src/script/background.ts',
        popup: './src/script/popup.ts',
    },
    output: {
        publicPath: '',
        path: path.join(__dirname, 'extension/script'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: '../style',
                            name: '[name].min.css',
                        },
                    },
                    'sass-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts'],
    },
    plugins: [
        new RemovePlugin({
            before: {
                include: ['./extension/script', './extension/style'],
            },
        }),
    ],
};
