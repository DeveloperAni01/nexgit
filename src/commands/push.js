'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';
import { confirm } from '@inquirer/prompts';

async function pushCommand() {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Check remote exists
        const remotes = await gitUtils.checkRemote();
        if (!remotes) return;

        // Check if no commits yet
        if (!repo.hasCommits) {
            messages.noCommits();
            return;
        }

        // Check if nothing to push
        if (repo.ahead === 0) {
            console.log(
                boxen(
                    chalk.yellow('🤔 Nothing to push bro!\n\n') +
                    chalk.gray('Your GitHub is already up to date.\n') +
                    chalk.gray('Make some changes and commit first!'),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '🤖 NexGit Push',
                        titleAlignment: 'center'
                    }
                )
            );
            return;
        }

        // Check uncommitted changes
        if (repo.modified.length > 0 || repo.untracked.length > 0) {
            console.log(
                boxen(
                    chalk.yellow('⚠️  You have uncommitted changes!\n\n') +
                    chalk.white('These will NOT be pushed:\n') +
                    repo.modified.map(f => chalk.yellow(`   ~ ${f}`)).join('\n') +
                    chalk.gray('\n\nTip: Run nexgit commit first!'),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '⚠️  Nexgit Warning',
                        titleAlignment: 'center'
                    }
                )
            );

            const proceed = await confirm({
                message: 'Push anyway without these files?',
                default: false
            });

            if (!proceed) {
                messages.info('Push cancelled. Run nexgit commit first!', 'NexGit Push');
                return;
            }
        }

        // Warn if pushing to main or master
        if (repo.branch === 'main' || repo.branch === 'master') {
            console.log(
                boxen(
                    chalk.yellow(`⚠️  You are pushing directly to "${repo.branch}"!\n\n`) +
                    chalk.white('This is okay for personal projects.\n') +
                    chalk.white('But in team projects always use feature branches!\n\n') +
                    chalk.gray('Tip: nexgit branch "feature-name"'),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '⚠️  NexGit Warning',
                        titleAlignment: 'center'
                    }
                )
            );

            const proceed = await confirm({
                message: `Push to "${repo.branch}" anyway?`,
                default: true
            });


            if (!proceed) {
                messages.info('Push cancelled.', 'NexGit Push');
                return;
            }
        }

        // Show pushing message
        console.log(
            boxen(
                chalk.cyan(`🚀 Pushing "${repo.branch}" to GitHub...\n`) +
                chalk.gray(`   ${repo.ahead} commit(s) will be pushed`),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    title: '🤖 Nexgit Push',
                    titleAlignment: 'center'
                }
            )
        );

        // Do the push
        const pushed = await gitUtils.push(repo.branch);
        if (!pushed) return;

        console.log(
            boxen(
                chalk.green.bold('✅ Pushed successfully!\n\n') +
                chalk.white(`🌿 Branch: ${repo.branch}\n`) +
                chalk.white(`📦 Commits pushed: ${repo.ahead}\n\n`) +
                chalk.gray('Check your GitHub repo to see the changes!'),
                {
                    padding: 1,
                    borderColor: 'green',
                    title: '🤖 Nexgit Push',
                    titleAlignment: 'center'
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default pushCommand;