import mockFs from 'mock-fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (fixtureName) => path.join(__dirname, 'fixtures', fixtureName);

const nodeModulesPath = path.resolve(__dirname, '../node_modules');
const nodeModulesContent = mockFs.load(nodeModulesPath);
const mockFsBesidesNodeModules = () => mockFs({ [nodeModulesPath]: nodeModulesContent });

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

export { mockFsBesidesNodeModules, getFixturePath, readFixtures };
