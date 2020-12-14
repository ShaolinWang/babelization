'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const HTML = require('html-parse-stringify2');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const appSource = path.join(appDirectory, 'src');
const appPack = path.join(appDirectory, 'dist');

fs.ensureDirSync(appPack);          

// TODO: zip files
try {
  fs.copySync(appSource, appPack);
  chalk.cyan(
    `${chalk.yellow(
      chalk.bold('babelization build success!!!')
    )}`
  )
} catch (error) {
  console.error(`${chalk.red(error)}`)
};


// dist html:
const htmlPath = path.join(appPack, 'index.html');
fs.ensureFileSync(htmlPath);
const html = fs.readFileSync(htmlPath).toString();

const ast = HTML.parse(html);

const excludeTag = ['meta'];
const excludeScript = ['https://storage.360buyimg.com/babel/00299045/631260/production/dev/zepto.js?t=20181207185856'];

const filteredAst = ast.filter((node) => {
  if(node.type === 'text') return false;
  if(excludeTag.includes(node.name)) return false;
  if(node.name === 'script' && excludeScript.includes(node.attrs.src)) {
    return false;
  }
  return true;
})

const filteredHtml = HTML.stringify(filteredAst);
console.log(htmlPath);
try {
  fs.writeFileSync(htmlPath, filteredHtml);
} catch (error) {
  console.error(error);
}