module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'visualization.js',
        path: __dirname
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
};
