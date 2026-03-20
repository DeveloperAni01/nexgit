'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';
import { confirm } from '@inquirer/prompts';
import fs from 'fs';
import path from 'path';
import detectProjectType from '../utils/detector.js';

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

        // Pre-push scan — check if .gitignore covers all detected stacks
        const cwd = process.cwd();
        const gitignorePath = path.join(cwd, '.gitignore');
        const project = detectProjectType(cwd);

        if (project.detectedStacks.length > 0) {
            const existingGitignore = fs.existsSync(gitignorePath)
                ? fs.readFileSync(gitignorePath, 'utf8')
                : '';

            const stackPatterns = {
                'Node.js': 'node_modules',
                '.NET': 'bin/',
                'Angular': '.angular',
                'Python': '__pycache__',
                'Java': 'target/',
                'Flutter': '.dart_tool',
                'Ruby': 'vendor/bundle',
                'PHP': 'vendor/',
                'Rust': 'target/',
                'Go': 'go.mod',
            };

            const uncoveredStacks = project.detectedStacks.filter(stack => {
                const checkPattern = stackPatterns[stack];
                return checkPattern && !existingGitignore.includes(checkPattern);
            });

            if (uncoveredStacks.length > 0) {
                console.log(
                    boxen(
                        chalk.red.bold('🚨 .gitignore is outdated!\n\n') +
                        chalk.white('These stacks are NOT covered:\n') +
                        uncoveredStacks.map(s => chalk.red(`   ❌ ${s}`)).join('\n') +
                        chalk.yellow('\n\nYour files might accidentally get pushed!\n\n') +
                        chalk.white('Fix it:\n') +
                        chalk.cyan('   nexgit ignore\n') +
                        chalk.gray('Then run nexgit push again!'),
                        {
                            padding: 1,
                            borderColor: 'red',
                            title: '⚠️  NexGit Warning',
                            titleAlignment: 'center'
                        }
                    )
                );

                const proceed = await confirm({
                    message: 'Push anyway with outdated .gitignore?',
                    default: false
                });

                if (!proceed) {
                    messages.info('Push cancelled. Run nexgit ignore first!', 'NexGit Push');
                    return;
                }
            }
        }

        // Check uncommitted changes FIRST
        if (repo.modified.length > 0 || repo.untracked.length > 0) {
            console.log(
                boxen(
                    chalk.yellow('⚠️  You have uncommitted changes!\n\n') +
                    chalk.white('These will NOT be pushed:\n') +
                    [...repo.modified, ...repo.untracked].map(f => chalk.yellow(`   ~ ${f}`)).join('\n') +
                    chalk.gray('\n\nTip: Run nexgit commit first!'),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '⚠️  NexGit Warning',
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

        // Check if nothing to push
        const hasNoTracking = !repo.status.tracking;
        if (repo.ahead === 0 && !hasNoTracking) {
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
                    title: '🤖 NexGit Push',
                    titleAlignment: 'center'
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default pushCommand;