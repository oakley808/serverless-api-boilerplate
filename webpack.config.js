const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
require('babel-polyfill');

// Add babel-polyfill to each entry point

const getEntrypoints = () => {
  const { entries } = slsw.lib;

  /* eslint-disable */
  for (const prop in entries) {
    entries[prop] = ['babel-polyfill', entries[prop]];
  }
  /* eslint-enable */

  return entries;
};

module.exports = {
  entry: getEntrypoints(),
  target: 'node',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals(), 'aws-sdk'],
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'app'),
      'node_modules',
    ],
    extensions: ['.js'],
    mainFields: [
      'module',
      'main',
    ],
  },
};
