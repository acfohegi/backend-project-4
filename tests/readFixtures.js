import { readFile } from 'fs/promises';
import { getFixturePath } from './helpers.js';

const readFixtures = async () => {
  const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'));
  const image = await readFile(getFixturePath('nodejs.png'));
  const css = await readFile(getFixturePath('application.css'));
  const script = await readFile(getFixturePath('runtime.js'));
  const errorsHtml = await readFile(getFixturePath('httpbin-org-errors.html'));

  return {
    html, image, css, script, errorsHtml,
  };
};

export default readFixtures;
