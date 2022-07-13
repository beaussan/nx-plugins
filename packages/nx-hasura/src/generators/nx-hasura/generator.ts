import {
  addDependenciesToPackageJson,
  installPackagesTask,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { NxHasuraGeneratorSchema } from './schema';
import { v4 as uuid } from 'uuid';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

interface NormalizedSchema extends NxHasuraGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: NxHasuraGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    webhookToken: uuid(),
    actionToken: uuid(),
    adminSecret: uuid(),
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'hasura-metadata-v3'),
    options.projectRoot,
    templateOptions
  );
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'configs'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (tree: Tree, options: NxHasuraGeneratorSchema) {
  // updateWorkspaceLayoutExtra(tree);

  const normalizedOptions = normalizeOptions(tree, options);

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}`,
    targets: {},
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return runTasksInSerial(
    addDependenciesToPackageJson(tree, {}, { 'hasura-cli': '2.7.0' })
  );
}
