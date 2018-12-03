module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'visualization.js',
        path: __dirname,
    },
    module: {
        rules: [
            {
                test: /(\.js|\.jsx)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    "presets": ["@babel/react"],
                    "plugins": [
                        ["@babel/plugin-proposal-class-properties", { "loose": true }]
                    ]
                }
            }
        ]
    }
};
