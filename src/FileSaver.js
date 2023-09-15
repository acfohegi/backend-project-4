import { mkdir, writeFile } from 'node:fs/promises';
import SourceGetter from './SourceGetter.js';

class FileSaver {
  constructor(sources, pathsNamer) {
    this.sources = sources;
    this.htmlPath = pathsNamer.getHtmlFilePath();
    this.sourcesDir = pathsNamer.getSourcesDirName();
  }

  saveHtml() {
    return writeFile(this.htmlPath, this.sources.html);
  }

  saveSources() {
    const srcs = [
      ...this.sources.imgs,
      ...this.sources.links,
      ...this.sources.scripts,
    ];

    if (srcs.length === 0) {
      return Promise.resolve();
    }

    mkdir(this.sourcesDir);

    const srcPromises = srcs.map(({ originalPath, filepath }) => {
      const promise = SourceGetter.getSource(originalPath, filepath);
      return promise;
    });

    return Promise.all(srcPromises);
  }

  save() {
    return this.saveSources()
      .then(() => this.saveHtml())
      .then(() => this.htmlPath);
  }
}

export default FileSaver;
