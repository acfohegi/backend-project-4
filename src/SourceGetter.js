import axios from 'axios';
import { createWriteStream } from 'node:fs';

export default class SourceGetter {
  static getHtml(url) {
    return axios.get(url).then((response) => response.data);
  }

  static getImg(url, filepath) {
    return axios({
      url,
      method: 'get',
      responseType: 'stream',
    }).then((response) => response.data.pipe(createWriteStream(filepath)));
  }
}
