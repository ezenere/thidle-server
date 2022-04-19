import 'dotenv/config'
import express from 'express'
import { route } from 'express/lib/application';
import http from 'http'
import route from './routes';

const app = express();

const server = http.createServer(app);

app.use(router)

server.listen(process.env.SERVER_PORT);