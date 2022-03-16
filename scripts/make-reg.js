import commandLineArgs from 'command-line-args';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import del from 'del';
import { pascalCase } from 'pascal-case';
import prettier from 'prettier';
import prettierConfig from '../prettier.config.cjs';
import { getAllComponents } from './shared.js';

const { outdir } = commandLineArgs({ name: 'outdir', type: String });

// Make the output directory if it exists
fs.mkdirSync(outdir, { recursive: true });

// Fetch component metadata
const metadata = JSON.parse(fs.readFileSync(path.join(outdir, 'custom-elements.json'), 'utf8'));

// Wrap components
console.log('Creating auto registration wrappers...');

const components = getAllComponents(metadata);
const index = [];

components.map(component => {
  const tagWithoutPrefix = component.tagName.replace(/^sl-/, '');
  const componentDir = path.join(outdir, 'components', tagWithoutPrefix);
  const componentFile = path.join(componentDir, `${tagWithoutPrefix}.auto.js`);
  const className = component.name;

  fs.mkdirSync(componentDir, { recursive: true });

  const source = prettier.format(
    `
      import { customElement } from 'lit/decorators.js';
      import { ${className} } from './${tagWithoutPrefix}.js'
      customElement('${component.tagName}')(${className});
      export * from './${tagWithoutPrefix}.js';
    `,
    Object.assign(prettierConfig, {
      parser: 'babel-ts'
    })
  );

  fs.writeFileSync(componentFile, source, 'utf8');
});

console.log(chalk.cyan(`\nComponents have been wrapped for Auto Registration! 📦\n`));
