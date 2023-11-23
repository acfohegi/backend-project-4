/* eslint jest/no-conditional-expect: 0 jest/no-try-expect: 0
    --------
    These rules can be disabled due to the counting of assertions in each test. */
import nock from 'nock';
import mockFs from 'mock-fs';
import path from 'node:path';
import os from 'node:os';
import { asyncAssert, mockFsBesidesNodeModules, readFixtures } from './helpers.js';
import PathsNamer from '../src/PathsNamer.js';
import FileSaver from '../src/FileSaver.js';
import PageLoader from '../src/PageLoader.js';

let fixtures;

const mockStatusCodes = (origin, codes) => {
  const mock = (statusCode) => {
    nock(origin).get(`/status/${statusCode}`).reply(statusCode);
  };
  codes.forEach((s) => mock(s));
};

beforeAll(async () => {
  fixtures = await readFixtures();
});

afterEach(() => {
  mockFs.restore();
});

test('network errors', async () => {
  const origin = 'https://httpbin.org';
  const statusCodes = [100, 101, 102, 103, 201, 202, 203, 300, 301, 302, 303, 400, 401, 402, 403,
    500, 501, 502, 503];
  mockStatusCodes(origin, statusCodes);
  mockFsBesidesNodeModules();

  const testFunc = async (statusCode) => {
    const url = `${origin}/status/${statusCode}`;
    const pageLoader = new PageLoader(url, os.tmpdir());
    try {
      await pageLoader.load();
    } catch (e) {
      expect(e.message).toMatch(`Request failed with status code ${statusCode}`);
    }
  };

  await asyncAssert(statusCodes, testFunc);
  expect.assertions(statusCodes.length);
});

test('network errors for sources', async () => {
  const { errorsHtml } = fixtures;
  const origin = 'https://httpbin.org';
  const pageLoader = new PageLoader(origin, process.cwd());
  const statusCodes = [201, 300, 404];
  nock(origin).get('/').reply(200, errorsHtml);
  mockStatusCodes(origin, statusCodes);
  mockFsBesidesNodeModules();

  try {
    await pageLoader.load();
  } catch (e) {
    expect(e.message).toMatch('Request failed');
  }

  expect.assertions(1);
});

test('file system errors', async () => {
  const {
    html, image, css, script,
  } = fixtures;

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

  const testFunc = async ({ fs, error }) => {
    try {
      await fs.save();
    } catch (e) {
      expect(e.message).toMatch(error);
    }
  };

  await asyncAssert(testData, testFunc);
  expect.assertions(3);
});
