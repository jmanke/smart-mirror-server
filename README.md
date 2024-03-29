# Dependencies

1. NodeJs
   a. curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   b. sudo apt-get update && sudo apt-get install yarn
   c. sudo npm install -g yarn
2. unclutter

sudo apt-get update && sudo apt-get install unclutter

# How To Use

1. yarn install
2. node server-manager.js
3. acquire https://newsapi.org/v2 api key. Create a .env file with `NEWS_API_KEY={key}`

# Auto Start With Raspberry Pi

1. update startup.sh with path to folder containing startup.sh: Ex. '/home/pi/source/smart-mirror-server'
2. give permission to startup.sh: chmod +x startup.sh
3. execute script in autostart
   a. sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
   b. add path to startup.sh at the end of the file: Ex. /home/pi/source/smart-mirror-server/startup.sh
4. sudo reboot
