const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
require('dotenv').config(); // Load environment variables from .env file

const mode = process.env.npm_lifecycle_script;
const isDev = true;
const filename = isDev ? "[name]" : "[name].[chunkhash]";
const statsFilename = 'webpack-stats.json';

let conf = {
  context: __dirname,
  entry: {
      App: ['./src/index.tsx'],
  },
  output: {
    path: path.resolve('./assets/webpack_bundles/'),
    filename: filename + ".js",
    publicPath: isDev ? `http://${process.env.DEV_SERVER_HOST}:${process.env.DEV_SERVER_PORT}/static/` : '/static/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader", // Creates `style` nodes from JS strings
          "css-loader",   // Translates CSS into CommonJS
          "sass-loader",  // Compiles Sass to CSS
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
        new CleanWebpackPlugin(),
        new BundleTracker({ filename: statsFilename }),
        new MiniCssExtractPlugin({
            filename: filename + '.css',
            chunkFilename: filename + '.css',
        }),
    ],
  resolve: {
    modules: ['node_modules'],
    extensions: [".ts", ".tsx", ".js", ".css", ".scss", ".svg"]
  },
}

if (isDev) {
    conf['devServer'] = {
        port: process.env.DEV_SERVER_PORT,
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        compress: true,
        allowedHosts: 'all',
    }
    conf['plugins'].push(
        new ReactRefreshWebpackPlugin({ overlay: false })
    )
}

module.exports = conf;
