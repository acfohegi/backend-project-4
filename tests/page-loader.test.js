import nock from 'nock';
import getPage from '../src/getPage.js';
import PathsNamer from '../src/PathNamer.js';

nock('https://duckduckgo.com')
  .get('/about')
  .reply(200, 'htmlContent');

test('getPage', async () => {
  const page = await getPage('https://duckduckgo.com/about');
  expect(page).toBe('htmlContent');
});

test('PathNamer', () => {
  const url = 'https://www.amazon.com/s?k=k%26r&rh=n%3A55&dc&ds=v1%3A6NVfL0jgarZnMHI#-';
  const normalizedUrl = 'www-amazon-com-s-k-k-26r-rh-n-3A55-dc-ds-v1-3A6NVfL0jgarZnMHI--';
  const pathNamer = new PathsNamer(url, { output: process.cwd() });
  const htmlFilePath = pathNamer.getHtmlFilePath();
  const sourcesDirPath = pathNamer.getSourcesDirPath();
  const sourceFileName = pathNamer.getSourceFileName('assets/new_dir/background.png');

  expect(htmlFilePath).toBe(`${process.cwd()}/${normalizedUrl}.html`);
  expect(sourcesDirPath).toBe(`${normalizedUrl}_files`);
  expect(sourceFileName).toBe('www-amazon-com-assets-new-dir-background.png');
});
