import fetch from 'node-fetch';
import {Headers} from 'node-fetch';
import http from 'http';
import express from 'express'
import jsonfile from 'jsonfile'

let setts = await jsonfile.readFile('.data/settings.json');

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

let headers = new Headers({
    "Host": "www.idokep.hu",
});

async function getTemp(loc) {
	const response = await fetch('https://www.idokep.hu/terkep/hu/hoterkep_data.js', {
        method: 'GET',
        headers: headers
    });
    if(response.status!=200) return "se";
    const body = await response.text();
    let index = body.indexOf(loc);
    if(index > -1){
      let sub = body.substring(index, index + 100);
      let temp = sub.substring(sub.indexOf('="') + 2, sub.indexOf('&'));
      Math.round
      return sub.substring(sub.indexOf('br>')+3,sub.indexOf(', ')) + ' ' + temp + "\n";
    } else return "nf"
}

const app = express();
app.get('/', async (req, res) => {
  console.log("loc: " + req.query.loc);
  let deg = "missing param";
  if(req.query.loc)
    deg = await getTemp(req.query.loc);
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  res.setHeader('app','');
  res.end(deg);
});

app.get('/getconf', async (req, res) => {
  
  res.end(setts[req.query.get]??'unset');
});

app.get('/setconf', async (req, res) => {
  setts[Object.keys(req.query)[0]] = Object.values(req.query)[0];
  console.log(setts, " ", req.query);
  jsonfile.writeFile('.data/settings.json', setts);
  res.end('ok');
});


const server = http.createServer(app);
server.listen(process.env.PORT || 3000);
/*http.createServer(async function (req, res) {    
    let deg = await getTemp();
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end(`${req.url}`);
}).listen(process.env.PORT || 5000);*/

