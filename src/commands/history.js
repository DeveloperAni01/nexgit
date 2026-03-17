 
'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function historyCommand() {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // No commits yet
        if (!repo.hasCommits) {
            messages.noCommits();
            return;
        }

        // Get commit log
        const PAGE_SIZE = 10;
        const log = await gitUtils.git.log([`--max-count=${PAGE_SIZE}`]);

        if (log.total === 0) {
            messages.noCommits();
            return;
        }

        // Build output
        let output = chalk.cyan.bold(`🌿 Branch: ${repo.branch}\n`);
        output += chalk.gray(`📊 Showing last ${log.all.length} commits\n\n`);

        log.all.forEach((commit, index) => {
            // Format date
            const date = new Date(commit.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Latest commit gets special treatment
            if (index === 0) {
                output += chalk.green.bold(`┌─ Latest\n`);
                output += chalk.green(`│  📝 ${commit.message}\n`);
                output += chalk.green(`│  👤 ${commit.author_name}\n`);
                output += chalk.green(`│  📅 ${formattedDate}\n`);
                output += chalk.green(`│  🔑 ${commit.hash.substring(0, 7)}\n`);
                output += chalk.green(`└─────\n\n`);
            } else {
                output += chalk.white(`┌─ #${index + 1}\n`);
                output += chalk.white(`│  📝 ${commit.message}\n`);
                output += chalk.gray(`│  👤 ${commit.author_name}\n`);
                output += chalk.gray(`│  📅 ${formattedDate}\n`);
                output += chalk.gray(`│  🔑 ${commit.hash.substring(0, 7)}\n`);
                output += chalk.gray(`└─────\n\n`);
            }
        });

        // Ahead/behind info
        if (repo.ahead > 0) {
            output += chalk.magenta(`🚀 ${repo.ahead} commit(s) not pushed to GitHub yet!\n`);
            output += chalk.gray('💡 Tip: Run nexgit push to sync!\n');
        }

        if (repo.behind > 0) {
            output += chalk.magenta(`⬇️  ${repo.behind} commit(s) on GitHub not pulled yet!\n`);
            output += chalk.gray('💡 Tip: Run nexgit pull to sync!\n');
        }

        // Pagination
        if (log.total > PAGE_SIZE) {
            const { select: selectMore } = await import('@inquirer/prompts');
            const action = await select({
                message: `Showing ${PAGE_SIZE} of ${log.total} commits. Want more?`,
                choices: [
                    { name: '📄 Show next 10', value: 'more' },
                    { name: '📋 Show all as oneline', value: 'oneline' },
                    { name: '❌ Exit', value: 'exit' }
                ]
            });

            if (action === 'more') {
                const moreLog = await gitUtils.git.log([`--max-count=10`, `--skip=${PAGE_SIZE}`]);
                let moreOutput = '';
                moreLog.all.forEach((commit, index) => {
                    const date = new Date(commit.date);
                    const formattedDate = date.toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                    moreOutput += chalk.white(`┌─ #${PAGE_SIZE + index + 1}\n`);
                    moreOutput += chalk.white(`│  📝 ${commit.message}\n`);
                    moreOutput += chalk.gray(`│  👤 ${commit.author_name}\n`);
                    moreOutput += chalk.gray(`│  📅 ${formattedDate}\n`);
                    moreOutput += chalk.gray(`│  🔑 ${commit.hash.substring(0, 7)}\n`);
                    moreOutput += chalk.gray(`└─────\n\n`);
                });
                console.log(
                    boxen(moreOutput, {
                        padding: 1,
                        borderColor: 'cyan',
                        title: '🤖 Nexgit History (continued)',
                        titleAlignment: 'center'
                    })
                );
            }

            if (action === 'oneline') {
                const allLog = await gitUtils.git.log(['--oneline']);
                let onelineOutput = '';
                allLog.all.forEach(commit => {
                    onelineOutput += chalk.gray(`${commit.hash.substring(0, 7)} `) +
                        chalk.white(`${commit.message}\n`);
                });
                console.log(
                    boxen(onelineOutput, {
                        padding: 1,
                        borderColor: 'cyan',
                        title: '🤖 Nexgit History (oneline)',
                        titleAlignment: 'center'
                    })
                );
            }
        }

        console.log(
            boxen(output, {
                padding: 1,
                borderColor: 'cyan',
                title: '🤖 Nexgit History',
                titleAlignment: 'center'
            })

            
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default historyCommand;