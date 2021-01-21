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
const { ZipFile } = require('yazl');

const { isFit } = require('../utils/helper');

const SOURCEDIR = 'src';
const TARGETDIR = 'dist';
const appDirectory = fs.realpathSync(process.cwd());
const appSource = path.join(appDirectory, SOURCEDIR);
const appPack = path.join(appDirectory, TARGETDIR);

fs.ensureDirSync(appPack);

// copy src目录到dist目录
tryWithDefault(() => {
  fs.copySync(appSource, appPack);
});

// html ->> ast ->> transformed html
const htmlPath = path.join(appPack, 'index.html');
fs.ensureFileSync(htmlPath);
const html = fs.readFileSync(htmlPath).toString();
const ast = HTML.parse(html);
const filteredAst = transform(ast);
const filteredHtml = HTML.stringify(filteredAst);

tryWithDefault(() => {
  fs.writeFileSync(htmlPath, filteredHtml);
  const paths = getAllFilesPathInDirectory(TARGETDIR)
    .map((p) => ({
      source: p,
      target: path.relative(TARGETDIR, p)
    }));
  zipFiles(paths);
});

/**
 * 默认打印异常的try catch语句
 * @param {Function} action 
 */
function tryWithDefault(action) {
  try {
    if (!isFit(action, 'Function')) {
      throw new Error(`${action}不是Funciton类型`)
    };
    action();
  } catch (error) {
    console.error(`${chalk.red(error)}`)
  }
};

/**
 * @description ast转换
 * @param {Object} ast HTML编译后的ast
 * @returns {Object} transformed ast
 */
function transform(ast) {
  const excludeTag = ['meta'];
  const excludeScript = ['https://storage.360buyimg.com/babel/00299045/631260/production/dev/zepto.js?t=20181207185856'];
  return ast.filter((node) => {
    if (node.type === 'text') return false;
    if (excludeTag.includes(node.name)) return false;
    if (node.name === 'script' && excludeScript.includes(node.attrs.src)) {
      return false;
    }
    return true;
  })
}

/**
 * @description 文件集合压缩为压缩文件
 * @param {Array<PathMap>} filesPathMap 所有文件的路径映射集合
 * @param {String} PathMap.source 文件原始路径
 * @param {String} PathMap.target 压缩包内的文件路径
 */
function zipFiles(filesPathMap) {
  const zipfile = new ZipFile();
  filesPathMap.forEach(({
    source,
    target
  }) => {
    zipfile.addFile(source, target);
  })
  zipfile.outputStream.pipe(fs.createWriteStream("output.zip")).on("close", function () {
    chalk.cyan(
      `${chalk.yellow(
        chalk.bold('babelization build success!!!')
      )}`
    )
  });
  zipfile.end();
}

/**
 * @description 递归目录返回目录下文件的文件路径
 * @param {String} fileDirectory 目录
 * @param {Array<String>} [filesPath = []] 已有文件路径合集
 * @returns {Array<String>} 文件路径合集
 */
function getAllFilesPathInDirectory(fileDirectory, filesPath = []) {
  fs.readdirSync(fileDirectory).forEach((name) => {
    const filePath = path.join(fileDirectory, name);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFilesPathInDirectory(filePath, filesPath);
    }
    if (fs.statSync(filePath).isFile()) {
      filesPath.push(filePath);
    }
  });
  return filesPath;
}