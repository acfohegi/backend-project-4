import PathsNamer from './PathsNamer.js';
import SourceGetter from './SourceGetter.js';
import SourcesProcessor from './SourcesProcessor.js';
import FileSaver from './FileSaver.js';

class PageLoader {
  constructor(url, options) {
    this.pathsNamer = new PathsNamer(url, options);
  }

  load() {
    const pn = this.pathsNamer;
    return SourceGetter.getHtml(pn.url)
      .then((html) => {
        const sp = new SourcesProcessor(html, pn);
        return sp.process();
      })
      .then((sources) => {
        const fs = new FileSaver(sources, pn);
        fs.save().then((htmlPath) => htmlPath);
      });
  }
}

export default PageLoader;
