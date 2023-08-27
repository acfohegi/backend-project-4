import { mkdir, writeFile } from 'node:fs/promises';
import SourceGetter from './SourceGetter.js';

class FileSaver{
  constructor(sources, pathsNamer) {
    this.sources = sources;
    this.htmlPath = pathsNamer.getHtmlFilePath();
    this.sourcesDir = pathsNamer.getSourcesDirName();
  }

  saveHtml() {
    return writeFile(this.htmlPath, this.sources.html)
  }

  saveImgs() {
    const imgs = this.sources.imgs;
    if (imgs.length === 0) {
      return Promise.resolve();
    }

    mkdir(this.sourcesDir);

    const imgPromises = imgs.map(({ originalPath, filepath }) => {
      return SourceGetter.getImg(originalPath, filepath);
    });

    return Promise.all(imgPromises);
  }

  save() {
    return this.saveImgs()
      .then(() => this.saveHtml())
      .then(() => this.htmlPath);
  }
}

export default FileSaver;
