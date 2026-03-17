"use strict";

import chalk from "chalk";
import boxen from "boxen";
import { select, input } from "@inquirer/prompts";
import gitUtils from "../utils/git.js";
import messages from "../utils/messages.js";

// Convert natural language to branch name
function formatBranchName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // multiple hyphens to one
}

async function branchCommand(name) {
  try {
    // Check repo state
    const repo = await gitUtils.checkRepo();
    if (!repo) return;

    // No name provided → show all branches
    if (!name) {
      const branches = await gitUtils.git.branch();

      let output = chalk.cyan.bold(`🌿 Current Branch: ${repo.branch}\n\n`);

      output += chalk.white.bold("📋 All Branches:\n");
      branches.all.forEach((b) => {
        if (b === repo.branch) {
          output += chalk.green(`   ✅ ${b} (current)\n`);
        } else {
          output += chalk.gray(`   •  ${b}\n`);
        }
      });

      output += chalk.gray(
        '\n\nTip: nexgit branch "feature-name" to create new branch',
      );

      console.log(
        boxen(output, {
          padding: 1,
          borderColor: "cyan",
          title: "🤖 NexGit Branch",
          titleAlignment: "center",
        }),
      );
      return;
    }

    // Format branch name
    const formattedName = formatBranchName(name);

    // Check if branch already exists
    const branches = await gitUtils.git.branch();
    if (branches.all.includes(formattedName)) {
      console.log(
        boxen(
          chalk.yellow(`⚠️  Branch "${formattedName}" already exists!\n\n`) +
          chalk.cyan("Do you want to switch to it instead?\n") +
          chalk.gray('Run: nexgit switch "' + formattedName + '"'),
          {
            padding: 1,
            borderColor: "yellow",
            title: "⚠️  NexGit Warning",
            titleAlignment: "center",
          },
        ),
      );
      return;
    }

    // Warn if uncommitted changes
    if (repo.modified.length > 0 || repo.untracked.length > 0) {
      console.log(
        boxen(
          chalk.yellow("⚠️  You have uncommitted changes!\n\n") +
          chalk.white("What do you want to do with them?"),
          {
            padding: 1,
            borderColor: "yellow",
            title: "⚠️  NexGit Warning",
            titleAlignment: "center",
          },
        ),
      );

      const action = await select({
        message: "Choose an option:",
        choices: [
          { name: "✅ Commit changes then create branch", value: "commit" },
          { name: "📦 Stash changes then create branch", value: "stash" },
          { name: "⚠️  Create branch anyway", value: "anyway" },
          { name: "❌ Cancel", value: "cancel" },
        ],
      });

      if (action === "cancel") {
        messages.info("Branch creation cancelled.", "Nexgit Branch");
        return;
      }

      if (action === "commit") {
        const commitMessage = await input({
          message: "Enter commit message:",
          default: "chore: save changes before branch",
        });

        await gitUtils.stageAll();
        const committed = await gitUtils.commit(commitMessage);
        if (!committed) return;
        messages.success("✅ Committed!", "Nexgit Branch");
      }

      if (action === "stash") {
        const stashed = await gitUtils.stash();
        if (!stashed) return;
        messages.success("📦 Changes stashed!", "Nexgit Branch");
      }
    }

    // Create and switch to new branch
    await gitUtils.git.checkoutLocalBranch(formattedName);

    console.log(
      boxen(
        chalk.green.bold("✅ Branch created successfully!\n\n") +
        chalk.white(`🌿 New Branch: ${formattedName}\n`) +
        chalk.white(`📍 Switched from: ${repo.branch}\n\n`) +
        chalk.gray("You are now on the new branch!\n") +
        chalk.gray("Run nexgit status to confirm."),
        {
          padding: 1,
          borderColor: "green",
          title: "🤖 Nexgit Branch",
          titleAlignment: "center",
        },
      ),
    );
  } catch (error) {
    messages.gitError(error.message);
  }
}

export default branchCommand;
