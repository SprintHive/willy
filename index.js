#!/usr/bin/env node --harmony

const willy = require('vorpal')();

const utils = require('./utils.js');
const {chalk} = utils;

process.on('exit', () => console.log(chalk.whiteBright('Goodbye and have a nice day')));

require('./module/clusters')({willy, utils});
require('./module/pods')({willy, utils});
require('./module/rabbit')({willy, utils});

console.log(chalk.red(`
 __      __       .__  .__                                  __           __      __.__.__  .__
/  \\    /  \\ ____ |  | |  |   ____  ____   _____   ____   _/  |_ ____   /  \\    /  |__|  | |  | ___.__.
\\   \\/\\/   _/ __ \\|  | |  | _/ ___\\/  _ \\ /     \\_/ __ \\  \\   __/  _ \\  \\   \\/\\/   |  |  | |  |<   |  |
 \\        /\\  ___/|  |_|  |_\\  \\__(  <_> |  Y Y  \\  ___/   |  |(  <_> )  \\        /|  |  |_|  |_\\___  |
  \\__/\\  /  \\___  |____|____/\\___  \\____/|__|_|  /\\___  >  |__| \\____/    \\__/\\  / |__|____|____/ ____|
       \\/       \\/               \\/            \\/     \\/                       \\/               \\/
           
`));

willy
  .delimiter(chalk.cyanBright('willy$'))
  .show();

willy.exec('whichCluster');
