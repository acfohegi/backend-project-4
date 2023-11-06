import { mkdir, writeFile } from 'node:fs/promises';
import SourceGetter from './SourceGetter.js';
import debug from 'debug';

const fsLog = debug('FileSaver');

class FileSaver {
  constructor(sources, pathsNamer) {
    this.sources = sources;
    this.pathsNamer = pathsNamer;
    this.htmlPath = pathsNamer.getHtmlFilePath();
  }

  mkSourcesDir() {
    const sourcesDirName = this.pathsNamer.getSourcesDirName();
    const sourcesDirPath = this.pathsNamer.getSourcesDirPath(sourcesDirName);
    fsLog(`Creating sources directory: ${sourcesDirPath}`)
    return mkdir(sourcesDirPath);
  }

  saveHtml() {
    fsLog('Writing HTML to', this.htmlPath);
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

    fsLog(`Starting load page sources:\n${JSON.stringify(srcs)}`);

    const srcPromises = srcs.map(({ originalPath, filepath }) => {
      const promise = SourceGetter.getSource(originalPath, filepath);
      return promise;
    });

    return this.mkSourcesDir()
      .then(() => {
        Promise.all(srcPromises);
      });
  }

  save() {
    return this.saveSources()
      .then(() => this.saveHtml())
      .then(() => {
        fsLog('HTML page and its sources are saved.');
        return Promise.resolve(this.htmlPath);
      })
      .catch((e) => {
        fsLog(e);
        throw new Error(`Failed to save sources. ${e}`);
      });
  }
}

export default FileSaver;
