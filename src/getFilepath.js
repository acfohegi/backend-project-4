import path from 'node:path';

export default (urlString, options) => {
  const { protocol } = new URL(urlString);
  const filename = urlString
    .replace(protocol, '')
    .replace(/^\/\//, '')
    .replace(/[^0-9a-zA-Z]/g, '-');
  const dirPath = options.output ?? '.';
  return `${path.join(dirPath, filename)}.html`;
};
