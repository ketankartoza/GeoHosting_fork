const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
require('dotenv').config(); // Load environment variables from .env file

const mode = process.env.npm_lifecycle_script;
const isDev = mode.includes('development');
const filename = isDev ? "[name]" : "[name].[chunkhash]";
const statsFilename = 'webpack-stats.json';
const output = isDev ? './assets/webpack_bundles_dev/' : './assets/webpack_bundles/';

let conf = {
  context: __dirname,
  entry: {
      App: ['./src/index.tsx'],
  },
  output: {
    path: path.resolve(output),
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
optimization: {
    splitChunks: {
      chunks: 'all', // Apply splitting to both initial and dynamic chunks
      maxInitialRequests: Infinity, // Allow as many parallel requests as possible
      minSize: 20000, // Minimum size for a chunk to be generated
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name of the npm package being bundled
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
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
