require('dotenv').config()
const config = require('../config.json');
const winston = require('../src/logger');
const solver = require('../src/capsolver');

const fs = require('node:fs');
const path = require('node:path');

const axios = require('axios');
const { parse } = require('node-html-parser');

async function login(){
  const formData = new FormData();
  formData.append("ref",  "https://forum.minecraft-galaxy.ru/main/")
  formData.append("login", process.env.MCGL_LOGIN)
  formData.append("pass", process.env.MCGL_PASS)
  formData.append("fcode", "17605846")
  formData.append("form", "")
  formData.append("recap", "")
  
  const form ={
    ref: 'https://forum.minecraft-galaxy.ru/main/',
    login: process.env.MCGL_LOGIN,
    pass: process.env.MCGL_PASS,
    fcode: '17605846',
    form: '',
    recap: ''
  }

  try{
    let axiosLogin = await axios({
      url: "https://forum.minecraft-galaxy.ru/login.php",
      method: "POST",
      data: formData,
      maxRedirects: 0,
      validateStatus: function(status) {
        return status >= 200 && status < 303;
      },
      withCredentials: true,
      headers: {
        'Host': 'forum.minecraft-galaxy.ru',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
      }
    }) .then(function (response) {
      html = parse(response.data)
      alert = html.querySelector('#text-73')

      if(!alert){
        winston.info('Login successed, writing cookie',{event: 'LOGIN EVENT',code: response.status, initiator: 'bot'})
        config.cookie = response.headers['set-cookie'][0].split(';')[0]
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), function writeJSON(err) {
          if (err) return console.log(err)
        });
        winston.info('Cookie writeen:' + config.cookie,{event: 'LOGIN EVENT',code: response.status, initiator: 'bot'})
        return true
      }

      if(alert){
        winston.error(alert.childNodes[0]._rawText,{event: 'LOGIN EVENT',code: response.status, initiator: 'bot'})
        return true
      }
    
    })

  }catch(err){
    
    if(err.code ==='ETIMEDOUT'){
      winston.error('Timeout, something wrong with connection to MCGL, reconnect in 1 minute',{event: 'LOGIN EVENT', code: err.code, initiator: 'bot'})
      await new Promise(resolve => setTimeout(resolve, 60000));
     return login();
      
    }
  


    winston.error('Unexpected error. Check Axios code',{event: 'LOGIN EVENT', code: err.code, initiator: 'bot'})
    throw err
  }

}



async function getData2(token){
 
  const formData = new FormData();
  formData.append("filter",  "2")
  formData.append("recap", token || '')

  try {


    winston.info('Getting map',{event: 'MAP EVENT',  initiator: 'bot'})
    const res = await axios({
      url: "https://map.minecraft-galaxy.ru/players/29?d=0",
      method: "POST",
      data: formData,
      withCredentials: true,
      headers: {
        'Host': 'map.minecraft-galaxy.ru',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': config.cookie
      }
    }) .then(function (response) {
      if (response.data.error === 2) //token = await solver.passReCap()
      return response
    }).catch( e => {})
    return res
  } catch (error) {
    console.log (error)
  }


}

async function getData(token){
  try {
    console.log('throwing token:', token)
    winston.info('Getting map', `${token!=='undefined'?'with token':''}`,{event: 'MAP EVENT',  initiator: 'bot'})
    const response = await axios.post('https://map.minecraft-galaxy.ru/players/29?d=0', {
      filter: 2,
      recap: token || ''
    }, {
      headers: {
        'Host': 'map.minecraft-galaxy.ru',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': config.cookie
      }
    })
    return response
  } catch (error) {
    console.log(error)
  }
}
module.exports = { login, getData } 