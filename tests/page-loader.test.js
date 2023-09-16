import nock from 'nock';
import mockFs from 'mock-fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import PathsNamer from '../src/PathsNamer.js';
import SourceGetter from '../src/SourceGetter.js';
import SourcesProcessor from '../src/SourcesProcessor.js';
import FileSaver from '../src/FileSaver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (fixtureName) => path.join(__dirname, 'fixtures', fixtureName);

afterEach(() => {
  mockFs.restore();
});

test('SourceGetter', async () => {
  const sources = {
    html: 'html content',
    imgs: [{
      originalPath: 'https://ru.hexlet.io/assets/professions/nodejs.png',
      filepath: `${os.tmpdir()}/ru-hexlet-io-assets-professions-nodejs.png`,
    }],
    links: [{
      originalPath: 'https://ru.hexlet.io/assets/application.css',
      filepath: `${os.tmpdir()}/ru-hexlet-io-assets-application.css`,
    }],
    scripts: [{
      originalPath: 'https://ru.hexlet.io/packs/js/runtime.js',
      filepath: `${os.tmpdir()}/ru-hexlet-io-packs-js-runtime.js`,
    }],
  };

  nock('https://duckduckgo.com')
    .get('/about')
    .reply(200, sources.html.toString());

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, createReadStream(getFixturePath('nodejs.png')));

  nock('https://ru.hexlet.io')
    .get('/assets/application.css')
    .reply(200, createReadStream(getFixturePath('application.css')));

  nock('https://ru.hexlet.io')
    .get('/packs/js/runtime.js')
    .reply(200, createReadStream(getFixturePath('runtime.js')));

  const actualHtml = await SourceGetter.getHtml('https://duckduckgo.com/about');
  await expect(actualHtml).toBe(sources.html);

  await SourceGetter.getSource(sources.imgs[0].originalPath, sources.imgs[0].filepath);
  const imageFixture = await readFile(getFixturePath('nodejs.png'));
  const actualImage = await readFile(sources.imgs[0].filepath);
  expect(actualImage).toStrictEqual(imageFixture);

  await SourceGetter.getSource(sources.links[0].originalPath, sources.links[0].filepath);
  const cssFixture = await readFile(getFixturePath('application.css'));
  const actualCss = await readFile(sources.links[0].filepath);
  expect(actualCss).toStrictEqual(cssFixture);

  await SourceGetter.getSource(sources.scripts[0].originalPath, sources.scripts[0].filepath);
  const scriptFixture = await readFile(getFixturePath('runtime.js'));
  const actualScript = await readFile(sources.scripts[0].filepath);
  expect(actualScript).toStrictEqual(scriptFixture);
});

test('PathsNamer', () => {
  const url = 'https://www.amazon.com/s?k=k%26r&rh=n%3A55&dc&ds=v1%3A6NVfL0jgarZnMHI#-';
  const normalizedUrl = 'www-amazon-com-s-k-k-26r-rh-n-3A55-dc-ds-v1-3A6NVfL0jgarZnMHI--';
  const pathsNamer = new PathsNamer(url, { output: process.cwd() });
  const htmlFilePath = pathsNamer.getHtmlFilePath();
  const sourcesDirName = pathsNamer.getSourcesDirName();
  const sourceFileName = pathsNamer.getSourceFileName('assets/new_dir/background.png');

  expect(htmlFilePath).toBe(`${process.cwd()}/${normalizedUrl}.html`);
  expect(sourcesDirName).toBe(`${normalizedUrl}_files`);
  expect(sourceFileName).toBe('www-amazon-com-assets-new-dir-background.png');
});

test('SourcesProcessor', async () => {
  const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'), 'utf-8');
  const sources = {
    html: await readFile(getFixturePath('ru-hexlet-io-courses-processed.html'), 'utf-8'),
    imgs: [{
      originalPath: 'https://ru.hexlet.io/assets/professions/nodejs.png',
      filepath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
    }],
    links: [
      {
        originalPath: 'https://ru.hexlet.io/assets/application.css',
        filepath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
      },
      {
        originalPath: "https://ru.hexlet.io/courses",
        filepath: "ru-hexlet-io-courses_files/ru-hexlet-io-courses.html",
      },
    ],
    scripts: [{
      originalPath: 'https://ru.hexlet.io/packs/js/runtime.js',
      filepath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
    }],
  };

  const normalizeHtml = (rawHtml) => rawHtml
    .split('\n')
    .map((line) => line.trim())
    .join('');

  const pn = new PathsNamer('https://ru.hexlet.io/courses', { output: os.tmpdir() });
  const sp = new SourcesProcessor(html, pn);
  const processed = sp.process();

  expect(normalizeHtml(processed.html)).toBe(normalizeHtml(sources.html));
  expect(processed.imgs).toEqual(sources.imgs);
  expect(processed.links).toEqual(sources.links);
  expect(processed.scripts).toEqual(sources.scripts);
});

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

  mockFs();

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
      originalPath: pn.getSourceUrl(imgSrc),
      filepath: path.join(srcDir, imgFilename),
    }],
    links: [{
      originalPath: pn.getSourceUrl(linkSrc),
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
