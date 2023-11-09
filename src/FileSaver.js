import { mkdir, writeFile } from 'node:fs/promises';
import debug from 'debug';
import Listr from 'listr';
import path from 'node:path';
import SourceGetter from './SourceGetter.js';

const fsLog = debug('FileSaver');

class FileSaver {
  constructor(sources, pathsNamer) {
    fsLog('Creating FileSaver with sources:\n', sources);
    this.pageSources = [
      ...sources.imgs,
      ...sources.links,
      ...sources.scripts,
    ];
    this.html = sources.html;
    this.htmlPath = pathsNamer.getHtmlFilePath();
    this.pathsNamer = pathsNamer;
  }

  mkSourcesDir() {
    if (this.pageSources.length === 0) {
      fsLog('Skipping the creation of the sources directory');
      return Promise.resolve();
    }
    const sourcesDirName = this.pathsNamer.getSourcesDirName();
    const sourcesDirPath = this.pathsNamer.getSourcesDirPath(sourcesDirName);
    fsLog(`Creating the sources directory: ${sourcesDirPath}`);
    return mkdir(sourcesDirPath);
  }

  saveHtml() {
    fsLog('Writing HTML to', this.htmlPath);
    return writeFile(this.htmlPath, this.html);
  }

  save() {
    const fs = this;

    const sourcesTasks = fs.pageSources.map((s) => {
      const filename = path.basename(s.originalPath);
      const title = `Loading ${filename}`;
      const task = () => SourceGetter.getSource(s.originalPath, s.filepath);
      return { title, task };
    });

    const htmlTask = {
      title: 'Writing processed HTML page',
      task: () => fs.saveHtml(),
    };

    const tasks = [...sourcesTasks, htmlTask];
    const listr = new Listr(tasks, { concurrent: true });

    return fs.mkSourcesDir()
      .then(() => listr.run())
      .then(() => {
        fsLog('HTML page and its sources are saved.');
        return fs.htmlPath;
      })
      .catch((e) => {
        fsLog(e);
        throw new Error(`Failed to save sources.\n${e}`);
      });
  }
}

export default FileSaver;
