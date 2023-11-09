import PathsNamer from '../src/PathsNamer.js';

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
