'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select, confirm } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function mergeCommand(branchName) {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Get all branches
        const branches = await gitUtils.git.branch();
        const allBranches = branches.all.filter(b => !b.includes('remotes/'));
        const otherBranches = allBranches.filter(b => b !== repo.branch);

        // No branch provided → show list
        if (!branchName) {
            if (otherBranches.length === 0) {
                console.log(
                    boxen(
                        chalk.yellow('⚠️  No other branches to merge!\n\n') +
                        chalk.gray('Create one first:\n') +
                        chalk.cyan('  nexgit branch "feature-name"'),
                        { padding: 1, borderColor: 'yellow', title: '🤖 NexGit Merge', titleAlignment: 'center' }
                    )
                );
                return;
            }

            branchName = await select({
                message: 'Which branch do you want to merge INTO current branch?',
                choices: otherBranches.map(b => ({ name: b, value: b }))
            });
        }

        // Check branch exists
        if (!allBranches.includes(branchName)) {
            console.log(
                boxen(
                    chalk.red(`❌ Branch "${branchName}" does not exist!\n\n`) +
                    chalk.yellow('Available branches:\n') +
                    allBranches.map(b => chalk.cyan(`   • ${b}`)).join('\n'),
                    { padding: 1, borderColor: 'red', title: '🤖 NexGit Merge', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Warn if uncommitted changes exist
        if (repo.modified.length > 0 ||
            repo.staged.length > 0) {
            console.log(
                boxen(
                    chalk.red('🚨 STOP! You have uncommitted changes!\n\n') +
                    chalk.white('Merging with uncommitted changes is DANGEROUS!\n\n') +
                    chalk.cyan('Please commit first:\n') +
                    chalk.gray('  nexgit commit "your message"\n\n') +
                    chalk.gray('💡 Tip: Always commit before merging!'),
                    { padding: 1, borderColor: 'red', title: '⚠️  Nexgit Warning', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Safety check — warn if merging into main/master
        if (repo.branch === 'main' || repo.branch === 'master') {
            console.log(
                boxen(
                    chalk.red(`🚨 DANGER! You are merging into "${repo.branch}"!\n\n`) +
                    chalk.white('This will affect your main codebase!\n\n') +
                    chalk.yellow('Make sure:\n') +
                    chalk.gray('  ✅ Your feature branch is tested\n') +
                    chalk.gray('  ✅ Code has been reviewed\n') +
                    chalk.gray('  ✅ You are sure about this merge\n\n') +
                    chalk.gray('💡 Tip: In team projects use Pull Requests instead!'),
                    { padding: 1, borderColor: 'red', title: '⚠️  Nexgit Warning', titleAlignment: 'center' }
                )
            );

            const proceed = await confirm({
                message: `Are you SURE you want to merge "${branchName}" into "${repo.branch}"?`,
                default: false
            });

            if (!proceed) {
                messages.info('Merge cancelled. Smart choice! 😄', 'Nexgit Merge');
                return;
            }
        }

        // Show merge summary before doing it
        console.log(
            boxen(
                chalk.cyan.bold('🔀 Merge Summary:\n\n') +
                chalk.white(`   From: ${branchName}\n`) +
                chalk.white(`   Into: ${repo.branch}\n\n`) +
                chalk.gray('Starting merge...'),
                { padding: 1, borderColor: 'cyan', title: '🤖 Nexgit Merge', titleAlignment: 'center' }
            )
        );

        // Do the merge
        try {
            await gitUtils.git.merge([branchName]);

            console.log(
                boxen(
                    chalk.green.bold('✅ Merged successfully!\n\n') +
                    chalk.white(`   "${branchName}" merged into "${repo.branch}"\n\n`) +
                    chalk.gray('💡 Tip: Run nexgit push to send changes to GitHub!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Merge', titleAlignment: 'center' }
                )
            );

        } catch (mergeError) {
            // Handle merge conflicts
            if (mergeError.message.includes('CONFLICT') ||
                mergeError.message.includes('conflict')) {

                // Get conflicted files
                const status = await gitUtils.git.status();

                console.log(
                    boxen(
                        chalk.red('💥 Merge Conflict Detected!\n\n') +
                        chalk.white('These files have conflicts:\n') +
                        status.conflicted.map(f => chalk.red(`   ✗ ${f}`)).join('\n') +
                        chalk.yellow('\n\nHow to fix:\n') +
                        chalk.gray('  1. Open each conflicted file\n') +
                        chalk.gray('  2. Look for <<<<<<< markers\n') +
                        chalk.gray('  3. Keep the code you want\n') +
                        chalk.gray('  4. Remove the markers\n') +
                        chalk.gray('  5. nexgit commit "resolved conflicts"\n\n') +
                        chalk.cyan('To abort this merge:\n') +
                        chalk.gray('  git merge --abort\n\n') +
                        chalk.gray('💡 Tip: Run nexgit explain for more help!'),
                        { padding: 1, borderColor: 'red', title: '💥 Conflict Detected', titleAlignment: 'center' }
                    )
                );
                return;
            }
            throw mergeError;
        }

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default mergeCommand;
