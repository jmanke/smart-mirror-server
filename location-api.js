'use strict';
const axios = require('axios');

const BASE_URL = 'https://ipinfo.io/json';

// Be sure to call authorize() before making requests
class LocationApi {
  async currentLocation() {
    const res = await axios.get(BASE_URL);
    const data = res.data;
    const [lat, long] = data.loc.split(',');

    return {
      country_code: data.country,
      city: data.city,
      latitude: lat,
      longitude: long,
      state: data.region,
    };
  }
}

module.exports = LocationApi;
