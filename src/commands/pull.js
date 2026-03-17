'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select, confirm, input } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function pullCommand() {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Check remote exists
        const remotes = await gitUtils.checkRemote();
        if (!remotes) return;

        // Check no commits yet
        if (!repo.hasCommits) {
            messages.noCommits();
            return;
        }

        const branch = repo.branch;

        // Handle uncommitted changes
        if (repo.modified.length > 0 ||
            repo.staged.length > 0 ||
            repo.untracked.length > 0) {

            console.log(
                boxen(
                    chalk.yellow('⚠️  You have uncommitted changes!\n\n') +
                    chalk.white('Pulling now might cause conflicts!\n\n') +
                    chalk.cyan('What are these changes?\n') +
                    (repo.staged.length > 0
                        ? chalk.green(`   Staged: ${repo.staged.length} file(s)\n`)
                        : '') +
                    (repo.modified.length > 0
                        ? chalk.yellow(`   Modified: ${repo.modified.length} file(s)\n`)
                        : '') +
                    (repo.untracked.length > 0
                        ? chalk.gray(`   Untracked: ${repo.untracked.length} file(s)\n`)
                        : ''),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '⚠️  NexGit Warning',
                        titleAlignment: 'center'
                    }
                )
            );

            // Ask user what to do
            const action = await select({
                message: 'What do you want to do?',
                choices: [
                    { name: '✅ Commit first then pull (recommended)', value: 'commit' },
                    { name: '📦 Stash changes, pull, then restore (smart)', value: 'stash' },
                    { name: '⚠️  Pull anyway (risky)', value: 'pull' },
                    { name: '❌ Cancel', value: 'cancel' }
                ]
            });

            if (action === 'cancel') {
                messages.info('Pull cancelled. No changes made.', 'NexGit Pull');
                return;
            }

            if (action === 'commit') {
                // Ask for commit message
                const commitMessage = await input({
                    message: 'Enter commit message:',
                    default: 'chore: save changes before pull'
                });

                await gitUtils.stageAll();
                const committed = await gitUtils.commit(commitMessage);
                if (!committed) return;

                messages.success('✅ Committed! Now pulling...', 'NexGit Pull');
            }

            if (action === 'stash') {
                const stashed = await gitUtils.stash();
                if (!stashed) return;
                messages.success('📦 Changes stashed! Now pulling...', 'NexGit Pull');
            }
        }

        // Show pulling message
        console.log(
            boxen(
                chalk.cyan(`⬇️  Pulling latest changes from GitHub...\n`) +
                chalk.gray(`   Branch: ${branch}`),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    title: '🤖 NexGit Pull',
                    titleAlignment: 'center'
                }
            )
        );

        // Do the pull
        const result = await gitUtils.pull(branch);
        if (!result) return;

        // Nothing new
        if (result.summary.changes === 0 &&
            result.summary.insertions === 0 &&
            result.summary.deletions === 0) {
            console.log(
                boxen(
                    chalk.green('✅ Already up to date!\n\n') +
                    chalk.gray('No new changes from GitHub.'),
                    {
                        padding: 1,
                        borderColor: 'green',
                        title: '🤖 Nexgit Pull',
                        titleAlignment: 'center'
                    }
                )
            );
        } else {
            // Show what changed
            let output = chalk.green.bold('✅ Pulled successfully!\n\n');
            output += chalk.white(`🌿 Branch: ${branch}\n`);
            output += chalk.white(`📝 Files changed: ${result.summary.changes}\n`);
            output += chalk.green(`   + Insertions: ${result.summary.insertions}\n`);
            output += chalk.red(`   - Deletions: ${result.summary.deletions}\n`);

            if (result.files.length > 0) {
                output += chalk.white.bold('\n📁 Updated files:\n');
                result.files.forEach(f => {
                    output += chalk.cyan(`   ~ ${f}\n`);
                });
            }

            console.log(
                boxen(output, {
                    padding: 1,
                    borderColor: 'green',
                    title: '🤖 Nexgit Pull',
                    titleAlignment: 'center'
                })
            );
        }

        // If stash was used restore it
        const stashList = await gitUtils.git.stash(['list']);
        if (stashList && stashList.includes('stash@{0}')) {

            const restore = await confirm({
                message: 'Restore your stashed changes?',
                default: true
            });


            if (restore) {
                const popped = await gitUtils.stashPop();
                if (popped) {
                    messages.success('✅ Stashed changes restored!', 'Nexgit Pull');
                }
            }
        }

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default pullCommand;