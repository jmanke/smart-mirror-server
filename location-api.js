"use strict";
const axios = require("axios");
require("dotenv").config();

const BASE_IPINFO_URL = "https://ipinfo.io/json";
const API_KEY = process.env.API_NINJAS;

// Be sure to call authorize() before making requests
class LocationApi {
  async currentLocation(location) {
    if (location?.city && location?.country) {
      const { data } = await axios.get(
        `https://api.api-ninjas.com/v1/geocoding?city=${location.city}&state=${location.state}&country=${location.country}`,
        {
          headers: {
            "X-Api-Key": API_KEY,
          },
        }
      );
      return {
        country_code: data[0].country,
        city: data[0].name,
        latitude: data[0].latitude,
        longitude: data[0].longitude,
        state: data[0].state,
      };
    }

    const res = await axios.get(BASE_IPINFO_URL);
    const data = res.data;
    const [lat, long] = data.loc.split(",");

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
