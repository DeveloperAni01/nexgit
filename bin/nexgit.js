#!/usr/bin/env node

import { program } from 'commander';
import statusCommand from '../src/commands/status.js';
import ignoreCommand from '../src/commands/ignore.js';
import commitCommand from '../src/commands/commit.js';
import pushCommand from '../src/commands/push.js';
import pullCommand from '../src/commands/pull.js';
import { checkGitInstalled } from '../src/utils/git.js';
import branchCommand from '../src/commands/branch.js';
import switchCommand from '../src/commands/switch.js';
import mergeCommand from '../src/commands/merge.js';
import undoCommand from '../src/commands/undo.js';
import historyCommand from '../src/commands/history.js';
import diffCommand from '../src/commands/diff.js';
import explainCommand from '../src/commands/explain.js';
import langCommand from '../src/commands/lang.js';
import initCommand from '../src/commands/init.js';
import setupCommand from '../src/commands/setup.js';

// ✅ Check Git installed FIRST
const gitInstalled = await checkGitInstalled();
if (!gitInstalled) process.exit(1);

program
    .name('nexgit')
    .description('Git for Humans — AI powered Git assistant')
    .version('1.0.0');

program
    .command('status')
    .description('Show your git status in plain English')
    .action(statusCommand);

program
    .command('ignore')
    .description('Auto fix your .gitignore file')
    .action(ignoreCommand);

program
    .command('push')
    .description('Safely push to GitHub')
    .action(pushCommand);

program
    .command('pull')
    .description('Safely pull latest changes from GitHub')
    .action(pullCommand);

program
    .command('branch [name]')
    .description('Create or list branches')
    .action(branchCommand);

program
    .command('switch [branch]')
    .description('Switch to another branch')
    .action(switchCommand);

program
    .command('merge [branch]')
    .description('Safely merge branches')
    .action(mergeCommand);

program
    .command('undo')
    .description('Safely undo git actions')
    .action(undoCommand);

program
    .command('history')
    .description('Show commit history in plain English')
    .action(historyCommand);

program
    .command('diff')
    .description('Show what changed in your files')
    .action(diffCommand);
program
    .command('explain [error]')
    .description('Explain git errors in plain English')
    .action(explainCommand);

program
    .command('lang')
    .description('Change NexGit language')
    .action(langCommand);

program
    .command('init')
    .description('Initialize a new Git repo with smart .gitignore')
    .action(initCommand);

program
    .command('setup')
    .description('Configure NexGit settings and GitHub connection')
    .action(setupCommand);

program
    .command('commit [message]')
    .description('Smart commit with safety checks')
    .action(commitCommand);


program.parse(process.argv);