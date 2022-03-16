import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);

export function getAllComponents(metadata) {
  const allComponents = [];

  metadata.modules.map(module => {
    module.declarations?.map(declaration => {
      if (declaration.customElement) {
        const component = declaration;
        const modulePath = module.path;

        if (component) {
          allComponents.push(Object.assign(component, { modulePath }));
        }
      }
    });
  });

  return allComponents;
}

export function getPathToModule(packageName) {
  // we look for the package.json in a package
  const packageJson = `${packageName}/package.json`;

  try {
    // try and resolve the file
    const packageJsonPath = require.resolve(packageJson);

    // get the root folder
    const packagePath = path.dirname(packageJsonPath);

    return packagePath;
  } catch (err) {
    console.log(`Failed to find module ${packageName} - ${err instanceof Error ? err.message : err.toString() }`);
    return null;
  }
}
