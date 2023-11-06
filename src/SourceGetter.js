import axios from 'axios';
import { createWriteStream } from 'node:fs';
import debug from 'debug';

const sgLog = debug('SourceGetter');
axios.defaults.validateStatus = (status) => status === 200;

export default class SourceGetter {
  static getHtml(url) {
    sgLog('Getting HTML for', url.href);
    return axios.get(url)
      .then((response) => response.data)
      .catch((e) => {
        sgLog(e);
        throw new Error(`Failed to get ${url}\n${e}`);
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
      throw new Error(`Failed to get ${url}\n${e}`);
    });
  }
}
