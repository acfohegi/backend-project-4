import path from 'node:path';

export default class PathsNamer {
  constructor(urlString, options) {
    this.url = new URL(urlString);
    this.protocol = this.url.protocol;
    this.output = options.output ?? '.';
  }

  getNormalizedUrl() {
    const protocolless = this.url.href
      .replace(this.protocol, '')
      .replace(/^\/\//, '');
    return PathsNamer.normalizeString(protocolless);
  }

  getHtmlFilePath() {
    const dirPath = this.output;
    const normalizedUrl = this.getNormalizedUrl();
    return `${path.join(dirPath, normalizedUrl)}.html`;
  }

  getSourcesDirPath() {
    const normalizedUrl = this.getNormalizedUrl();
    return `${normalizedUrl}_files`;
  }

  getSourceFileName(filepath) {
    const { hostname } = this.url;
    const { dir, name, ext } = path.parse(filepath);
    const rawBasename = path.join(hostname, dir, name);
    const basename = PathsNamer.normalizeString(rawBasename);
    return `${basename}${ext}`;
  }

  static normalizeString(str) {
    return str.replace(/[^0-9a-zA-Z]/g, '-');
  }
}
