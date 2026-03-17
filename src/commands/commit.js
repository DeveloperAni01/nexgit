'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { confirm } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';
import detectProjectType from '../utils/detector.js';

// Convert casual message to conventional commit
function formatCommitMessage(message) {
    const msg = message.toLowerCase();

    if (msg.includes('fix') || msg.includes('bug') || msg.includes('error') || msg.includes('issue')) {
        return `fix: ${message}`;
    } else if (msg.includes('add') || msg.includes('new') || msg.includes('create') || msg.includes('feature')) {
        return `feat: ${message}`;
    } else if (msg.includes('update') || msg.includes('change') || msg.includes('modify') || msg.includes('improve')) {
        return `chore: ${message}`;
    } else if (msg.includes('remove') || msg.includes('delete') || msg.includes('clean')) {
        return `chore: ${message}`;
    } else if (msg.includes('doc') || msg.includes('readme') || msg.includes('comment')) {
        return `docs: ${message}`;
    } else if (msg.includes('test') || msg.includes('spec')) {
        return `test: ${message}`;
    } else if (msg.includes('style') || msg.includes('format') || msg.includes('lint')) {
        return `style: ${message}`;
    } else if (msg.includes('refactor') || msg.includes('restructure')) {
        return `refactor: ${message}`;
    } else {
        return `feat: ${message}`;
    }
}

async function commitCommand(message) {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Check message provided
        if (!message) {
            console.log(
                boxen(
                    chalk.red('❌ Please provide a commit message!\n\n') +
                    chalk.yellow('Example:\n') +
                    chalk.cyan('  nexgit commit "login page done"\n') +
                    chalk.cyan('  nexgit commit "fixed signup bug"'),
                    { padding: 1, borderColor: 'red', title: '🤖 NexGit Commit', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Check nothing to commit
        if (repo.staged.length === 0 &&
            repo.modified.length === 0 &&
            repo.untracked.length === 0) {
            console.log(
                boxen(
                    chalk.yellow('🤔 Nothing to commit bro!\n\n') +
                    chalk.gray('No changes detected in your project.'),
                    { padding: 1, borderColor: 'yellow', title: '🤖 NexGit Commit', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Detect project type
        const project = detectProjectType();

        // Stage all files
        await gitUtils.stageAll();

        // Get updated status after staging
        const updatedRepo = await gitUtils.checkRepo();
        if (!updatedRepo) return;

        const stagedFiles = updatedRepo.staged;

        // Check for dangerous files
        const dangerous = stagedFiles.filter(f =>
            project.dangerousPatterns.some(d => f.includes(d))
        );

        if (dangerous.length > 0) {
            console.log(
                boxen(
                    chalk.red('🚨 WAIT BRO! Dangerous files detected!\n\n') +
                    chalk.red('These should NOT go to GitHub:\n') +
                    dangerous.map(f => chalk.red(`   ❌ ${f}`)).join('\n') +
                    chalk.yellow('\n\nRun nexgit ignore first!\n') +
                    chalk.gray('Then try nexgit commit again.'),
                    { padding: 1, borderColor: 'red', title: '⚠️  NexGit Warning', titleAlignment: 'center' }
                )
            );
            await gitUtils.git.reset();
            return;
        }

        // Show files about to be committed
        console.log(
            boxen(
                chalk.cyan.bold('📁 Files about to be committed:\n\n') +
                stagedFiles.map(f => chalk.green(`   + ${f}`)).join('\n'),
                { padding: 1, borderColor: 'cyan', title: '🤖 Nexgit Commit', titleAlignment: 'center' }
            )
        );

        // Format commit message
        const formattedMessage = formatCommitMessage(message);

        // Confirm with user
        const confirmed = await confirm({
            message: `Commit as "${formattedMessage}"?`,
            default: true
        });

        if (!confirmed) {
            messages.info('Commit cancelled. No changes made.', 'Nexgit Commit');
            return;
        }

        // Do the commit
        const committed = await gitUtils.commit(formattedMessage);
        if (!committed) return;

        console.log(
            boxen(
                chalk.green.bold('✅ Committed successfully!\n\n') +
                chalk.cyan(`📝 Message: "${formattedMessage}"\n\n`) +
                chalk.white.bold('📁 Files committed:\n') +
                stagedFiles.map(f => chalk.green(`   + ${f}`)).join('\n') +
                chalk.gray('\n\n💡 Tip: Run nexgit push to send to GitHub!'),
                { padding: 1, borderColor: 'green', title: '🤖 Nexgit Commit', titleAlignment: 'center' }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default commitCommand;