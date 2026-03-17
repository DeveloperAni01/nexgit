'use strict';

import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import messages from './messages.js';
import chalk from 'chalk';
import boxen from 'boxen';

const git = simpleGit();

async function checkGitInstalled() {
    try {
        await git.version();
        return true;
    } catch (error) {
        // Detect platform
        const platform = process.platform;

        let installInstructions = '';

        if (platform === 'win32') {
            installInstructions =
                chalk.white('Windows:\n') +
                chalk.cyan('   Option 1: ') +
                chalk.gray('https://git-scm.com/download/win\n') +
                chalk.cyan('   Option 2: ') +
                chalk.gray('winget install Git.Git\n') +
                chalk.cyan('   Option 3: ') +
                chalk.gray('choco install git');

        } else if (platform === 'darwin') {
            installInstructions =
                chalk.white('Mac:\n') +
                chalk.cyan('   Option 1: ') +
                chalk.gray('brew install git\n') +
                chalk.cyan('   Option 2: ') +
                chalk.gray('https://git-scm.com/download/mac\n') +
                chalk.cyan('   Option 3: ') +
                chalk.gray('xcode-select --install');

        } else if (platform === 'linux') {
            installInstructions =
                chalk.white('Linux:\n') +
                chalk.cyan('   Ubuntu/Debian: ') +
                chalk.gray('sudo apt install git\n') +
                chalk.cyan('   Fedora/RHEL:   ') +
                chalk.gray('sudo dnf install git\n') +
                chalk.cyan('   Arch:          ') +
                chalk.gray('sudo pacman -S git\n') +
                chalk.cyan('   OpenSUSE:      ') +
                chalk.gray('sudo zypper install git');
        } else {
            installInstructions =
                chalk.cyan('   Download: ') +
                chalk.gray('https://git-scm.com/downloads');
        }

        console.log(
            boxen(
                chalk.red('❌ Git is not installed!\n\n') +
                chalk.yellow('Nexgit needs Git to work.\n\n') +
                chalk.white.bold('📥 Install Git:\n\n') +
                installInstructions +
                chalk.gray('\n\nAfter installing:\n') +
                chalk.gray('→ Restart your terminal\n') +
                chalk.gray('→ Run nexgit again ✅'),
                {
                    padding: 1,
                    borderColor: 'red',
                    title: '⚠️  Nexgit Setup',
                    titleAlignment: 'center'
                }
            )
        );
        return false;
    }
}
  
// Check all repo states and edge cases
async function checkRepo() {
    try {
        // Check if git repo
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            messages.notARepo();
            return null;
        }

        const repoPath = process.cwd();
        const gitPath = path.join(repoPath, '.git');

        // Check for special git states
        const isMerging = fs.existsSync(path.join(gitPath, 'MERGE_HEAD'));
        const isRebasing = fs.existsSync(path.join(gitPath, 'REBASE_HEAD')) ||
            fs.existsSync(path.join(gitPath, 'rebase-merge')) ||
            fs.existsSync(path.join(gitPath, 'rebase-apply'));
        const isCherryPicking = fs.existsSync(path.join(gitPath, 'CHERRY_PICK_HEAD'));
        const isReverting = fs.existsSync(path.join(gitPath, 'REVERT_HEAD'));
        const isBisecting = fs.existsSync(path.join(gitPath, 'BISECT_LOG'));

        // Warn about special states
        if (isMerging) {
            messages.mergeInProgress();
            return null;
        }

        if (isRebasing) {
            messages.rebaseInProgress();
            return null;
        }

        if (isCherryPicking) {
            messages.warning(
                '⚠️  Cherry pick in progress!\n\n' +
                'Finish or abort before continuing:\n' +
                '  git cherry-pick --continue\n' +
                '  git cherry-pick --abort',
                'Nexgit Warning'
            );
            return null;
        }

        if (isReverting) {
            messages.warning(
                '⚠️  Revert in progress!\n\n' +
                'Finish or abort before continuing:\n' +
                '  git revert --continue\n' +
                '  git revert --abort',
                'Nexgit Warning'
            );
            return null;
        }

        // Get status
        const status = await git.status();

        // Check detached HEAD
        if (!status.current) {
            messages.detachedHead();
            return null;
        }

        // Check if any commits exist
        let hasCommits = true;
        try {
            await git.log(['-1']);
        } catch (e) {
            hasCommits = false;
        }

        // Get remotes
        const remotes = await git.getRemotes(true);

        return {
            status,
            branch: status.current,
            hasCommits,
            remotes,
            isMerging,
            isRebasing,
            isCherryPicking,
            isReverting,
            isBisecting,
            ahead: status.ahead,
            behind: status.behind,
            staged: status.staged,
            modified: status.modified,
            untracked: status.not_added,
            conflicted: status.conflicted,
            deleted: status.deleted,
        };

    } catch (error) {
        // Corrupted repo check
        if (error.message.includes('not a git repository')) {
            messages.notARepo();
        } else if (error.message.includes('Permission denied')) {
            messages.error(
                '❌ Permission denied!\n\n' +
                'Nexgit cannot access this folder.\n' +
                'Try running as administrator.',
                'Nexgit Error'
            );
        } else {
            messages.gitError(error.message);
        }
        return null;
    }
}

// Check remote safely
async function checkRemote() {
    try {
        const remotes = await git.getRemotes(true);
        if (remotes.length === 0) {
            messages.noRemote();
            return null;
        }
        return remotes;
    } catch (error) {
        messages.gitError(error.message);
        return null;
    }
}

// Safe git add
async function stageAll() {
    try {
        await git.add('.');
        return true;
    } catch (error) {
        messages.gitError(error.message);
        return false;
    }
}

// Safe git commit
async function commit(message) {
    try {
        await git.commit(message);
        return true;
    } catch (error) {
        messages.gitError(error.message);
        return false;
    }
}

// Safe git push
async function push(branch) {
    try {
        await git.push('origin', branch, ['--set-upstream']);
        return true;
    } catch (error) {
        if (error.message.includes('rejected')) {
            messages.error(
                '❌ Push rejected!\n\n' +
                'Remote has changes you don\'t have locally.\n\n' +
                'Run nexgit pull first!\n' +
                'Then try nexgit push again.',
                'Nexgit Error'
            );
        } else if (error.message.includes('Authentication failed')) {
            messages.error(
                '❌ Authentication failed!\n\n' +
                'GitHub rejected your credentials.\n\n' +
                'Check your GitHub token or SSH key.',
                'Nexgit Error'
            );
        } else {
            messages.gitError(error.message);
        }
        return false;
    }
}

// Safe git pull
async function pull(branch) {
    try {
        const result = await git.pull('origin', branch);
        return result;
    } catch (error) {
        if (error.message.includes('conflict')) {
            messages.error(
                '❌ Merge conflict after pull!\n\n' +
                'Someone changed the same files!\n\n' +
                'Steps to fix:\n' +
                '  1. Open conflicted files\n' +
                '  2. Look for <<<<<<< markers\n' +
                '  3. Fix conflicts manually\n' +
                '  4. nexgit commit "resolved conflicts"',
                'Nexgit Error'
            );
        } else if (error.message.includes('Authentication failed')) {
            messages.error(
                '❌ Authentication failed!\n\n' +
                'GitHub rejected your credentials.\n\n' +
                'Check your GitHub token or SSH key.',
                'Nexgit Error'
            );
        } else if (error.message.includes('not found')) {
            messages.error(
                '❌ Branch not found on remote!\n\n' +
                'This branch doesn\'t exist on GitHub yet.\n\n' +
                'Run nexgit push to create it.',
                'Nexgit Error'
            );
        } else {
            messages.gitError(error.message);
        }
        return null;
    }
}

// Safe stash
async function stash() {
    try {
        await git.stash();
        return true;
    } catch (error) {
        messages.gitError(error.message);
        return false;
    }
}

// Safe stash pop
async function stashPop() {
    try {
        await git.stash(['pop']);
        return true;
    } catch (error) {
        messages.gitError(error.message);
        return false;
    }
}

export { checkGitInstalled };
export default {
    git,
    checkRepo,
    checkRemote,
    stageAll,
    commit,
    push,
    pull,
    stash,
    stashPop,
};