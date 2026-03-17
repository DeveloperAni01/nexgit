'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select } from '@inquirer/prompts';
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
        console.log(chalk.cyan('\n📌 Choose Your Language\n'));

        const language = await select({
            message: 'Choose your preferred language:',
            choices: [
                { name: '🇬🇧 English (Professional)', value: 'english' },
                { name: '🇮🇳 Hinglish (Desi Mode 😄)', value: 'hinglish' },
                { name: '🇮🇳 Hindi (Full Desi)', value: 'hindi' },
            ]
        });

        config.set('language', language);

        console.log(
            boxen(
                chalk.green.bold('✅ NexGit Setup Complete!\n\n') +
                chalk.white(`🌐 Language: ${language}\n\n`) +
                chalk.cyan('Saved at:\n') +
                chalk.gray(`  ${config.CONFIG_FILE}\n\n`) +
                chalk.white('Start using NexGit:\n\n') +
                chalk.cyan('  nexgit status\n') +
                chalk.cyan('  nexgit explain\n') +
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