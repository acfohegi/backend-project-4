import mockFs from 'mock-fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (fixtureName) => path.join(__dirname, 'fixtures', fixtureName);

const nodeModulesPath = path.resolve(__dirname, '../node_modules');
const nodeModulesContent = mockFs.load(nodeModulesPath);
const mockFsBesidesNodeModules = () => mockFs({ [nodeModulesPath]: nodeModulesContent });

export { mockFsBesidesNodeModules, getFixturePath };
