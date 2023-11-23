import axios from 'axios';
import { createWriteStream } from 'node:fs';
import debug from 'debug';
import SourceGetterError from './errors/SourceGetter.js';

const sgLog = debug('SourceGetter');
axios.defaults.validateStatus = (status) => status === 200;

export default class SourceGetter {
  static getHtml(url) {
    sgLog('Getting HTML for', url.href);
    return axios.get(url)
      .then((response) => response.data)
      .catch((e) => {
        sgLog(e);
        throw new SourceGetterError(`Failed to get ${url}\n${e.message}`);
      });
  }

  static getSource(url, filepath) {
    sgLog('Getting source from', url);

    return axios({
      url,
      method: 'get',
      responseType: 'stream',
    }).then((response) => new Promise((resolve, reject) => {
      const stream = createWriteStream(filepath);
      stream.on('finish', () => {
        sgLog('Write stream to', filepath, 'finished');
        resolve();
      });

      stream.on('error', (e) => {
        sgLog('Write stream to', filepath, 'failed\n', e);
        reject(e);
      });

      response.data.pipe(stream);
    })).catch((e) => {
      sgLog(e);
      throw new SourceGetterError(`Failed to get ${url}\n${e.message}`);
    });
  }
}
