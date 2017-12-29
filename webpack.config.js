const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    inject: 'body'
});

module.exports = {
    entry: {
        app: './src/index.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: [/node_modules/],
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { modules: false },
                    }
                ],
            },
        ],
    },
    plugins: [
        HtmlWebpackPluginConfig,
        new webpack.NamedModulesPlugin(),
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            QINIU_UPTOKEN_URL: process.env.ENV === 'dev' ? '"http://localhost:8000/uptoken"' : '"http://qiniubackend.com:8080/uptoken"'
        })
    ],
    resolve: {
		extensions: ['.js', '.jsx']
	},
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
	devServer: {
		contentBase: './src/',
		hot: true
	}
};
