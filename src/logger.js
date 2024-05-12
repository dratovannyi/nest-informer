//const pino = require('pino');

/*const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: `${__dirname}/app.log` },
});

module.exports = pino({
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
},

fileTransport
);*/

const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, json, ms, colorize, align, printf, prettyPrint } = winston.format;
const moment = require("moment");
const fileRotateTransport = new winston.transports.DailyRotateFile({
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD MMM HH:mm:ss.SS'}),
    winston.format.json(),
  ),
  filename: './src/logs/log-%DATE%.json',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  eol: ',\n',

})


const consoleTransport = new winston.transports.Console({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD MMM HH:mm:ss.SS'}),
  
    winston.format.align(),
    winston.format.printf((info) => (`[${info.timestamp}] \
                                      [${info.level.toUpperCase()}]: \
                                      [${info.event?.toUpperCase()}]: \
                                      ${info.code? 'code: ' + info.code + ' | ': ''} \
                                      ${info.initiator? 'initiator: ' + info.initiator + ' | ': ''} \
                                      ${info.initiatorID? 'initiatorID: ' + info.initiatorID + ' | ': ''} \
                                      ${info.guild? 'guild: ' + info.guild + ' | ': ''} \
                                      ${info.guildID? 'guildID: ' + info.guildID + ' | ': ''} \
                                      ${info.message}`
                                    ).replace(/\s{2,}/g, " ").trim()
                          ),

  )
})

module.exports = winston.createLogger({

  transports: [
    consoleTransport,
    fileRotateTransport],
});

//use this piece of shit as template
//winston.error('Timeout, something wrong with connection to ',{code: e.code, initiator: '<DS username>', initiatorID: '<DS userID>',guild: '<DS guildName>', guildID: '<DS guildID>'}),
      