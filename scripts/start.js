'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../lib/webpack.config');

const HOST = webpackConfig.devServer.host || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}


const compiler = webpack(webpackConfig);
const devServerOptions = Object.assign({}, webpackConfig.devServer, {
  open: true,
});
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(webpackConfig.devServer.port, '127.0.0.1', () => {
  console.log(`Starting server on http://${HOST}:${webpackConfig.devServer.port}`);
});