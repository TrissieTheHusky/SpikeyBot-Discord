// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const SubModule = require('../subModule.js');

const ccMaxAge = 30 * 7 * 24 * 60 * 60; // 30 days

/**
 * @description Serves files from web requests.
 * @class
 * @augments SubModule
 */
class FileServer extends SubModule {
  /**
   * @description Serves files from web requests.
   */
  constructor() {
    super();

    this._app = http.createServer(this._handler);
    this._app.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.debug('Port already in use. Shutting down.');
        return;
      }
      this.error('A webserver error occurred!');
      console.error(err);
    });

    this._handler = this._handler.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    const port = this.common.isRelease ? 8022 : 8023;
    this._app.listen(port, '127.0.0.1');
    this.debug('Starting file server on port: ' + port);
  }
  /** @inheritdoc */
  shutdown() {
    if (this._app) this._app.close();
  }

  /**
   * @description Handles all http requests.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  _handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        'ERROR';
    const url = req.url.replace(/^\/(www|kamino).spikeybot.com(?:\/dev)?/, '');
    if (url.startsWith('/avatars/') && req.method === 'GET') {
      const file = path.resolve(`./save/users${url}`);
      if (!this._isPathAcceptable(file)) {
        res.writeHead(404);
        res.end();
        return;
      }
      fs.stat(file, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end();
            return;
          }
          res.writeHead(500);
          res.end('500 Internal Server Error (FS)');
          this.error(`Failed to stat file: ${file}`);
          console.log(err);
          return;
        }

        const ETag = crypto.createHash('sha1')
            .update(`ETAG-${file}${stats.mtime.getTime()}`)
            .digest('hex');
        res.setHeader('ETag', ETag);
        if (req.headers['etag'] === ETag) {
          res.writeHead(
              304, {'Cache-Control': `max-age=${ccMaxAge}`, 'ETag': ETag});
          res.end();
          return;
        }

        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.gif': 'image/gif',
        };
        const ext = path.extname(file);
        const mime = mimeTypes[ext];

        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Length': stats.size,
        });
        res.pipe(fs.createReadStream(file));
      });
    } else {
      this.debug(`404 ${req.method} ${url}`, ip);
      res.writeHead(404);
      res.end();
    }
  }

  /**
   * @description Check if given path to a file is allowed to be served to a
   * client request.
   * @private
   * @param {string} file The filename to check.
   * @returns {boolean} If the filename is allowed.
   */
  _isPathAcceptable(file) {
    file = path.resolve(file);
    const proj = path.resolve(__dirname + '/../../');
    return file.startsWith(proj);
  }
}

module.exports = new FileServer();