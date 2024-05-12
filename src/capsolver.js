require('dotenv').config()

const axios = require('axios');
const config = require('../config.json')
const PAGE_URL = "https://map.minecraft-galaxy.ru/#0/0/29/0/129";
const PAGE_KEY = "6Lf7o8QUAAAAAEwjKHfKs7zpCYvA1tPfWsns_g3M";
const PAGE_ACTION = "map";


async function createTask(url, key, pageAction) {
  try {
    // Define the API endpoint and payload as per the service documentation.
    const apiUrl = "https://api.capsolver.com/createTask";
    const payload = {
      clientKey: process.env.CAPSOLVER_TOKEN,
      task: {
        type: "ReCaptchaV3TaskProxyLess",
        minScore: 0.7,
        websiteURL: PAGE_URL,
        websiteKey: PAGE_KEY,
        pageAction: PAGE_ACTION
      }
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    const response = await axios.post(apiUrl, payload, { headers });
    return response.data.taskId;

  } catch (error) {//503
    console.error("Error creating CAPTCHA task: ", error);
    throw error;
  }
}

function setSessionHeaders() {
  return {
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="123", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': 'Windows',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': 'gzip, deflate',
    'accept-language': 'en,fr-FR;q=0.9,fr;q=0.8,en-US;q=0.7',
  };
}
async function getTaskResult(taskId) {
  try {
    const apiUrl = "https://api.capsolver.com/getTaskResult";
    const payload = {
      clientKey: process.env.CAPSOLVER_TOKEN,
      taskId: taskId,
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    let result;
    do {
      const response = await axios.post(apiUrl, payload, { headers });
      result = response.data;
      if (result.status === "ready") {
        return result.solution;
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds before retrying
    } while (true);

  } catch (error) {
    console.error("Error getting CAPTCHA result: ", error);
    throw error;
  }
}

async function passReCap() {
    
  const headers = setSessionHeaders();
  console.log("Creating CAPTCHA task...");
  const taskId = await createTask(PAGE_URL, PAGE_KEY, PAGE_ACTION);
  console.log(`Task ID: ${taskId}`);

  console.log("Retrieving CAPTCHA result...");
  const solution = await getTaskResult(taskId);
  const token = solution.gRecaptchaResponse;
  console.log(`Token Solution ${token}`);
  return token
}
module.exports = {passReCap}
