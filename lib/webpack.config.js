const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: {
    index: './src/js/index.js',
  },
  devServer: {
    publicPath: path.join(appDirectory, 'src'),
    contentBase: path.join(appDirectory, 'src'),
    watchContentBase: true,
    compress: true,
    port: 9000,
    hot: true,
    host: 'dev.jd.com',
    disableHostCheck: true,
  },
};