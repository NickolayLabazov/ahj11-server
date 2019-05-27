const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
// const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [

      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
        ],
      },

      {
        test: /\.(png|jpg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '/img/[name].[ext]',
            },
          },
        ],
      },
    ],
  },

  devServer: {
    overlay: true,
    contentBase: './src',
  },

  entry: {
    app: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },

  plugins: [

    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/index.html',
      filename: 'index.html',
    }),

    /* new CopyPlugin([
    { from: 'src/img', to: 'img' },
  ]), */

    new MiniCssExtractPlugin({
      filename: '/css/style.css',
      chunkFilename: '[id].css',
    }),
  ],
};
