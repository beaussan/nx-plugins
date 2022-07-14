import { ServeExecutorSchema } from './schema';
import { ExecutorContext } from '@nrwl/devkit';
import * as path from 'path';
// import { exec } from 'node:child_process';
// import { exec } from '@actions/exec';
import { upAll } from 'docker-compose';
import { spawnAsync, spawnDetached } from '../../spawn';

export default async function* runExecutor(
  options: ServeExecutorSchema,
  ctx: ExecutorContext
) {
  console.log('Executor ran for Serve', options);
  console.log('Executor ran for Serve', ctx);
  console.log('Executor ran for Serve', ctx.workspace.projects);
  console.log(
    'Executor ran for Serve',
    ctx.workspace.projects[ctx.projectName]
  );

  const execFolder = path.join(
    ctx.cwd,
    ctx.workspace.projects[ctx.projectName].sourceRoot
  );

  try {
    await spawnDetached('docker', ['compose', 'up'], { cwd: execFolder });
    yield {
      success: true,
    };

    console.log('------------------------aaaaaaaaaaaaa-------------');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // await new Promise<{ success: boolean }>(() => {});
  } catch (e) {
    console.error(e);
    console.log('------------------------BBBBBBBBBBB-------------');
    console.log('------------------------BBBBBBBBBBB-------------');
    return {
      success: false,
    };
  }
  /*
  await upAll({ cwd: execFolder, log: true });

  return {
    success: exitCode === 0,
  };

 */
}
