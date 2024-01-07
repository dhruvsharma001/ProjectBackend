const express = require('express');
const connection = require('./config/db');
const bodyParser = require('body-parser');
const mime = require('mime');
const cron = require('node-cron');

//dotenv
require('dotenv').config();

const path = require('path');
// Cors
const morgan = require('morgan');

const cors = require('cors');
const fs = require('fs');
const { Telegraf } = require('telegraf')

const https = require('https');

const Users = require('./models/Users');
const delhiveryCronJob = require('./middlewares/delhivery');
const dailySales = require('./middlewares/dailySales');
const totalCount = require('./middlewares/totalCount');
const totalSales = require('./middlewares/totalSales');
const commandArgsMiddleware = require('./middlewares/commandArgs');
const deleteOrder = require('./middlewares/deleteOrder.js');
const dailySalesInfo = require('./middlewares/dailySalesInfo.js');
const dailyOrderedProductsInfo = require('./middlewares/dailyOrderedProductsInfo.js');
//var generator = require('generate-password');
const cronInfo = require('./middlewares/cronInfo.js');
const bot = new Telegraf(process.env.TOKEN);

// Telegram API Configuration


const app = express();

// CORS
app.use(cors());

bot.use(commandArgsMiddleware());
bot.start((ctx) => ctx.reply('𝚆𝚑𝚒𝚜𝚙𝚎𝚛𝚒𝚗𝚐𝙷𝚘𝚖𝚎𝚜 𝙱𝚘𝚝' + '\n' + '\n' + '𝚃𝚢𝚙𝚎 /𝚑𝚎𝚕𝚙 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚏𝚘𝚛 𝚊𝚌𝚝𝚒𝚟𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚕𝚒𝚜𝚝'));
bot.command('orderList', (ctx) => dailySales());
bot.command('order', (ctx) => {
  if (ctx.state.command.args[0] === "delete") {
    deleteOrder(ctx);
  }
  else if (ctx.state.command.args[0] === "show") {
    ctx.reply('🗿');
  }
  else {
    ctx.reply('🗿');
    ctx.reply('𝙽𝚘𝚝 𝚊 𝚟𝚊𝚕𝚒𝚍 𝚌𝚘𝚖𝚖𝚊𝚗𝚍..!!' + '\n' + ' 𝙲𝚘𝚛𝚛𝚎𝚌𝚝 𝚜𝚢𝚗𝚝𝚊𝚡 : /𝚘𝚛𝚍𝚎𝚛 <𝚘𝚙𝚎𝚛𝚊𝚝𝚒𝚘𝚗> <𝙼𝚊𝚐𝚎𝚗𝚝𝚘𝙾𝚛𝚍𝚎𝚛𝙸𝚍> ' + '\n' + '/𝚘𝚛𝚍𝚎𝚛 𝚍𝚎𝚕𝚎𝚝𝚎 𝟶𝟶𝟶𝟶𝟶𝟶𝟿𝟷𝟷');
  }
});
const help = "𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝙲𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚎𝚍" + "\n" + "\n" + "/𝚝𝚜 : 𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝. (𝚃𝚘𝚍𝚊𝚢)" + "\n" + "/𝚝𝚌: 𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙲𝚘𝚞𝚗𝚝. (𝚃𝚘𝚍𝚊𝚢)" + '\n' + ' 𝙾𝚛𝚍𝚎𝚛 𝙾𝚙𝚎𝚛𝚊𝚝𝚒𝚘𝚗s' + '\n' + ' 𝚜𝚢𝚗𝚝𝚊𝚡 : /𝚘𝚛𝚍𝚎𝚛 <𝚘𝚙𝚎𝚛𝚊𝚝𝚒𝚘𝚗> <𝙼𝚊𝚐𝚎𝚗𝚝𝚘𝙾𝚛𝚍𝚎𝚛𝙸𝚍> ' + '\n' + '/𝚘𝚛𝚍𝚎𝚛 𝚍𝚎𝚕𝚎𝚝𝚎 𝟶𝟶𝟶𝟶𝟶𝟶𝟿𝟷𝟷' + '\n' + ' 𝙶𝚛𝚘𝚞𝚙 𝙲𝚘𝚖𝚖𝚊𝚗𝚍: 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚝𝚘𝚍𝚊𝚢𝚜 𝚘𝚛𝚍𝚎𝚛𝚜 𝙻𝚒𝚜𝚝:' + '\n' + '/𝚘𝚛𝚍𝚎𝚛𝙻𝚒𝚜𝚝' + '\n' + "𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝚝𝚘 𝚜𝚑𝚘𝚠 𝚙𝚎𝚛𝚌𝚎𝚗𝚝𝚊𝚐𝚎 𝚘𝚏 𝚠𝚑𝚒𝚜𝚙𝚎𝚛𝚒𝚗𝚐 𝚑𝚘𝚖𝚎 𝚙𝚛𝚘𝚍𝚞𝚌𝚝𝚜 𝚜𝚘𝚕𝚍 𝚝𝚘𝚍𝚊𝚢" + '\n' + '/𝚒𝚗𝚏𝚘' + '\n';

bot.command('help', (ctx) => { ctx.reply('🗿'); ctx.reply(help) });
bot.command('ts', (ctx) => totalCount(ctx));
bot.command('tc', (ctx) => totalSales(ctx));
bot.command('info', async (ctx) => { await dailySalesInfo(ctx); await totalSales(ctx); });
bot.command('cron', () => cronInfo());
bot.command('products', (ctx) => dailyOrderedProductsInfo(ctx));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 500000,
  })
);

// const routes = require("./routes/")
app.use('/', require('./routes'));

app.get('/', (req, res) => {
  res.send('WhisperingHomes Backend Server ... !!');
});
app.get('/download', function (req, res) {
  var file = __dirname + '/uploads/csv/Inventory.csv';

  var filename = path.basename(file);
  var mimetype = mime.getType(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});
app.use(function (req, res, next) {
  res.status(404).json({ errorCode: 404, errorMsg: 'Route not found!' });
});


//Working Cron Jobs 

cron.schedule('10 10 * * *', () => {
  delhiveryCronJob();
  console.log('running a task every day');
});
cron.schedule('55 23 * * *', async () => {
  await cronInfo();
  await dailySales();

  console.log('running cron 12pm everyday');
})


var privateKey = fs.readFileSync('/home/ubuntu/db/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/home/ubuntu/db/fullchain.pem', 'utf8');
var credentials = {
  key: privateKey, cert: certificate, requestCert: false,
  rejectUnauthorized: false
};
var httpsServer = https.createServer(credentials, app);

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port);
});
const servers = httpsServer.listen(8443, function () {
  console.log('Listening https on port ' + servers.address().port);
});
