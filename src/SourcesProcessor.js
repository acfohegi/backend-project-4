import * as cheerio from 'cheerio';
import path from 'node:path';

class SourcesProcessor {
  constructor(html, pathsNamer) {
    this.$ = cheerio.load(html);
    this.pathsNamer = pathsNamer;
    this.sourcesDirName = pathsNamer.getSourcesDirName();
    this.imgs = [];
  }

  findAndUpdate() {
    const pn = this.pathsNamer;
    const dir = this.sourcesDirName;
    const { imgs, $ } = this;

    $('img').each(function (i, img) {
      const originalPath = pn.getSourceUrl(img.attribs.src);
      const filename = pn.getSourceFileName(img.attribs.src);
      const filepath = path.join(dir, filename);
      imgs[i] = ({ originalPath, filepath });
      $(this).attr('src', filepath);
    });
  }

  process() {
    this.findAndUpdate();
    return { html: this.$.html(), imgs: this.imgs };
  }
}

export default SourcesProcessor;
