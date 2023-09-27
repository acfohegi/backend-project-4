import axios from 'axios';
import { createWriteStream } from 'node:fs';
import debug from 'debug';

const sgLog = debug('SourceGetter');

export default class SourceGetter {
  static getHtml(url) {
    sgLog('getting HTML for', url.href);
    return axios.get(url).then((response) => response.data);
  }

  static getSource(url, filepath) {
    sgLog('getting source from', url)
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: 'get',
        responseType: 'stream',
      }).then((response) => {
        const stream = createWriteStream(filepath);

        stream.on('close', () => {
          sgLog('write stream to', filepath, 'closed')
          resolve();
        });

        stream.on('error', (error) => {
          sgLog('write stream to', filepath, 'failed')
          reject(error);
        });

        response.data.pipe(stream);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
