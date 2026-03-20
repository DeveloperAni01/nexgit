
'use strict';

import chalk from 'chalk';
import boxen from 'boxen';

// Base box builder
function createBox(content, borderColor, title) {
    return boxen(content, {
        padding: 1,
        borderColor,
        title: `🤖 ${title}`,
        titleAlignment: 'center'
    });
}

// Success message
function success(message, title = 'NexGit') {
    console.log(createBox(chalk.green.bold(message), 'green', title));
}

// Error message
function error(message, title = 'NexGit') {
    console.log(createBox(chalk.red(message), 'red', title));
}

// Warning message
function warning(message, title = 'NexGit Warning') {
    console.log(createBox(chalk.yellow(message), 'yellow', title));
}

// Info message
function info(message, title = 'NexGit') {
    console.log(createBox(chalk.cyan(message), 'cyan', title));
}

// Not a git repo message
function notARepo() {
    error(
        '❌ This folder is not a Git repo!\n\n' +
        chalk.yellow('Run: nexgit init to start one'),
        'NexGit Error'
    );
}

// No remote message
function noRemote() {
    error(
        '❌ No remote found!\n\n' +
        chalk.yellow('This repo is not connected to GitHub yet!\n\n') +
        chalk.white('Fix it in one command:\n') +
        chalk.cyan('  nexgit init\n'),
        'NexGit Error'
    );
}

// No commits yet
function noCommits() {
    warning(
        '⚠️  No commits yet!\n\n' +
        chalk.white('Make your first commit:\n') +
        chalk.cyan('  nexgit commit "first commit"'),
        'NexGit Warning'
    );
}

// Detached HEAD
function detachedHead() {
    warning(
        '⚠️  Detached HEAD state detected!\n\n' +
        chalk.white('You are not on any branch!\n\n') +
        chalk.cyan('Go back to a branch:\n') +
        chalk.gray('  nexgit switch main\n') +
        chalk.gray('  nexgit switch master'),
        'NexGit Warning'
    );
}

// Merge in progress
function mergeInProgress() {
    warning(
        '⚠️  Merge in progress!\n\n' +
        chalk.white('You have an unfinished merge.\n\n') +
        chalk.cyan('Options:\n') +
        chalk.gray('  1. Fix conflicts then: nexgit commit "resolved"\n') +
        chalk.gray('  2. Abort merge: git merge --abort'),
        'NexGit Warning'
    );
}

// Rebase in progress
function rebaseInProgress() {
    warning(
        '⚠️  Rebase in progress!\n\n' +
        chalk.white('You have an unfinished rebase.\n\n') +
        chalk.cyan('Options:\n') +
        chalk.gray('  1. Continue: git rebase --continue\n') +
        chalk.gray('  2. Abort: git rebase --abort'),
        'NexGit Warning'
    );
}

// Generic git error with explain hint
function gitError(errorMessage) {
    console.log(
        createBox(
            chalk.red('❌ Something went wrong!\n\n') +
            chalk.yellow('Error: ') + chalk.white(errorMessage) +
            chalk.gray('\n\nRun nexgit explain for help!'),
            'red',
            'NexGit Error'
        )
    );
}

export default {
    success,
    error,
    warning,
    info,
    notARepo,
    noRemote,
    noCommits,
    detachedHead,
    mergeInProgress,
    rebaseInProgress,
    gitError,
    createBox
};