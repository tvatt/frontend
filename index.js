'use strict';

const express = require('express');
const https = require('https')
const cors = require('cors');
const fs = require('fs');

const PORT = process.env.PORT || 80;
const LOAD_BALANCER_SERVER = process.env.LOAD_BALANCER_SERVER || 'tvatt.herokuapp.com';
const CHECK_LOAD_BALANCER_INTERVAL = process.env.CHECK_LOAD_BALANCER_INTERVAL || 30; // in seconds

// in case loadbalancer fail to response this value will be used as backend url
const FALLBACK_BACKEND_URL = process.env.BACKEND_URL || 'tvatt.herokuapp.com';
let backendUrl = FALLBACK_BACKEND_URL; // will overriden by Load Balancer

checkLoadBalancer();
setInterval(() => {
  checkLoadBalancer();
}, CHECK_LOAD_BALANCER_INTERVAL * 1000);

const app = express();
app.use(cors({
  credentials: true
}));

app.options('*', cors());
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Load Balancer URL: ${LOAD_BALANCER_SERVER}`);
  console.log(`HTML Server listening on port: ${PORT}...`);
})

app.get('*', (req, res) => {
  res.redirect('/board.html')
});

function checkLoadBalancer() {
  const options = {
    hostname: LOAD_BALANCER_SERVER,
    path: '/routes',
    method: 'GET'
  }

  const req = https.request(options, res => {
    res.on('data', d => {
      if (res.statusCode === 200) {
        const result = JSON.parse(d);
        if (typeof result.backendUrl == 'string' && result.backendUrl.length > 0) {
          if (result.backendUrl !== backendUrl) {
            backendUrl = result.backendUrl
            console.debug(`statusCode: ${res.statusCode}: Backend URL was changed to:  ${backendUrl}`);
            writeConfigJsFile(backendUrl);
          }
        } else {
          setBackendUrltoFallback();
        }
      } else {
        setBackendUrltoFallback();
      }
    })
  })
  req.on('error', error => {
    console.error(error);
  })

  req.end();
}

function setBackendUrltoFallback() {
  if (backendUrl !== FALLBACK_BACKEND_URL) {
    backendUrl = FALLBACK_BACKEND_URL;
    writeConfigJsFile(backendUrl);
    console.debug(`backend url changed to fallback value: ${backendUrl}`);
  }
}

function writeConfigJsFile() {
  fs.writeFileSync('public/js/config.js', `config = { backendUrl: '${backendUrl}' };`);
}
