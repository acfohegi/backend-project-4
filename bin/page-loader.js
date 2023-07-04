#!/usr/bin/env node

import { Command } from 'commander';
import { writeFile } from 'node:fs';
import getPage from '../src/getPage.js';
import getFilepath from '../src/getFilepath.js';

const program = new Command();

program
  .name('page-loader')
  .description('Page loader utility')
  .version('1.0.0');

program
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .argument('<url>')
  .action((url, options) => {
    const filepath = getFilepath(url, options);
    getPage(url)
      .then((html) => writeFile(filepath, html, (err) => {
        if (err) {
          throw new Error(err);
        }
        console.log(filepath);
      }));
  });

program.parse();
