'use strict';
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWS_API_KEY;

// Be sure to call authorize() before making requests
class NewsApi {
  async getTopNews({ language = 'en', newsSource = 'cnn' }) {
    const url = `${BASE_URL}/top-headlines?apikey=${API_KEY}&language=${language}&sources=${newsSource}`;
    const res = await axios.get(url);

    return res.data;
  }
}

module.exports = NewsApi;
