import nock from 'nock';
import getPage from '../src/getPage.js';
import getFilepath from '../src/getFilepath.js';

nock('https://duckduckgo.com')
  .get('/about')
  .reply(200, 'htmlContent');

test('getPage', async () => {
  const page = await getPage('https://duckduckgo.com/about');
  expect(page).toBe('htmlContent');
});

test('getFilepath', () => {
  expect(getFilepath('https://duckduckgo.com/about', { output: process.cwd() }))
    .toBe(`${process.cwd()}/duckduckgo-com-about.html`);
  expect(getFilepath('https://www.amazon.com/s?k=k%26r&rh=n%3A55&dc&ds=v1%3A6NVfL0jgarZnMHI#-', { output: './' }))
    .toBe('www-amazon-com-s-k-k-26r-rh-n-3A55-dc-ds-v1-3A6NVfL0jgarZnMHI--.html');
});
