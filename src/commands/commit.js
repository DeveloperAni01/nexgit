'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { confirm, select, input } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';
import detectProjectType from '../utils/detector.js';
import config from '../utils/config.js';

const SERVER_URL = 'https://nexgit-server.onrender.com';

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

// Get AI suggested commit messages from server
async function getAICommitMessage(files, diff, language) {
    try {
        process.stdout.write(chalk.cyan('🤖 Thinking of a commit message...  '));

        const response = await fetch(`${SERVER_URL}/commit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files, diff, language })
        });

        if (!response.ok) throw new Error('Server error');

        const data = await response.json();
        console.log(chalk.green('✅\n'));
        return data.messages || [];

    } catch (error) {
        console.log(chalk.yellow('⚠️  (AI unavailable, switching to manual)\n'));
        return [];
    }
}

async function commitCommand(message) {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

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
                { padding: 1, borderColor: 'cyan', title: '🤖 NexGit Commit', titleAlignment: 'center' }
            )
        );

        // ─── COMMIT MESSAGE MODE ───────────────────────────────

        let finalMessage = '';

        // If user passed message directly → ask AI or manual
        const mode = await select({
            message: '🤖 How do you want to write the commit message?',
            choices: [
                { name: '🤖 AI generate message  (magic mode ✨)', value: 'ai' },
                { name: '✍️  I\'ll type my own message', value: 'manual' },
            ]
        });

        if (mode === 'ai') {
            // Get diff for better AI context
            let diff = '';
            try {
                diff = await gitUtils.git.diff(['--cached']);
            } catch (e) {
                diff = '';
            }

            const language = config.getLanguage();
            const aiMessages = await getAICommitMessage(stagedFiles, diff, language);

            if (aiMessages.length > 0) {
                // Show AI suggestions as choices
                const choices = aiMessages.map((msg, i) => ({
                    name: `${i === 0 ? '⭐' : '  '} ${msg}`,
                    value: msg
                }));
                choices.push({ name: '✍️  None of these — I\'ll type my own', value: 'manual' });

                const chosen = await select({
                    message: '🤖 Pick a commit message:',
                    choices
                });

                if (chosen === 'manual') {
                    const typed = await input({
                        message: '✍️  Type your commit message:',
                        validate: v => v.trim().length > 0 ? true : 'Message cannot be empty!'
                    });
                    finalMessage = formatCommitMessage(typed);
                } else {
                    finalMessage = chosen;
                }

            } else {
                // AI failed → fallback to manual
                const typed = await input({
                    message: '✍️  Type your commit message:',
                    validate: v => v.trim().length > 0 ? true : 'Message cannot be empty!'
                });
                finalMessage = formatCommitMessage(typed);
            }

        } else {
            // Manual mode
            const typed = await input({
                message: '✍️  Type your commit message:',
                validate: v => v.trim().length > 0 ? true : 'Message cannot be empty!'
            });
            finalMessage = formatCommitMessage(typed);
        }

        // ─── CONFIRM AND COMMIT ────────────────────────────────

        const confirmed = await confirm({
            message: `Commit as "${finalMessage}"?`,
            default: true
        });

        if (!confirmed) {
            messages.info('Commit cancelled. No changes made.', 'NexGit Commit');
            return;
        }

        // Do the commit
        const committed = await gitUtils.commit(finalMessage);
        if (!committed) return;

        console.log(
            boxen(
                chalk.green.bold('✅ Committed successfully!\n\n') +
                chalk.cyan(`📝 Message: "${finalMessage}"\n\n`) +
                chalk.white.bold('📁 Files committed:\n') +
                stagedFiles.map(f => chalk.green(`   + ${f}`)).join('\n') +
                chalk.gray('\n\n💡 Tip: Run nexgit push to send to GitHub!'),
                { padding: 1, borderColor: 'green', title: '🤖 NexGit Commit', titleAlignment: 'center' }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default commitCommand;