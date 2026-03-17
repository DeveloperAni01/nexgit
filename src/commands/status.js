'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function statusCommand() {
    try {
        // Use our safe checkRepo utility
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // No commits yet
        if (!repo.hasCommits) {
            messages.noCommits();
            return;
        }

        let output = '';

        // Branch info
        output += chalk.cyan.bold(`🌿 Branch: ${repo.branch}\n`);

        // Ahead/behind remote
        if (repo.ahead > 0) {
            output += chalk.magenta(`🚀 Ahead of GitHub by ${repo.ahead} commit(s) — run nexgit push!\n`);
        }
        if (repo.behind > 0) {
            output += chalk.magenta(`⬇️  Behind GitHub by ${repo.behind} commit(s) — run nexgit pull!\n`);
        }

        output += '\n';

        // Conflicted files — highest priority
        if (repo.conflicted.length > 0) {
            output += chalk.red.bold('💥 Conflicts (fix these first!):\n');
            repo.conflicted.forEach(f => {
                output += chalk.red(`   ✗ ${f}\n`);
            });
            output += '\n';
        }

        // Staged files
        if (repo.staged.length > 0) {
            output += chalk.green.bold('✅ Staged (ready to commit):\n');
            repo.staged.forEach(f => {
                output += chalk.green(`   + ${f}\n`);
            });
            output += '\n';
        }

        // Modified files
        if (repo.modified.length > 0) {
            output += chalk.yellow.bold('📝 Modified (not staged yet):\n');
            repo.modified.forEach(f => {
                output += chalk.yellow(`   ~ ${f}\n`);
            });
            output += '\n';
        }

        // Deleted files
        if (repo.deleted.length > 0) {
            output += chalk.red.bold('🗑️  Deleted:\n');
            repo.deleted.forEach(f => {
                output += chalk.red(`   - ${f}\n`);
            });
            output += '\n';
        }

        // Untracked files
        if (repo.untracked.length > 0) {
            output += chalk.gray.bold('❓ Untracked (git doesn\'t know these):\n');
            repo.untracked.forEach(f => {
                output += chalk.gray(`   ? ${f}\n`);
            });
            output += '\n';
        }

        // Clean repo
        if (
            repo.staged.length === 0 &&
            repo.modified.length === 0 &&
            repo.untracked.length === 0 &&
            repo.conflicted.length === 0 &&
            repo.deleted.length === 0
        ) {
            output += chalk.green('✨ Everything is clean! Nothing to commit.\n');
        }

        console.log(
            boxen(output, {
                padding: 1,
                borderColor: 'cyan',
                title: '🤖 NexGit Status',
                titleAlignment: 'center'
            })
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default statusCommand;