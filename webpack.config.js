var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var dist = path.join(__dirname, 'dist');
var debug = process.env.NODE_ENV === "development";
var assets = debug ? "" : "/assets/";

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.join(dist, assets),
    filename: "[name].[hash].js",
    publicPath: assets,
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(dist, "assets"),
    historyApiFallback: true,
    inline: true,
    compress: true,
    port: 4003,
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        include: path.join(__dirname, "src"),
      },
      {
        test: /\.(htm|html)$/i,
        loader: 'html-withimg-loader'
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        loader: 'file-loader?name=images/[name].[hash:8].[ext]'
      },
      {
        test: /\.ico$/,
        loader: 'file-loader?name=../[name].[ext]'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new HtmlWebpackPlugin({
      filename: path.join(dist, 'index.html'),
      template: path.join(__dirname, '/src/index.html')
    })
  ],
  resolve: {
  }
}
