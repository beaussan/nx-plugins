import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('nx-hasura e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@beaussan/nx-hasura', 'dist/packages/nx-hasura');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  describe('nx-hasura generator', function () {
    it.each([
      'config.yaml',
      '.env',
      'docker-compose.yml',
      'Dockerfile',
      'metadata/version.yaml',
      'metadata/databases/databases.yaml',
      'metadata/databases/default/tables/tables.yaml',
    ])(
      'should generate %s in the project files',
      async (name) => {
        const project = uniq('nx-hasura');
        await runNxCommandAsync(
          `generate @beaussan/nx-hasura:nx-hasura ${project}`
        );

        expect(() => checkFilesExist(`apps/${project}/${name}`)).not.toThrow();
      },
      120000
    );

    describe('--directory', () => {
      it('should create the files in the specified directory', async () => {
        const project = uniq('nx-hasura');
        await runNxCommandAsync(
          `generate @beaussan/nx-hasura:nx-hasura ${project} --directory subdir`
        );
        expect(() =>
          checkFilesExist(`apps/subdir/${project}/config.yaml`)
        ).not.toThrow();
      }, 120000);
    });

    describe('--tags', () => {
      it('should add tags to the project', async () => {
        const projectName = uniq('nx-hasura');
        ensureNxProject('@beaussan/nx-hasura', 'dist/packages/nx-hasura');
        await runNxCommandAsync(
          `generate @beaussan/nx-hasura:nx-hasura ${projectName} --tags e2etag,e2ePackage`
        );
        const project = readJson(`apps/${projectName}/project.json`);
        expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
      }, 120000);
    });
  });

  // Since we don't have the executor yet
  it.skip('should be able to run the build command in an nx-hasura generated app', async () => {
    const project = uniq('nx-hasura');
    await runNxCommandAsync(
      `generate @beaussan/nx-hasura:nx-hasura ${project}`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);
});
