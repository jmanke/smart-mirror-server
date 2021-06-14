const express = require('express');
const cors = require('cors');
const GoogleApi = require('./google-api');
const fs = require('fs').promises;

const port = 5001;
const gapi = new GoogleApi();
const settingsPath = `${__dirname}/app-settings.json`;

const server = express();
server.use(express.json());
server.use(cors());
server.options('*', cors());

server.get('/gapi/events', async (req, res) => {
  try {
    const events = await gapi.getEvents(req.query);
    res.json(events);
  } catch (err) {
    res.json(err);
  }
});

server.get('/gapi/tasks', async (req, res) => {
  try {
    const events = await gapi.getTasks(req.query);
    res.json(events);
  } catch (err) {
    res.json(err);
  }
});

server.get('/api/settings', async (req, res) => {
  const settings = await getSettings();

  res.json(settings);
});

server.put('/api/settings', async (req, res) => {
  await updateSettings(req.body);
  res.sendStatus(200);
});

server.get('/api/health', async (req, res) => {
  res.sendStatus(200);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function getSettings() {
  try {
    return JSON.parse(await fs.readFile(settingsPath));
  } catch (err) {
    return null;
  }
}

async function updateSettings(settings) {
  return fs.writeFile(settingsPath, JSON.stringify(settings));
}
