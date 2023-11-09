import nock from 'nock';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { mockFsBesidesNodeModules, getFixturePath } from './helpers.js';
import PathsNamer from '../src/PathsNamer.js';
import FileSaver from '../src/FileSaver.js';

const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'));
const image = await readFile(getFixturePath('nodejs.png'));
const css = await readFile(getFixturePath('application.css'));
const script = await readFile(getFixturePath('runtime.js'));

test('FileSaver', async () => {
  const mockSources = (pathname, filename, src) => {
    nock('https://ru.hexlet.io').get(pathname).reply(200, src, {
      'content-type': 'application/octet-stream',
      'content-length': src.length,
      'content-disposition': `attachment; filename=${filename}`,
    });
  };

  mockSources('/assets/professions/nodejs.png', 'nodejs.png', image);
  mockSources('/assets/application.css', 'nodejs.png', css);
  mockSources('/packs/js/runtime.js', 'nodejs.png', script);
  mockFsBesidesNodeModules();

  const url = 'https://ru.hexlet.io/courses';

  const pn = new PathsNamer(url, { output: process.cwd() });
  const srcDir = pn.getSourcesDirName();

  const imgSrc = '/assets/professions/nodejs.png';
  const imgFilename = pn.getSourceFileName(imgSrc);
  const linkSrc = '/assets/application.css';
  const linkFilename = pn.getSourceFileName(linkSrc);
  const scriptSrc = '/packs/js/runtime.js';
  const scriptFilename = pn.getSourceFileName(scriptSrc);

  const sources = {
    html,
    imgs: [{
      originalPath: pn.getSourceUrl(imgSrc).href,
      filepath: path.join(srcDir, imgFilename),
    }],
    links: [{
      originalPath: pn.getSourceUrl(linkSrc).href,
      filepath: path.join(srcDir, linkFilename),
    }],
    scripts: [{
      originalPath: 'https://ru.hexlet.io/packs/js/runtime.js',
      filepath: path.join(srcDir, scriptFilename),
    }],
  };

  const fs = new FileSaver(sources, pn);

  const actualHtmlPath = await fs.save();
  const actualHtml = await readFile(actualHtmlPath);
  const actualImage = await readFile(sources.imgs[0].filepath);
  const actualCss = await readFile(sources.links[0].filepath);
  const actualScript = await readFile(sources.scripts[0].filepath);

  expect(actualHtml).toStrictEqual(html);
  expect(actualImage).toStrictEqual(image);
  expect(actualCss).toStrictEqual(css);
  expect(actualScript).toStrictEqual(script);
});
