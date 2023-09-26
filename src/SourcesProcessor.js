import * as cheerio from 'cheerio';
import path from 'node:path';

class SourcesProcessor {
  constructor(html, pathsNamer) {
    this.$ = cheerio.load(html);
    this.pathsNamer = pathsNamer;
    this.sourcesDirName = pathsNamer.getSourcesDirName();
    this.imgs = [];
    this.links = [];
    this.scripts = [];
  }

  findAndUpdate() {
    const pn = this.pathsNamer;
    const dir = this.sourcesDirName;
    const { host } = pn.url;
    const { $ } = this;

    const isSameHost = (pathname) => {
      const url = new URL(pathname);
      return host === url.host;
    };

    const isSameDocument = (pathname) => pathname === pn.url.pathname;

    const getFilename = (pathname) => {
      if (isSameDocument(pathname)) {
        return `${pn.getSourceFileName(pathname)}.html`;
      }
      return pn.getSourceFileName(pathname);
    };

    const tags = ['img', 'script', 'link'];

    const process = (tagName) => {
      const pathProperty = tagName === 'link' ? 'href' : 'src';
      const tagArr = this[`${tagName}s`];
      const elementsToProcess = [];

      $(tagName).each(function (_i, el) {
        const originalPath = pn.getSourceUrl(el.attribs[pathProperty]).href;
        if (isSameHost(originalPath)) {
          elementsToProcess.push(el);
        }
      });

      elementsToProcess.forEach((el, i) => {
        const originalPath = pn.getSourceUrl(el.attribs[pathProperty]).href;
        const filename = getFilename(el.attribs[pathProperty]);
        const filepath = path.join(dir, filename);
        tagArr[i] = { originalPath, filepath };
        $(el).attr(pathProperty, filepath);
      });
    };

    tags.forEach((tag) => process(tag));
  }

  process() {
    this.findAndUpdate();
    return {
      html: this.$.html(),
      imgs: this.imgs,
      links: this.links,
      scripts: this.scripts,
    };
  }
}

export default SourcesProcessor;
