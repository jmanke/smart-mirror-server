const { spawn } = require('child_process');

console.log('executing...');

const ls = spawn('forever', [`${__dirname}/server.js`]);

ls.stdout.on('data', (data) => {
  console.log(data.toString());
});

console.log('done');
