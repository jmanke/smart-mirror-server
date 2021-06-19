const forever = require('forever');
const { exec } = require('child_process');

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function execCommand(command, cb) {
  var child = exec(command, function (err, stdout, stderr) {
    if (err != null) {
      return cb(new Error(err), null);
    } else if (typeof stderr != 'string') {
      return cb(new Error(stderr), null);
    } else {
      return cb(null, stdout);
    }
  });
}

function startServer() {
  return forever.start('./server.js', { uid: 'server.js' });
}

async function pullFromGit() {
  return new Promise((resolve, reject) => {
    execCommand('git pull', (err, out) => {
      if (err) {
        reject();
      }

      console.log(out);
      resolve();
    });
  });
}

async function autoUpdater() {
  await new Promise((resolve, reject) => {
    execCommand('git fetch && git show-ref --head', (err, out) => {
      console.log('check');
      if (err) {
        reject();
        return;
      }

      const heads = out
        .split('\n')
        .filter((h) => h.length)
        .map((h) => h.split(' ').reverse())
        .filter((h) => h.length === 2);

      const headMap = new Map();
      heads.forEach((h) => headMap.set(h[0], h[1]));

      const currHead = headMap.get('HEAD');
      const remoteHead = headMap.get('refs/remotes/origin/master');

      if (!currHead || !remoteHead) {
        return;
      }

      if (currHead !== remoteHead) {
        console.log('update detected...');
        // stop server, pull, restart server
        monitor.stop();
        monitor.on('exit', async () => {
          console.log('stopped server');

          let gitPullSuccess = false;

          while (!gitPullSuccess) {
            try {
              await pullFromGit();
              gitPullSuccess = true;
              console.log('pulled from git successfully');
            } catch (e) {
              console.log('failed to pull, retrying in 1 second');
              await wait(1000);
            }
          }

          monitor = startServer();
          monitor.on('start', () => {
            console.log('restarted server');
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  });

  setTimeout(() => {
    try {
      autoUpdater();
    } catch (e) {
      console.log('something went wrong');
      console.log(e.stackTrace);
    }
  }, 1000 * 10);
}

let monitor = startServer();
monitor.on('start', () => {
  autoUpdater();
  exec(
    'unclutter -idle 0.1 & firefox -kiosk https://smart-mirror-web.herokuapp.com/'
  );
});
