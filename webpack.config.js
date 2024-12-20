const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Load environment variables
const env = dotenv.config().parsed;
const envKeys = Object.keys(env || {}).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'  // This is important for client-side routing
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin(envKeys),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      meta: {
        'Content-Security-Policy': {
          // 'http-equiv': 'Content-Security-Policy',
          // 'content': "default-src 'self'; connect-src 'self' http://[fd07:b51a:cc66:0:a617:db5e:ab7:e9f1]:3001; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        }
      }
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    historyApiFallback: true,  // This is important for client-side routing
    hot: true,
    port: 3000,
    open: true,
    proxy: [
      {
        context: ['/api', '/operation', '/themes', '/files'],
        target: process.env.REACT_APP_API_URL,  // Using the REACT_APP_API_URL value
        changeOrigin: true
      }
    ]
  }
}; 