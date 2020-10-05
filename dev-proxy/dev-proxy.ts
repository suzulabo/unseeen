/*
https://github.com/ionic-team/stencil/issues/1252
*/
import * as http from 'http';
import { createProxyServer } from 'http-proxy';
import Server = require('http-proxy');

const logging = (s: string, all?: boolean) => {
  const now = new Date();
  const d = now.toLocaleTimeString(undefined, { hour12: false });
  if (!all && s.length > 100) {
    s = s.substr(0, 97) + '...';
  }
  console.log(`${d} ${s}`);
};

const proxyConfig: { port: number; prefix: string }[] = [
  { port: 5000, prefix: '/__/' }, // hosting
  { port: 8080, prefix: '/v1/' }, // firestore REST
  { port: 8080, prefix: '/google.firestore.v1.Firestore/' }, // firestore RPC
  { port: 5001, prefix: '/unseeen/' }, // functions
  { port: 3333, prefix: '' }, // stencil
];

const proxyServers = proxyConfig.map((x) => {
  const server = createProxyServer({
    target: { host: '127.0.0.1', port: x.port },
  });
  server.on('error', (err) => {
    logging(`${err.stack}`, true);
  });
  return {
    server: server,
    prefix: x.prefix,
  };
});

const httpServer = http.createServer((req, res) => {
  const url = req.url;
  logging(url);
  for (const sv of proxyServers) {
    if (!sv.prefix || url.startsWith(sv.prefix)) {
      sv.server.web(req, res);
      return;
    }
  }
});
httpServer.on('upgrade', (req, socket, head) => {
  const url = req.url as string;
  logging(`ws:${url}`);
  for (const sv of proxyServers) {
    if (!sv.prefix || url.startsWith(sv.prefix)) {
      sv.server.ws(req, socket, head);
      return;
    }
  }
});

httpServer.on('error', (err) => {
  logging(`${err.stack}`, true);
});

console.log('Listen: http://localhost:9292/');

httpServer.listen(9292);
