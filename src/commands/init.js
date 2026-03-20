'use strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import { select, input, confirm } from '@inquirer/prompts';
import config from '../utils/config.js';
import messages from '../utils/messages.js';
import detectProjectType from '../utils/detector.js';
import simpleGit from 'simple-git';

const SERVER_URL = 'https://nexgit-server.onrender.com';

// Fallback patterns if server fails
const fallbackPatterns = {
    nodejs: ['node_modules/', 'dist/', '.env', '.env.*', '*.log', '.DS_Store', 'Thumbs.db'],
    react: ['node_modules/', 'dist/', 'build/', '.env', '.env.*', '*.log', '.DS_Store'],
    dotnet: ['bin/', 'obj/', '*.user', '.vs/', '.env', '*.log', '.DS_Store'],
    python: ['__pycache__/', 'venv/', '.venv/', '.env', '.env.*', '*.log', '.DS_Store'],
    other: ['.env', '.env.*', '*.log', '.DS_Store', 'Thumbs.db', '*.pem', '*.key'],
};

async function initCommand() {
    try {
        const cwd = process.cwd();

        // Welcome
        console.log(
            boxen(
                chalk.cyan.bold('👋 Welcome to NexGit Init!\n\n') +
                chalk.white("Let's set up your Git repo — step by step."),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    title: '🤖 NexGit Init',
                    titleAlignment: 'center',
                }
            )
        );

        // ─── CHECK IF ALREADY A GIT REPO ──────────────────────────
        try {
            const existingGit = simpleGit(cwd);
            const isRepo = await existingGit.checkIsRepo();

            if (isRepo) {
                const remotes = await existingGit.getRemotes(true);
                const hasRemote = remotes.length > 0;

                // Already connected — nothing to do
                if (hasRemote) {
                    console.log(
                        boxen(
                            chalk.yellow.bold('⚠️  Already a connected Git repo!\n\n') +
                            chalk.white('This folder already has a GitHub remote:\n') +
                            chalk.cyan(`   ${remotes[0].refs.fetch}\n\n`) +
                            chalk.gray('Run nexgit status to see current state.'),
                            {
                                padding: 1,
                                borderColor: 'yellow',
                                title: '🤖 NexGit Init',
                                titleAlignment: 'center',
                            }
                        )
                    );
                    return;
                }

                // Local repo but no remote — give options
                console.log(
                    boxen(
                        chalk.cyan.bold('📁 Local Git repo detected!\n\n') +
                        chalk.white('This folder already has a local Git repo\n') +
                        chalk.gray("but it's not connected to GitHub yet."),
                        {
                            padding: 1,
                            borderColor: 'cyan',
                            title: '🤖 NexGit Init',
                            titleAlignment: 'center',
                        }
                    )
                );

                const action = await select({
                    message: '🤖 What do you want to do?',
                    choices: [
                        { name: '🆕 Create new GitHub repo and connect', value: 'create' },
                        { name: '🔗 Connect to existing GitHub repo', value: 'connect' },
                        { name: '❌ Cancel', value: 'cancel' },
                    ]
                });

                if (action === 'cancel') {
                    console.log(chalk.yellow('\n⏩ Cancelled. Run nexgit init anytime!\n'));
                    return;
                }

                if (action === 'connect') {
                    const repoUrl = await input({
                        message: '🔗 Paste your GitHub repo URL:',
                        validate: (value) => {
                            if (!value || value.trim().length === 0) return 'URL cannot be empty!';
                            if (!value.includes('github.com')) return 'Please enter a valid GitHub URL!';
                            return true;
                        }
                    });

                    process.stdout.write(chalk.white('🔗 Connecting to GitHub...  '));
                    await existingGit.addRemote('origin', repoUrl.trim());
                    console.log(chalk.green('✅'));

                    console.log(
                        boxen(
                            chalk.green.bold('🚀 Connected successfully!\n\n') +
                            chalk.cyan(`🔗 GitHub : ${repoUrl.trim()}\n\n`) +
                            chalk.yellow.bold('👣 Next Steps:\n') +
                            chalk.white('  1. Check status   → ') + chalk.green('nexgit status\n') +
                            chalk.white('  2. Commit work    → ') + chalk.green('nexgit commit\n') +
                            chalk.white('  3. Push to GitHub → ') + chalk.green('nexgit push\n'),
                            {
                                padding: 1,
                                borderColor: 'green',
                                title: '🎉 Connected!',
                                titleAlignment: 'center',
                            }
                        )
                    );
                    return;
                }

                if (action === 'create') {
                    const token = config.get('githubToken');
                    if (!token) {
                        console.log(
                            boxen(
                                chalk.yellow.bold('⚠️  GitHub token not found!\n\n') +
                                chalk.white('Run this first → ') + chalk.cyan('nexgit setup\n') +
                                chalk.gray('It only takes 1 minute. Do it once, use forever!'),
                                {
                                    padding: 1,
                                    borderColor: 'yellow',
                                    title: '🤖 NexGit Init',
                                    titleAlignment: 'center',
                                }
                            )
                        );
                        return;
                    }

                    const projectName = await input({
                        message: '🤖 What is your project name?',
                        validate: (value) => {
                            if (!value || value.trim().length === 0) return 'Project name cannot be empty!';
                            if (/\s/.test(value)) return 'No spaces allowed! Use hyphens (my-project)';
                            return true;
                        }
                    });

                    const visibility = await select({
                        message: '🤖 Public or Private repo?',
                        choices: [
                            { name: '🌍 Public  (Anyone can see)', value: 'public' },
                            { name: '🔒 Private (Only you)', value: 'private' },
                        ]
                    });

                    process.stdout.write(chalk.white('🌐 Creating GitHub repo...  '));
                    const res = await fetch('https://api.github.com/user/repos', {
                        method: 'POST',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json',
                            'User-Agent': 'nexgit-cli'
                        },
                        body: JSON.stringify({
                            name: projectName,
                            private: visibility === 'private',
                            auto_init: false,
                        })
                    });

                    const resData = await res.json();

                    if (!res.ok) {
                        console.log(chalk.red('❌'));
                        console.log(chalk.red(`\n❌ GitHub Error: ${resData.message}`));
                        console.log(chalk.gray('Tip: Repo with this name might already exist on GitHub!'));
                        return;
                    }

                    console.log(chalk.green('✅'));

                    process.stdout.write(chalk.white('🔗 Connecting to GitHub...  '));
                    await existingGit.addRemote('origin', resData.clone_url);
                    console.log(chalk.green('✅'));

                    console.log(
                        boxen(
                            chalk.green.bold("🚀 You're ready to code bro!\n\n") +
                            chalk.cyan(`📁 Project   : ${projectName}\n`) +
                            chalk.cyan(`🔒 Visibility: ${visibility}\n`) +
                            chalk.cyan(`🔗 GitHub    : ${resData.html_url}\n\n`) +
                            chalk.yellow.bold('👣 Next Steps:\n') +
                            chalk.white('  1. Check status   → ') + chalk.green('nexgit status\n') +
                            chalk.white('  2. Commit work    → ') + chalk.green('nexgit commit\n') +
                            chalk.white('  3. Push to GitHub → ') + chalk.green('nexgit push\n'),
                            {
                                padding: 1,
                                borderColor: 'green',
                                title: '🎉 Repo Created!',
                                titleAlignment: 'center',
                            }
                        )
                    );
                    return;
                }
            }
        } catch (e) {
            // not a repo — good, continue
        }

        // ─── FRESH FOLDER FLOW ─────────────────────────────────────

        // Check GitHub token
        const token = config.get('githubToken');
        if (!token) {
            console.log(
                boxen(
                    chalk.yellow.bold('⚠️  GitHub token not found!\n\n') +
                    chalk.white('Run this first → ') + chalk.cyan('nexgit setup\n') +
                    chalk.gray('It only takes 1 minute. Do it once, use forever!'),
                    {
                        padding: 1,
                        borderColor: 'yellow',
                        title: '🤖 NexGit Init',
                        titleAlignment: 'center',
                    }
                )
            );
            return;
        }

        // Step 1 — Project name
        console.log(chalk.cyan('\n📌 Step 1 — Project Details\n'));

        const projectName = await input({
            message: '🤖 What is your project name?',
            validate: (value) => {
                if (!value || value.trim().length === 0) return 'Project name cannot be empty!';
                if (/\s/.test(value)) return 'No spaces allowed! Use hyphens (my-project)';
                return true;
            }
        });

        // Step 2 — Public or Private
        const visibility = await select({
            message: '🤖 Public or Private repo?',
            choices: [
                { name: '🌍 Public  (Anyone can see)', value: 'public' },
                { name: '🔒 Private (Only you)', value: 'private' },
            ]
        });

        // Step 3 — Project type
        console.log(chalk.cyan('\n📌 Step 2 — Project Type\n'));

        const projectType = await select({
            message: '📁 What type of project is this?',
            choices: [
                { name: '🟢 Node.js', value: 'nodejs' },
                { name: '⚛️  React', value: 'react' },
                { name: '🔵 .NET', value: 'dotnet' },
                { name: '🐍 Python', value: 'python' },
                { name: '📦 Other', value: 'other' },
            ],
        });

        // Step 3.5 — Default branch name
        const branchChoice = await select({
            message: '🌿 What should your default branch be called?',
            choices: [
                { name: '🟢 main   (recommended)', value: 'main' },
                { name: '📦 master (classic)', value: 'master' },
                { name: '🔧 dev    (development)', value: 'dev' },
                { name: "✍️  custom (I'll type my own)", value: 'custom' },
            ],
        });

        let defaultBranch = branchChoice;
        if (branchChoice === 'custom') {
            defaultBranch = await input({
                message: '✍️  Type your branch name:',
                validate: (value) => {
                    if (!value || value.trim().length === 0) return 'Branch name cannot be empty!';
                    if (/\s/.test(value)) return 'No spaces allowed! Use hyphens (my-branch)';
                    return true;
                }
            });
        }

        // Confirm
        console.log('');
        const confirmed = await confirm({
            message: `Ready to create "${projectName}" as a ${visibility} repo?`,
            default: true,
        });

        if (!confirmed) {
            console.log(chalk.yellow('\n⏩ Cancelled. Run nexgit init anytime!\n'));
            return;
        }

        console.log('');

        // Step 4 — git init
        process.stdout.write(chalk.white('⚙️  Creating local Git repo...  '));
        const git = simpleGit(cwd);
        await git.init();
        await git.raw(['branch', '-M', defaultBranch]);
        console.log(chalk.green('✅'));

        // Step 5 — AI .gitignore
        process.stdout.write(chalk.white('📄 Generating .gitignore...     '));
        const gitignorePath = path.join(cwd, '.gitignore');
        let patterns = [];

        try {
            let stacksToSend = [];
            if (projectType === 'other') {
                const detected = detectProjectType(cwd);
                stacksToSend = detected.detectedStacks;
            }

            const response = await fetch(`${SERVER_URL}/gitignore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectType,
                    detectedStacks: stacksToSend,
                    language: config.getLanguage(),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                patterns = data.patterns || [];
            } else {
                patterns = fallbackPatterns[projectType] || fallbackPatterns.other;
            }
        } catch (e) {
            patterns = fallbackPatterns[projectType] || fallbackPatterns.other;
        }

        const content = '# Generated by NexGit 🤖\n' + patterns.join('\n') + '\n';
        fs.writeFileSync(gitignorePath, content);
        console.log(chalk.green('✅'));

        // Step 5.5 — AI README
        process.stdout.write(chalk.white('📝 Generating README.md...      '));
        try {
            const readmeResponse = await fetch(`${SERVER_URL}/readme`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName,
                    projectType,
                    visibility,
                    language: config.getLanguage(),
                }),
            });

            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                const readmePath = path.join(cwd, 'README.md');
                fs.writeFileSync(readmePath, readmeData.readme);
                console.log(chalk.green('✅'));
            } else {
                console.log(chalk.yellow('⚠️  (skipped)'));
            }
        } catch (e) {
            console.log(chalk.yellow('⚠️  (skipped)'));
        }

        // Step 6 — Create GitHub repo
        process.stdout.write(chalk.white('🌐 Creating GitHub repo...      '));
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'nexgit-cli',
            },
            body: JSON.stringify({
                name: projectName,
                private: visibility === 'private',
                auto_init: false,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.log(chalk.red('❌'));
            console.log(chalk.red(`\n❌ GitHub Error: ${responseData.message}`));
            console.log(chalk.gray('Tip: Repo with this name might already exist on GitHub!'));
            return;
        }

        const repoData = responseData;
        console.log(chalk.green('✅'));

        // Step 7 — Connect
        process.stdout.write(chalk.white('🔗 Connecting to GitHub...      '));
        await git.addRemote('origin', repoData.clone_url);
        console.log(chalk.green('✅'));

        // Success!
        console.log(
            boxen(
                chalk.green.bold("🚀 You're ready to code bro!\n\n") +
                chalk.cyan(`📁 Project    : ${projectName}\n`) +
                chalk.cyan(`🔒 Visibility : ${visibility}\n`) +
                chalk.cyan(`🌿 Branch     : ${defaultBranch}\n`) +
                chalk.cyan(`🔗 GitHub     : ${repoData.html_url}\n\n`) +
                chalk.yellow.bold('👣 Next Steps:\n') +
                chalk.white('  1. Add your files   → ') + chalk.green('nexgit status\n') +
                chalk.white('  2. Commit your work → ') + chalk.green('nexgit commit\n') +
                chalk.white('  3. Push to GitHub   → ') + chalk.green('nexgit push\n'),
                {
                    padding: 1,
                    borderColor: 'green',
                    title: '🎉 Repo Created!',
                    titleAlignment: 'center',
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default initCommand;