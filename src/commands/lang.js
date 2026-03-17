'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select } from '@inquirer/prompts';
import config from '../utils/config.js';
import messages from '../utils/messages.js';

async function langCommand() {
    try {
        const currentLang = config.getLanguage();

        console.log(
            boxen(
                chalk.cyan.bold('🌐 Language Settings\n\n') +
                chalk.white(`Current language: `) +
                chalk.green.bold(`${currentLang}\n\n`) +
                chalk.gray('Choose your preferred language below:'),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    title: '🤖 NexGit Language',
                    titleAlignment: 'center'
                }
            )
        );

        const language = await select({
            message: 'Choose your language:',
            choices: [
                {
                    name: '🇬🇧 English (Professional)',
                    value: 'english',
                    disabled: currentLang === 'english' ? '← current' : false
                },
                {
                    name: '🇮🇳 Hinglish (Desi Mode 😄)',
                    value: 'hinglish',
                    disabled: currentLang === 'hinglish' ? '← current' : false
                },
                {
                    name: '🇮🇳 Hindi (Full Desi)',
                    value: 'hindi',
                    disabled: currentLang === 'hindi' ? '← current' : false
                },
            ]
        });

        config.set('language', language);

        // Language specific confirmation message 😄
        let confirmMsg = '';
        if (language === 'english') {
            confirmMsg = 'Language changed to English. Professional mode ON! 💼';
        } else if (language === 'hinglish') {
            confirmMsg = 'Bhai Hinglish mode ON kar diya! Ab maza aayega! 🔥';
        } else if (language === 'hindi') {
            confirmMsg = 'भाई हिंदी मोड चालू! अब गिट आसान हो जाएगा! 😄';
        }

        console.log(
            boxen(
                chalk.green.bold('✅ Language Updated!\n\n') +
                chalk.white(`${confirmMsg}\n\n`) +
                chalk.gray('💡 Tip: Run nexgit setup anytime to change other settings!'),
                {
                    padding: 1,
                    borderColor: 'green',
                    title: '🤖 Nexgit Language',
                    titleAlignment: 'center'
                }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default langCommand;