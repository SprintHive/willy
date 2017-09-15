const util = require('util');
const {exec} = require('child_process');
const execp = util.promisify(exec);
const chalk = require('chalk');

const debugEnabled = false;

function repaceNewLine(str) {
  return str.replace(/\r?\n|\r/g, "");
}

async function execCmdNoNewLines(cmd) {
  debugEnabled && console.log(chalk.blue(`executing ${cmd}`))
  const { stdout, stderr } = await execp(cmd);
  if (stderr) {
    console.error(`Oops something went wrong '${cmd}'`, stderr)
  }

  return {out: repaceNewLine(stdout), err: stderr}
}

async function execCmdWithNewLines(cmd) {
  const { stdout, stderr } = await execp(cmd);
  if (stderr) {
    console.error(`Oops something went wrong '${cmd}'`, stderr)
  }

  return {out: stdout, err: stderr}
}

module.exports = {exec, chalk, execp, execCmdNoNewLines, execCmdWithNewLines, repaceNewLine};