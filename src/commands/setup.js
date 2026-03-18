'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select, password, confirm } from '@inquirer/prompts';
import config from '../utils/config.js';
import messages from '../utils/messages.js';

async function setupCommand() {
    try {
        console.log(
            boxen(
                chalk.cyan.bold('👋 Welcome to NexGit Setup!\n\n') +
                chalk.white('Let\'s configure NexGit for your machine.\n') +
                chalk.gray('One-time setup. Settings saved globally!'),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    title: '🤖 NexGit Setup',
                    titleAlignment: 'center'
                }
            )
        );

        // Language selection
        console.log(chalk.cyan('\n📌 Step 1 — Choose Your Language\n'));

        const language = await select({
            message: 'Choose your preferred language:',
            choices: [
                { name: '🇬🇧 English (Professional)', value: 'english' },
                { name: '🇮🇳 Hinglish (Desi Mode 😄)', value: 'hinglish' },
                { name: '🇮🇳 Hindi (Full Desi)', value: 'hindi' },
            ]
        });

        config.set('language', language);

        // GitHub token
        console.log(chalk.cyan('\n📌 Step 2 — Connect GitHub\n'));
        console.log(
            chalk.gray('  To create GitHub repos automatically, NexGit needs a GitHub token.\n') +
            chalk.gray('  How to get it:\n') +
            chalk.white('  1. Go to → ') + chalk.cyan('https://github.com/settings/tokens\n') +
            chalk.white('  2. Click "Generate new token (classic)"\n') +
            chalk.white('  3. Select scope → ') + chalk.yellow('repo (full control)\n') +
            chalk.white('  4. Copy and paste it below\n')
        );

        const wantsGitHub = await confirm({
            message: 'Do you want to connect GitHub now?',
            default: true,
        });

        if (wantsGitHub) {
            const githubToken = await password({
                message: 'Paste your GitHub token:',
                mask: '*',
            });

            if (githubToken && githubToken.trim().length > 0) {
                config.set('githubToken', githubToken.trim());
                console.log(chalk.green('\n✅ GitHub token saved!\n'));
            } else {
                console.log(chalk.yellow('\n⚠️  No token entered. You can run nexgit setup again anytime.\n'));
            }
        } else {
            console.log(chalk.gray('\n⏩ Skipped. Run nexgit setup anytime to connect GitHub.\n'));
        }

        // Success
        console.log(
            boxen(
                chalk.green.bold('✅ NexGit Setup Complete!\n\n') +
                chalk.white(`🌐 Language     : ${language}\n`) +
                chalk.white(`🔑 GitHub Token : ${config.get('githubToken') ? chalk.green('Connected ✅') : chalk.yellow('Not connected')}\n\n`) +
                chalk.cyan('Saved at:\n') +
                chalk.gray(`  ${config.CONFIG_FILE}\n\n`) +
                chalk.white('Start using NexGit:\n\n') +
                chalk.cyan('  nexgit init      → create repo in one command\n') +
                chalk.cyan('  nexgit status    → see your git state\n') +
                chalk.cyan('  nexgit commit "your message"\n\n') +
                chalk.gray('💡 Tip: Run nexgit lang anytime to change language!'),
                {
                    padding: 1,
                    borderColor: 'green',
                    title: '🎉 Setup Complete',
                    titleAlignment: 'center'
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default setupCommand;