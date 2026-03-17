
'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function diffCommand() {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Nothing to diff
        if (repo.modified.length === 0 &&
            repo.staged.length === 0) {
            console.log(
                boxen(
                    chalk.green('✨ Nothing changed!\n\n') +
                    chalk.gray('No modified or staged files found.'),
                    { padding: 1, borderColor: 'green', title: '🤖 NexGit Diff', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Build choices based on state
        const choices = [];

        if (repo.modified.length > 0) {
            choices.push({
                name: `📝 Show unstaged changes (${repo.modified.length} files)`,
                value: 'unstaged'
            });
        }

        if (repo.staged.length > 0) {
            choices.push({
                name: `✅ Show staged changes (${repo.staged.length} files)`,
                value: 'staged'
            });
        }

        if (repo.modified.length > 0 && repo.staged.length > 0) {
            choices.push({
                name: `📊 Show all changes`,
                value: 'all'
            });
        }

        choices.push({ name: '❌ Cancel', value: 'cancel' });

        const action = await select({
            message: 'What do you want to see?',
            choices
        });

        if (action === 'cancel') {
            messages.info('Diff cancelled.', 'Nexgit Diff');
            return;
        }

        let diff = '';

        if (action === 'unstaged') {
            diff = await gitUtils.git.diff();
        } else if (action === 'staged') {
            diff = await gitUtils.git.diff(['--staged']);
        } else if (action === 'all') {
            diff = await gitUtils.git.diff(['HEAD']);
        }

        if (!diff) {
            console.log(
                boxen(
                    chalk.green('✨ No differences found!\n\n') +
                    chalk.gray('Files may be identical to last commit.'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Diff', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Parse and colorize diff
        const lines = diff.split('\n');
        let output = '';
        let fileCount = 0;

        lines.forEach(line => {
            if (line.startsWith('diff --git')) {
                // File header
                const fileName = line.split(' b/')[1] || line;
                fileCount++;
                output += chalk.cyan.bold(`\n📄 ${fileName}\n`);
                output += chalk.gray('─'.repeat(50) + '\n');
            } else if (line.startsWith('+++') || line.startsWith('---')) {
                // Skip file markers
            } else if (line.startsWith('@@')) {
                // Line numbers
                output += chalk.magenta(`${line}\n`);
            } else if (line.startsWith('+')) {
                // Added lines
                output += chalk.green(`${line}\n`);
            } else if (line.startsWith('-')) {
                // Removed lines
                output += chalk.red(`${line}\n`);
            } else {
                // Context lines
                output += chalk.gray(`${line}\n`);
            }
        });

        // Summary at top
        const summary =
            chalk.cyan.bold(`📊 Diff Summary\n\n`) +
            chalk.white(`📄 Files changed: ${fileCount}\n`) +
            chalk.green(`+ Added lines: ${lines.filter(l => l.startsWith('+')).length}\n`) +
            chalk.red(`- Removed lines: ${lines.filter(l => l.startsWith('-')).length}\n\n`) +
            chalk.gray('💡 Tip: Green = added, Red = removed');

        console.log(
            boxen(summary, {
                padding: 1,
                borderColor: 'cyan',
                title: '🤖 Nexgit Diff',
                titleAlignment: 'center'
            })
        );

        // Show actual diff
        console.log(output);

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default diffCommand;