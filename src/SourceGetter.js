import axios from 'axios';
import { createWriteStream } from 'node:fs';

export default class SourceGetter {
  static getHtml(url) {
    return axios.get(url).then((response) => response.data);
  }

  static getImg(url, filepath) {
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: 'get',
        responseType: 'stream',
      }).then((response) => {
        const stream = createWriteStream(filepath);

        stream.on('close', () => {
          resolve();
        });

        stream.on('error', (error) => {
          reject(error);
        });

        response.data.pipe(stream);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
