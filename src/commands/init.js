'use strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import { select, input, confirm } from '@inquirer/prompts';
import config from '../utils/config.js';
import messages from '../utils/messages.js';
import gitUtils from '../utils/git.js';
import simpleGit from 'simple-git';

// .gitignore templates
const gitignoreTemplates = {
    nodejs: [
        'node_modules/', 'dist/', '.env', '.env.*',
        '*.log', 'npm-debug.log*', '.DS_Store', 'Thumbs.db', '*.pem', '*.key',
    ],
    react: [
        'node_modules/', 'dist/', 'build/', '.env', '.env.*',
        '*.log', 'npm-debug.log*', '.DS_Store', 'Thumbs.db', '*.pem', '*.key',
    ],
    dotnet: [
        'bin/', 'obj/', '*.user', '*.suo', '.vs/',
        'packages/', '*.log', '.env', '.env.*', '.DS_Store', 'Thumbs.db',
    ],
    python: [
        '__pycache__/', '*.py[cod]', '.env', '.env.*',
        'venv/', '.venv/', '*.log', '.DS_Store', 'Thumbs.db', '*.pem', '*.key',
    ],
    other: [
        '.env', '.env.*', '*.log', '.DS_Store', 'Thumbs.db', '*.pem', '*.key',
    ],
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

        // Check if already inside a git repo
        try {
            const existingGit = simpleGit(cwd);
            const isRepo = await existingGit.checkIsRepo();
            if (isRepo) {
                console.log(
                    boxen(
                        chalk.yellow.bold('⚠️  Already inside a Git repo!\n\n') +
                        chalk.white('This folder is already tracked by Git.\n') +
                        chalk.gray('Navigate to a fresh empty folder and run nexgit init again!\n\n') +
                        chalk.cyan('Tip: cd Desktop && mkdir my-project && cd my-project'),
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
        } catch (e) {
            // not a repo — good, continue
        }


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

        // Step 3 — Project type for .gitignore
        // Step 3 — Project type for .gitignore
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
                { name: '✍️  custom (I\'ll type my own)', value: 'custom' },
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

        // Confirm before doing anything
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

        // Step 4 — git init locally
        process.stdout.write(chalk.white('⚙️  Creating local Git repo...  '));
        const git = simpleGit(cwd);
        await git.init();
        await git.raw(['branch', '-M', defaultBranch]);
        console.log(chalk.green('✅'));

        // Step 5 — Generate .gitignore
        process.stdout.write(chalk.white('📄 Generating .gitignore...     '));
        const gitignorePath = path.join(cwd, '.gitignore');
        const patterns = gitignoreTemplates[projectType];
        let existing = '';
        if (fs.existsSync(gitignorePath)) {
            existing = fs.readFileSync(gitignorePath, 'utf8');
        }
        const toAdd = patterns.filter(p => !existing.includes(p));
        const content = existing
            ? existing + '\n# Generated by NexGit 🤖\n' + toAdd.join('\n') + '\n'
            : '# Generated by NexGit 🤖\n' + toAdd.join('\n') + '\n';
        fs.writeFileSync(gitignorePath, content);
        console.log(chalk.green('✅'));

        // Step 5.5 — Generate AI README
        process.stdout.write(chalk.white('📝 Generating README.md...      '));
        try {
            const readmeResponse = await fetch('https://nexgit-server.onrender.com/readme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName,
                    projectType,
                    visibility,
                    language: config.getLanguage()
                })
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

        // Step 6 — Create GitHub repo via API
        process.stdout.write(chalk.white('🌐 Creating GitHub repo...      '));
        const response = await fetch('https://api.github.com/user/repos', {
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

        const responseData = await response.json();

        if (!response.ok) {
            console.log(chalk.red('❌'));
            console.log(chalk.red(`\n❌ GitHub Error: ${responseData.message}`));
            console.log(chalk.gray('Tip: Repo with this name might already exist on GitHub!'));
            return;
        }

        const repoData = responseData;
        console.log(chalk.green('✅'));

        // Step 7 — Connect local to GitHub
        process.stdout.write(chalk.white('🔗 Connecting to GitHub...      '));
        await git.addRemote('origin', repoData.clone_url);
        console.log(chalk.green('✅'));

        // Success!
        console.log(
            boxen(
                chalk.green.bold('🚀 You\'re ready to code bro!\n\n') +
                chalk.cyan(`📁 Project    : ${projectName}\n`) +
                chalk.cyan(`🔒 Visibility : ${visibility}\n`) +
                chalk.cyan(`🌿 Branch     : ${defaultBranch}\n`) +
                chalk.cyan(`🔗 GitHub     : ${repoData.html_url}\n\n`) +
                chalk.yellow.bold('👣 Next Steps:\n') +
                chalk.white('  1. Add your files   → ') + chalk.green('nexgit status\n') +
                chalk.white('  2. Commit your work → ') + chalk.green('nexgit commit "first commit"\n') +
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