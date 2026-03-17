
'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { input } from '@inquirer/prompts';
import config from '../utils/config.js';
import messages from '../utils/messages.js';

// NexGit backend server URL
const SERVER_URL = 'https://nexgit-server.railway.app';

// Common git errors — offline fallback
const KNOWN_ERRORS = {
    'not a git repository': {
        explanation: 'You are not inside a Git repository folder!',
        fix: 'Run: git init to create one, or navigate to your project folder.',
        tip: 'Every Git project needs a .git folder. git init creates it!'
    },
    'failed to push': {
        explanation: 'Your push was rejected by GitHub!',
        fix: 'Run nexgit pull first to get latest changes, then try pushing again.',
        tip: 'Always pull before push when working in teams!'
    },
    'merge conflict': {
        explanation: 'Two people changed the same file in different ways!',
        fix: 'Open the conflicted files, look for <<<<<<< markers, fix manually, then commit.',
        tip: 'Communicate with your team to avoid editing same files!'
    },
    'permission denied': {
        explanation: 'GitHub rejected your credentials!',
        fix: 'Check your GitHub token or SSH key setup.',
        tip: 'Use GitHub CLI (gh auth login) for easy authentication!'
    },
    'could not resolve host': {
        explanation: 'No internet connection or GitHub is unreachable!',
        fix: 'Check your internet connection and try again.',
        tip: 'You can still commit locally without internet!'
    },
    'already exists': {
        explanation: 'A branch or file with this name already exists!',
        fix: 'Use a different name or switch to the existing branch.',
        tip: 'Run nexgit branch to see all existing branches!'
    },
    'detached head': {
        explanation: 'You are not on any branch — floating in git history!',
        fix: 'Run: nexgit switch main to get back to safety.',
        tip: 'Always work on a named branch, never in detached HEAD!'
    },
    'uncommitted changes': {
        explanation: 'You have unsaved changes that need to be committed first!',
        fix: 'Run nexgit commit "your message" to save your work.',
        tip: 'Commit often — small commits are better than big ones!'
    },
    'rejected': {
        explanation: 'GitHub rejected your push because remote has newer changes!',
        fix: 'Run nexgit pull first, then nexgit push again.',
        tip: 'Always sync with remote before pushing in team projects!'
    },
    'authentication failed': {
        explanation: 'Wrong username or password for GitHub!',
        fix: 'Generate a Personal Access Token from GitHub settings and use it as password.',
        tip: 'GitHub no longer accepts plain passwords — use tokens!'
    }
};

// Try to match known error
function matchKnownError(errorText) {
    const lower = errorText.toLowerCase();
    for (const [key, value] of Object.entries(KNOWN_ERRORS)) {
        if (lower.includes(key)) {
            return value;
        }
    }
    return null;
}

// Call backend server for AI explanation
async function callServer(errorText, language) {
    try {
        const response = await fetch(`${SERVER_URL}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: errorText, language }),
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) throw new Error('Server error');

        const data = await response.json();
        return data;

    } catch (error) {
        return null; // Fall back to offline mode
    }
}

async function explainCommand(errorText) {
    try {
        const language = config.getLanguage();

        // If no error provided — ask user to paste it
        if (!errorText) {
            console.log(
                boxen(
                    chalk.cyan('📋 Paste your Git error below:\n\n') +
                    chalk.gray('Example:\n') +
                    chalk.gray('  fatal: not a git repository\n') +
                    chalk.gray('  error: failed to push some refs\n') +
                    chalk.gray('  CONFLICT (content): Merge conflict in app.js'),
                    {
                        padding: 1,
                        borderColor: 'cyan',
                        title: '🤖 Nexgit Explain',
                        titleAlignment: 'center'
                    }
                )
            );

            errorText = await input({
                message: 'Paste your error here:'
            });
        }

        if (!errorText || errorText.trim() === '') {
            messages.info('No error provided. Nothing to explain!', 'Nexgit Explain');
            return;
        }

        // Show thinking message
        console.log(chalk.cyan('\n🤔 Analyzing your error...\n'));

        // Step 1 — Try known errors first (instant, offline)
        const known = matchKnownError(errorText);

        if (known) {
            console.log(
                boxen(
                    chalk.cyan.bold('🔍 Error Analyzed!\n\n') +
                    chalk.white.bold('📖 What happened:\n') +
                    chalk.white(`   ${known.explanation}\n\n`) +
                    chalk.yellow.bold('🔧 How to fix:\n') +
                    chalk.yellow(`   ${known.fix}\n\n`) +
                    chalk.gray(`💡 Tip: ${known.tip}`),
                    {
                        padding: 1,
                        borderColor: 'cyan',
                        title: '🤖 Nexgit Explain',
                        titleAlignment: 'center'
                    }
                )
            );
            return;
        }

        // Step 2 — Try AI server
        console.log(chalk.cyan('🤖 Asking AI for help...\n'));
        const aiResponse = await callServer(errorText, language);

        if (aiResponse) {
            console.log(
                boxen(
                    chalk.cyan.bold('🤖 AI Explanation:\n\n') +
                    chalk.white.bold('📖 What happened:\n') +
                    chalk.white(`   ${aiResponse.explanation}\n\n`) +
                    chalk.yellow.bold('🔧 How to fix:\n') +
                    chalk.yellow(`   ${aiResponse.fix}\n\n`) +
                    chalk.gray(`💡 Tip: ${aiResponse.tip}`),
                    {
                        padding: 1,
                        borderColor: 'cyan',
                        title: '🤖 Nexgit Explain',
                        titleAlignment: 'center'
                    }
                )
            );
            return;
        }

        // Step 3 — Offline fallback
        console.log(
            boxen(
                chalk.yellow('⚠️  Could not reach AI server!\n\n') +
                chalk.white('Here\'s what I know about your error:\n\n') +
                chalk.gray(`Error: ${errorText}\n\n`) +
                chalk.cyan('Try these steps:\n') +
                chalk.gray('  1. Check your internet connection\n') +
                chalk.gray('  2. Search this error on stackoverflow.com\n') +
                chalk.gray('  3. Run nexgit status to see current state\n\n') +
                chalk.gray('💡 Tip: Most git errors are fixed by pull → commit → push!'),
                {
                    padding: 1,
                    borderColor: 'yellow',
                    title: '🤖 Nexgit Explain',
                    titleAlignment: 'center'
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default explainCommand;