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
})

test('SourceGetter', async () => {
  const html = 'html content'
  const imgPaths = {
    originalPath: 'https://ru.hexlet.io/assets/professions/nodejs.png',
    filepath: `${os.tmpdir()}/ru-hexlet-io-assets-professions-nodejs.png`,
  };

  nock('https://duckduckgo.com')
    .get('/about')
    .reply(200, html);

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, createReadStream(getFixturePath('nodejs.png')));

  const actualHtml = await SourceGetter.getHtml('https://duckduckgo.com/about');
  await expect(actualHtml).toBe(html);

  const imageStream = await SourceGetter.getImg(imgPaths.originalPath, imgPaths.filepath);
  const actualImagePath = imageStream.path;
  const imageFixture = await readFile(getFixturePath('nodejs.png'));
  const actualImage = await readFile(actualImagePath);
  await expect(actualImage).toStrictEqual(imageFixture);
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
  const processedHtml = await readFile(getFixturePath('ru-hexlet-io-courses-processed.html'), 'utf-8');
  const imgs = [{
    originalPath: 'https://ru.hexlet.io/assets/professions/nodejs.png',
    filepath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  }];

  const normalizeHtml = (html) => html
    .split('\n')
    .map((line) => line.trim())
    .join('');

  const pn = new PathsNamer('https://ru.hexlet.io/courses', { output: os.tmpdir() });
  const sp = new SourcesProcessor(html, pn);
  const processed = sp.process()

  expect(normalizeHtml(processed.html)).toBe(normalizeHtml(processedHtml));
  expect(processed.imgs).toEqual(imgs);
});

const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'));
const image = await readFile(getFixturePath('nodejs.png'));

test('FileSaver', async () => {
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, image, {
    'content-type': 'application/octet-stream',
    'content-length': image.length,
    'content-disposition': 'attachment; filename=nodejs.png',
  });

  mockFs();

  const url = 'https://ru.hexlet.io/courses';

  const pn = new PathsNamer(url, { output: process.cwd() });
  const imgSrc = '/assets/professions/nodejs.png';
  const imgDir = pn.getSourcesDirName();
  const imgFilename = pn.getSourceFileName(imgSrc);

  const imgs = [{
    originalPath: pn.getSourceUrl(imgSrc),
    filepath: path.join(imgDir, imgFilename),
  }];
  const sources = { html, imgs };
  const fs = new FileSaver(sources, pn);

  const actualHtmlPath = await fs.save();
  const actualHtml = await readFile(actualHtmlPath);
  const actualImage = await readFile(imgs[0].filepath)
  
  await expect(actualHtml).toStrictEqual(html);
  await expect(actualImage).toStrictEqual(image);
});
