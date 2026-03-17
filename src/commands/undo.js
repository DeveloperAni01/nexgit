'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select, confirm, checkbox } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function undoCommand() {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // No commits at all
        if (!repo.hasCommits) {
            console.log(
                boxen(
                    chalk.yellow('⚠️  Nothing to undo!\n\n') +
                    chalk.gray('You have no commits yet.'),
                    { padding: 1, borderColor: 'yellow', title: '🤖 NexGit Undo', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Get commit count
        const log = await gitUtils.git.log();
        const commitCount = log.total;

        // Get stash list
        const stashList = await gitUtils.git.stash(['list']);
        const hasStash = stashList && stashList.length > 0;

        // Build menu choices based on current state
        const choices = [];

        // Commit related
        if (commitCount > 0) {
            choices.push({
                name: `🔄 Undo last commit — keep changes staged   (safe)`,
                value: 'soft'
            });
            choices.push({
                name: `📝 Undo last commit — keep changes unstaged (safe)`,
                value: 'mixed'
            });
            choices.push({
                name: `💣 Undo last commit — DELETE changes forever (DANGEROUS)`,
                value: 'hard'
            });
        }

        // Staged files
        if (repo.staged.length > 0) {
            choices.push({
                name: `📁 Unstage files (keep changes but remove from staging)`,
                value: 'unstage'
            });
        }

        // Modified files
        if (repo.modified.length > 0) {
            choices.push({
                name: `🗑️  Discard changes in specific file (DANGEROUS)`,
                value: 'discard_file'
            });
            choices.push({
                name: `🗑️  Discard ALL changes everywhere (VERY DANGEROUS)`,
                value: 'discard_all'
            });
        }

        // Pushed commits
        if (commitCount > 0 && repo.remotes.length > 0) {
            choices.push({
                name: `↩️  Undo pushed commit safely (creates new revert commit)`,
                value: 'revert'
            });
        }

        // Stash
        if (hasStash) {
            choices.push({
                name: `📦 Restore last stashed changes`,
                value: 'stash_pop'
            });
        }

        choices.push({
            name: `❌ Cancel`,
            value: 'cancel'
        });

        // Show menu
        const action = await select({
            message: 'What do you want to undo?',
            choices
        });

        if (action === 'cancel') {
            messages.info('Undo cancelled. Nothing changed.', 'Nexgit Undo');
            return;
        }

        // ─────────────────────────────────────────
        // SOFT RESET — undo commit keep staged
        // ─────────────────────────────────────────
        if (action === 'soft') {
            if (commitCount === 1) {
                console.log(
                    boxen(
                        chalk.red('⚠️  This is your ONLY commit!\n\n') +
                        chalk.white('Undoing it will leave you with no commits.\n') +
                        chalk.gray('Your changes will be kept staged.'),
                        { padding: 1, borderColor: 'red', title: '⚠️  Nexgit Warning', titleAlignment: 'center' }
                    )
                );

                const proceed = await confirm({
                    message: 'Are you sure?',
                    default: false
                });
                if (!proceed) {
                    messages.info('Undo cancelled.', 'Nexgit Undo');
                    return;
                }
            }

            await gitUtils.git.reset(['--soft', 'HEAD~1']);

            console.log(
                boxen(
                    chalk.green('✅ Last commit undone!\n\n') +
                    chalk.white('Your changes are still staged.\n') +
                    chalk.gray('Run nexgit status to see them.\n\n') +
                    chalk.gray('💡 Tip: Run nexgit commit to recommit with a new message!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // MIXED RESET — undo commit keep unstaged
        // ─────────────────────────────────────────
        if (action === 'mixed') {
            if (commitCount === 1) {
                const proceed = await confirm({
                    message: '⚠️  This is your only commit! Undo anyway?',
                    default: false
                });
                if (!proceed) {
                    messages.info('Undo cancelled.', 'GitBNexgituddy Undo');
                    return;
                }
            }

            await gitUtils.git.reset(['HEAD~1']);

            console.log(
                boxen(
                    chalk.green('✅ Last commit undone!\n\n') +
                    chalk.white('Your changes are kept but unstaged.\n') +
                    chalk.gray('Run nexgit status to see them.\n\n') +
                    chalk.gray('💡 Tip: Run nexgit commit to recommit!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // HARD RESET — delete everything
        // ─────────────────────────────────────────
        if (action === 'hard') {
            // Extra warning for main/master
            if (repo.branch === 'main' || repo.branch === 'master') {
                console.log(
                    boxen(
                        chalk.red('🚨 EXTREME DANGER!\n\n') +
                        chalk.white(`You are on "${repo.branch}" branch!\n`) +
                        chalk.white('Hard reset here will DELETE changes FOREVER!\n') +
                        chalk.red('THIS CANNOT BE UNDONE!'),
                        { padding: 1, borderColor: 'red', title: '🚨 DANGER', titleAlignment: 'center' }
                    )
                );
            }

            const firstConfirm = await confirm({
                message: '💣 This will DELETE your changes FOREVER. Are you sure?',
                default: false
            });

            if (!firstConfirm) {
                messages.info('Smart choice! Undo cancelled.', 'Nexgit Undo');
                return;
            }

            // Double confirm for hard reset
            const secondConfirm = await confirm({
                message: '⚠️  Last chance! Changes will be GONE FOREVER. Continue?',
                default: false
            });

            if (!secondConfirm) {
                messages.info('Undo cancelled. Nothing deleted.', 'Nexgit Undo');
                return;
            }

            await gitUtils.git.reset(['--hard', 'HEAD~1']);

            console.log(
                boxen(
                    chalk.green('✅ Hard reset done!\n\n') +
                    chalk.red('⚠️  Previous commit and its changes are gone.\n\n') +
                    chalk.gray('💡 Tip: Run nexgit status to confirm current state!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // UNSTAGE FILES
        // ─────────────────────────────────────────
        if (action === 'unstage') {
            const filesToUnstage = await checkbox({
                message: 'Which files do you want to unstage?',
                choices: repo.staged.map(f => ({ name: f, value: f, checked: true }))
            });

            if (filesToUnstage.length === 0) {
                messages.info('No files selected. Nothing changed.', 'Nexgit Undo');
                return;
            }

            for (const file of filesToUnstage) {
                await gitUtils.git.reset(['HEAD', file]);
            }

            console.log(
                boxen(
                    chalk.green('✅ Files unstaged!\n\n') +
                    filesToUnstage.map(f => chalk.yellow(`   ~ ${f}`)).join('\n') +
                    chalk.gray('\n\n💡 Tip: Changes are kept — just removed from staging!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // DISCARD SPECIFIC FILE
        // ─────────────────────────────────────────
        if (action === 'discard_file') {
            const fileToDiscard = await select({
                message: 'Which file do you want to discard changes in?',
                choices: repo.modified.map(f => ({ name: f, value: f }))
            });

            const proceed = await confirm({
                message: `⚠️  Discard ALL changes in "${fileToDiscard}"? This cannot be undone!`,
                default: false
            });

            if (!proceed) {
                messages.info('Discard cancelled. File unchanged.', 'Nexgit Undo');
                return;
            }

            await gitUtils.git.checkout(['--', fileToDiscard]);

            console.log(
                boxen(
                    chalk.green(`✅ Changes discarded in "${fileToDiscard}"\n\n`) +
                    chalk.gray('💡 Tip: File is now back to its last committed state!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // DISCARD ALL CHANGES
        // ─────────────────────────────────────────
        if (action === 'discard_all') {
            console.log(
                boxen(
                    chalk.red('🚨 WARNING!\n\n') +
                    chalk.white('This will discard changes in ALL files:\n') +
                    repo.modified.map(f => chalk.yellow(`   ~ ${f}`)).join('\n') +
                    chalk.red('\n\nThis CANNOT be undone!'),
                    { padding: 1, borderColor: 'red', title: '🚨 DANGER', titleAlignment: 'center' }
                )
            );

            const firstConfirm = await confirm({
                message: '⚠️  Discard ALL changes? Cannot be undone!',
                default: false
            });

            if (!firstConfirm) {
                messages.info('Smart choice! Nothing discarded.', 'Nexgit Undo');
                return;
            }

            const secondConfirm = await confirm({
                message: '⚠️  Are you absolutely sure?',
                default: false
            });

            if (!secondConfirm) {
                messages.info('Discard cancelled.', 'Nexgit Undo');
                return;
            }

            await gitUtils.git.checkout(['--', '.']);

            console.log(
                boxen(
                    chalk.green('✅ All changes discarded!\n\n') +
                    chalk.gray('Repo is back to last committed state.\n\n') +
                    chalk.gray('💡 Tip: Run nexgit status to confirm!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // SAFE REVERT — for pushed commits
        // ─────────────────────────────────────────
        if (action === 'revert') {
            const lastCommit = log.latest;

            console.log(
                boxen(
                    chalk.cyan('↩️  Safe Revert Info:\n\n') +
                    chalk.white(`Last commit: "${lastCommit.message}"\n`) +
                    chalk.white(`By: ${lastCommit.author_name}\n`) +
                    chalk.white(`Date: ${lastCommit.date}\n\n`) +
                    chalk.gray('This creates a NEW commit that undoes the last one.\n') +
                    chalk.gray('Safe for pushed commits — no force push needed!\n\n') +
                    chalk.gray('💡 Tip: This is the safest way to undo pushed commits!'),
                    { padding: 1, borderColor: 'cyan', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );

            const proceed = await confirm({
                message: `Revert "${lastCommit.message}"?`,
                default: true
            });

            if (!proceed) {
                messages.info('Revert cancelled.', 'Nexgit Undo');
                return;
            }

            await gitUtils.git.revert(['HEAD', '--no-edit']);

            console.log(
                boxen(
                    chalk.green('✅ Revert commit created!\n\n') +
                    chalk.white(`Undid: "${lastCommit.message}"\n\n`) +
                    chalk.gray('💡 Tip: Run nexgit push to send revert to GitHub!'),
                    { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                )
            );
        }

        // ─────────────────────────────────────────
        // STASH POP
        // ─────────────────────────────────────────
        if (action === 'stash_pop') {
            const popped = await gitUtils.stashPop();
            if (popped) {
                console.log(
                    boxen(
                        chalk.green('✅ Stashed changes restored!\n\n') +
                        chalk.gray('💡 Tip: Run nexgit status to see restored files!'),
                        { padding: 1, borderColor: 'green', title: '🤖 Nexgit Undo', titleAlignment: 'center' }
                    )
                );
            }
        }

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default undoCommand;
