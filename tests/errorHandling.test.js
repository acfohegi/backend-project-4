import nock from 'nock';
import mockFs from 'mock-fs';
import path from 'node:path';
import os from 'node:os';
import { readFile } from 'node:fs/promises';
import { getFixturePath, mockFsBesidesNodeModules } from './helpers.js';
import PathsNamer from '../src/PathsNamer.js';
import FileSaver from '../src/FileSaver.js';
import PageLoader from '../src/PageLoader.js';

afterEach(() => {
  mockFs.restore();
});

const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'));
const image = await readFile(getFixturePath('nodejs.png'));
const css = await readFile(getFixturePath('application.css'));
const script = await readFile(getFixturePath('runtime.js'));

test('network errors', async () => {
  mockFsBesidesNodeModules();
  const origin = 'https://httpbin.org';
  const mock = (statusCode) => {
    nock(origin).get(`/status/${statusCode}`).reply(statusCode);
  };

  const statusCodes = [100, 101, 102, 103, 201, 202, 203, 300, 301, 302, 303, 400, 401, 402, 403,
    500, 501, 502, 503];
  statusCodes.forEach((s) => mock(s));

  // const runTest = async (statusCode) => {
  //   const url = `${origin}/status/${statusCode}`;
  //   const pageLoader = new PageLoader(url, os.tmpdir());
  //   try {
  //     await pageLoader.load();
  //   } catch (e) {
  //     expect(e.message).toMatch(`Request failed with status code ${statusCode}`);
  //   }
  // };

  // statusCodes.forEach(async (s) => {
  //  await runTest(s);
  // });

  // expect.assertions(statusCodes.length);

  // TODO: fix test running in forEach.
  // the code below is the same besides it has no wrapper.

  const url = `${origin}/status/201`;
  const pageLoader = new PageLoader(url, os.tmpdir());

  try {
    await pageLoader.load();
  } catch (e) {
    expect(e.message).toMatch('Request failed with status code 201');
  }

  expect.assertions(1);
});

const document = await readFile(getFixturePath('httpbin-org-errors.html'));

test('network errors for sources', async () => {
  mockFsBesidesNodeModules();
  const origin = 'https://httpbin.org';
  const statusCodes = [201, 300, 404];

  const mock = (statusCode) => {
    nock(origin).get(`/status/${statusCode}`).reply(statusCode, '');
  };

  nock(origin).get('/').reply(200, document);
  statusCodes.forEach((s) => mock(s));
  const pageLoader = new PageLoader(origin, process.cwd());

  try {
    await pageLoader.load();
  } catch (e) {
    expect(e.message).toMatch('Request failed');
  }

  expect.assertions(1);
});

test('file system errors', async () => {
  const mockSources = (pathname, filename, src) => {
    nock('https://ru.hexlet.io')
      .get(pathname)
      .times(3)
      .reply(200, src, {
        'content-type': 'application/octet-stream',
        'content-length': src.length,
        'content-disposition': `attachment; filename=${filename}`,
      });
  };

  mockSources('/assets/professions/nodejs.png', 'nodejs.png', image);
  mockSources('/assets/application.css', 'nodejs.png', css);
  mockSources('/packs/js/runtime.js', 'nodejs.png', script);

  const filesystem = {
    '/file': mockFs.file(),
    '/read_only_dir': mockFs.directory({
      mode: 444,
    }),
  };

  mockFsBesidesNodeModules();
  mockFs(filesystem);

  const url = 'https://ru.hexlet.io/courses';

  const pn1 = new PathsNamer(url, { output: '/imaginary_dir' });
  const pn2 = new PathsNamer(url, { output: '/file' });
  const pn3 = new PathsNamer(url, { output: '/read_only_dir' });

  const prepareSources = (pn) => {
    const srcDir = pn.getSourcesDirName();
    const imgSrc = '/assets/professions/nodejs.png';
    const imgFilename = pn.getSourceFileName(imgSrc);
    const linkSrc = '/assets/application.css';
    const linkFilename = pn.getSourceFileName(linkSrc);
    const scriptSrc = '/packs/js/runtime.js';
    const scriptFilename = pn.getSourceFileName(scriptSrc);

    return {
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
  };

  const testData = [
    {
      fs: new FileSaver(prepareSources(pn1), pn1),
      error: 'no such file or directory',
    },
    {
      fs: new FileSaver(prepareSources(pn2), pn2),
      error: 'not a directory',
    },
    {
      fs: new FileSaver(prepareSources(pn3), pn3),
      error: 'permission denied',
    },
  ];

  // const runTest = async ({ fs, error }) => {
  //   try {
  //     await fs.save();
  //   } catch (e) {
  //     expect(e.message).toMatch(error);
  //   }
  // };

  // testData.forEach((data) => runTest(data));
  // expect.assertions(3);
  // TODO: fix running test in forEach.
  // the code below is the same besides it has no wrapper.

  try {
    await testData[0].fs.save();
  } catch (e) {
    expect(e.message).toMatch(testData[0].error);
  }

  try {
    await testData[1].fs.save();
  } catch (e) {
    expect(e.message).toMatch(testData[1].error);
  }

  try {
    await testData[2].fs.save();
  } catch (e) {
    expect(e.message).toMatch(testData[2].error);
  }

  expect.assertions(3);
});
