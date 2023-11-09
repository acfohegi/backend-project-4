import os from 'node:os';
import nock from 'nock';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { getFixturePath } from './helpers.js';
import SourceGetter from '../src/SourceGetter.js';

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
