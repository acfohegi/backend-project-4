import os from 'node:os';
import { readFile } from 'node:fs/promises';
import { getFixturePath } from './helpers.js';
import PathsNamer from '../src/PathsNamer.js';
import SourcesProcessor from '../src/SourcesProcessor.js';

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
        originalPath: 'https://ru.hexlet.io/courses',
        filepath: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
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
