const express = require("express");
const cors = require("cors");
const GoogleApi = require("./google-api");
const fs = require("fs").promises;
const LocationApi = require("./location-api");
const NewsApi = require("./news-api");
const { existsSync } = require("fs");

const port = 5001;
const gapi = new GoogleApi();
const locationApi = new LocationApi();
const newsApi = new NewsApi();
const settingsPath = `${__dirname}/app-settings.json`;

// ensure settings exist
if (!existsSync(settingsPath)) {
  updateSettings({});
}

const server = express();
server.use(express.json());
server.use(cors());
server.options("*", cors());

server.get("/gapi/events", async (req, res) => {
  try {
    const events = await gapi.getEvents(req.query);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

server.get("/gapi/tasks", async (req, res) => {
  try {
    const events = await gapi.getTasks(req.query);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

server.get("/location/current", async (req, res) => {
  try {
    const settings = await getSettings();
    const currentLocation = await locationApi.currentLocation(
      settings?.location
    );
    res.json(currentLocation);
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

server.get("/news/top", async (req, res) => {
  try {
    const newsResponse = await newsApi.getTopNews(req.query);
    res.json(newsResponse);
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

server.get("/api/settings", async (_, res) => {
  const settings = await getSettings();

  res.json(settings);
});

server.put("/api/settings", async (req, res) => {
  await updateSettings(req.body);
  res.sendStatus(200);
});

server.get("/api/health", async (_, res) => {
  res.sendStatus(200);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function getSettings() {
  try {
    return JSON.parse(await fs.readFile(settingsPath));
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function updateSettings(settings) {
  return fs.writeFile(settingsPath, JSON.stringify(settings));
}
