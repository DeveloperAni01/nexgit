#!/usr/bin/env node

import chalk from 'chalk';

console.log(chalk.cyan(`
 ███╗   ██╗███████╗██╗  ██╗ ██████╗ ██╗████████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██╔════╝ ██║╚══██╔══╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║  ███╗██║   ██║   
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██║   ██║   
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║   ██║   
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝   ╚═╝  
`));

console.log(chalk.green('  Git for Humans 🤖 — AI Powered Git Assistant'));
console.log(chalk.gray('  ─────────────────────────────────────────────'));
console.log(chalk.yellow('  ⚡ NexGit installed successfully!'));
console.log('');
console.log(chalk.cyan('  🚀 Get started in seconds:'));
console.log('');
console.log(chalk.white('  1. Setup NexGit    →  ') + chalk.cyan('nexgit setup'));
console.log(chalk.white('  2. Create a repo   →  ') + chalk.cyan('nexgit init'));
console.log(chalk.white('  3. Check status    →  ') + chalk.cyan('nexgit status'));
console.log(chalk.white('  4. Smart commit    →  ') + chalk.cyan('nexgit commit'));
console.log(chalk.white('  5. Push to GitHub  →  ') + chalk.cyan('nexgit push'));
console.log('');
console.log(chalk.gray('  📖 npm: https://www.npmjs.com/package/nexgit-cli'));
console.log(chalk.gray('  ─────────────────────────────────────────────'));
console.log('');