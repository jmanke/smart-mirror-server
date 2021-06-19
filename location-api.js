'use strict';
const axios = require('axios');

const BASE_URL = 'https://geolocation-db.com/json/';

// Be sure to call authorize() before making requests
class LocationApi {
  async currentLocation() {
    const res = await axios.get(BASE_URL);

    return res.data;
  }
}

module.exports = LocationApi;
