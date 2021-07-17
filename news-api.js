'use strict';
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://newsdata.io/api/1/news';
const API_KEY = process.env.NEWS_API_KEY;

// Be sure to call authorize() before making requests
class NewsApi {
  async getTopNews({ language = 'en', newsSource = 'cnn' }) {
    const url = `${BASE_URL}?apikey=${API_KEY}&language=${language}&category=top&domain=${newsSource}`;
    const res = await axios.get(url);

    return res.data;
  }
}

module.exports = NewsApi;
