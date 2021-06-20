# Dependencies

1. NodeJs
2. unclutter

sudo apt-get update && sudo apt-get install unclutter

# How To Use

1. yarn install
2. node server-manager.js

# Auto Start With Raspberry Pi

1. update startup.sh with path to folder containing startup.sh: Ex. '/home/pi/source/smart-mirror-server'
2. give permission to startup.sh: chmod +x startup.sh
3. execute script in autostart
   a. sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
   b. add path to startup.sh at the end of the file: Ex. /home/pi/source/smart-mirror-server/startup.sh
4. sudo reboot
