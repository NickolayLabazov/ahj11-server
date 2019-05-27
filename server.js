const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');
const Router = require('koa-router');
const moment = require('moment');

const port = process.env.PORT || 7073;
const app = new Koa();
const publ = path.join(__dirname, '/public');
const koaStatic = require('koa-static');

const router = new Router();

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }
  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});


// Репортаж

let eventCounter = 0;

let events = [];

const action = {
  type: 'action',
  data: 'Идёт перемещение мяча по полю, игроки и той, и другой команды активно пытаются атаковать',  
};

const freekick = {
  type: 'freekick',
  data: 'Нарушение правил, будет штрафной удар',  
};

const goal = {
  type: 'goal',
  data: 'Отличный удар! И Г-О-Л!',  
};

router.get('/sse', async (ctx) => {
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      console.log(lastEventId);
      return [];
    },
    stream(sse) {
      const message = {
        type: '',
        data: '',
        time: '',
      };
      const interval = setInterval(() => {
        if (eventCounter === 0) {
          events = [];
        }
        eventCounter += 1;
        if (eventCounter > 50) {
          clearInterval(interval);
        } else {
          const num = Math.random();

          if (num <= 0.1) {
            message.type = goal.type;
            message.data = goal.data;
          } else if (num <= 0.5) {
            message.type = freekick.type;
            message.data = freekick.data;
          } else {
            message.type = action.type;
            message.data = action.data;
          }
          const time = moment().format('hh:mm:ss DD.MM.YY');
          message.time = String(time);
          sse.sendEvent({ data: JSON.stringify(message) });
          events.push(JSON.parse(JSON.stringify(message)));
        }
      }, 1000);

      return () => clearInterval(interval);
    },
  });
  ctx.respond = false;
});
app.use(router.routes()).use(router.allowedMethods());

app.use(async (ctx) => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ['DELETE', 'PUT', 'PATCH'],
  });


  if (ctx.request.method === 'GET') {
    if (ctx.request.querystring === 'events') {
      console.log(events);
      ctx.response.body = JSON.stringify(events);
    }
  }
});


/* app.use(koaBody({
  urlencoded: true,
  multipart: true,
})); */

/* app.use(koaStatic(publ));

let catalog = fs.readdirSync(publ);

app.use(async (ctx) => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ['DELETE', 'PUT', 'PATCH'],
  });
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.body = '';
  }

  if (ctx.request.method === 'DELETE') {
    const name = ctx.request.querystring;
    fs.unlinkSync(`./public/${name}`);
    catalog = fs.readdirSync(publ);
    ctx.response.status = 200;
  } else if (ctx.request.method === 'GET') {
    ctx.response.body = JSON.stringify(catalog);
  } else if (ctx.request.method === 'POST') {
    const { file } = ctx.request.files;
    console.log(ctx.request.files);
    const link = await new Promise((resolve, reject) => {
      const oldPath = file.path;
      const filename = uuid.v4();
      const newPath = path.join(publ, filename);
      const callback = error => reject(error);
      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);
      readStream.on('error', callback);
      writeStream.on('error', callback);
      readStream.on('close', () => {
        console.log('close');
        fs.unlink(oldPath, callback);
        resolve(filename);
      });
      readStream.pipe(writeStream);
    });
    ctx.response.body = link;
    catalog = fs.readdirSync(publ);
  }
}); */
const server = http.createServer(app.callback()).listen(port);
