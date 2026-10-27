const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
	context: path.resolve(__dirname, '..'), // Set context to root
	entry: './src/main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, '../dist'),
		clean: true, // Clean dist folder on build
	},
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	devtool:
		process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
	devServer: {
		static: '../dist',
		server: 'http',
		host: 'localhost',
		port: 8080,
		hot: true,
		open: false,
		watchFiles: [path.resolve(__dirname, '../index.html')],
		proxy: [
			{
				context: ['/api'],
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		],
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: 'asset/source',
			},
			{
				test: /\.css$/i,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								config: path.resolve(__dirname, 'postcss.config.js'),
							},
						},
					},
				], // Import CSS in JS with PostCSS
				include: path.resolve(__dirname, '../src'),
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
				include: /node_modules/,
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/images/[name][ext]',
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name][ext]',
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../index.html'),
			filename: 'index.html',
		}),
		new CopyWebpackPlugin({
			patterns: [{ from: 'src/assets', to: 'assets', noErrorOnMissing: true }],
		}),
		new Dotenv({
			path: path.resolve(__dirname, '../.env'),
		}),
	],
};
