# NexGit 🤖

> **Git for Humans — AI Powered Git Assistant**

[![npm version](https://img.shields.io/npm/v/nexgit-cli?color=cyan&style=flat-square)](https://www.npmjs.com/package/nexgit-cli)
[![npm downloads](https://img.shields.io/npm/dm/nexgit-cli?color=green&style=flat-square)](https://www.npmjs.com/package/nexgit-cli)
[![license](https://img.shields.io/npm/l/nexgit-cli?color=yellow&style=flat-square)](https://github.com/DeveloperAni01/nexgit/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/nexgit-cli?style=flat-square)](https://nodejs.org)

```
 ███╗   ██╗███████╗██╗  ██╗ ██████╗ ██╗████████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██╔════╝ ██║╚══██╔══╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║  ███╗██║   ██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██║   ██║
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║   ██║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝   ╚═╝
```

---

## The Problem

Git is powerful — but it's not beginner friendly.

- ❌ Cryptic error messages that make no sense
- ❌ Accidentally pushing `.env`, `node_modules`,`bin`, `obj` to GitHub
- ❌ No warning before dangerous commands
- ❌ Setting up a repo takes 10 manual steps

**NexGit fixes ALL of that. One command. Zero confusion.**

---

## Installation

```bash
npm install -g nexgit-cli
```

---

##  Updating

**To Update the Latest Version:**

```bash
npm install -g nexgit-cli@latest
```

---

## Quick Start

```bash
nexgit setup    # one time setup — GitHub token + language
nexgit init     # create local + GitHub repo in one command
nexgit status   # see what changed
nexgit commit   # AI generated commit message
nexgit push     # safely push to GitHub
```

---
## Smart .gitignore

NexGit scans your project before every push and warns you if `.gitignore` is outdated:
```
.gitignore is outdated!
.NET not covered
Python not covered

Fix it: nexgit ignore
```

Never accidentally push `node_modules`, `bin`, `__pycache__` again!

## Features

- **AI Powered** — Anthropic Claude + Gemini AI for commit messages, README generation and .gitignore
- **One Command Init** — creates local repo + GitHub repo + `.gitignore` + `README.md` automatically
- **Safety First** — warns before every dangerous action
- **Multi Language** — English, Hinglish, Hindi
- **Beginner Friendly** — plain English, no jargon
- **Cross Platform** — Windows, Mac, Linux

---

## Commands

### Setup & Init

| Command | What it does |
|---------|-------------|
| `nexgit setup` | One time setup — language + GitHub token |
| `nexgit init`  | Create local + GitHub repo — smart detection if repo already exists |

### Daily Workflow

| Command | What it does |
|---------|-------------|
| `nexgit status` | See git state in plain English |
| `nexgit commit` | Smart commit with AI message |
| `nexgit commit "msg"` | Commit with your own message |
| `nexgit push` | Safely push to GitHub |
| `nexgit pull` | Safely pull latest changes |

### Branch Management

| Command | What it does |
|---------|-------------|
| `nexgit branch` | List all branches |
| `nexgit branch "name"` | Create a new branch |
| `nexgit switch "branch"` | Switch to another branch |
| `nexgit merge "branch"` | Safely merge with warnings |

### Utilities

| Command | What it does |
|---------|-------------|
| `nexgit diff` | See what changed in files |
| `nexgit history` | Commit history in plain English |
| `nexgit ignore` | AI powered — detects your stack and fixes `.gitignore` automatically |
| `nexgit undo` | Safely undo git actions |
| `nexgit explain "error"` | AI explains any git error |
| `nexgit lang` | Change language |

---

## nexgit init — The Magic Command

```
> nexgit init

? Project name: my-app
? Public or Private? Public
? Project type? Node.js
? Default branch? main

⚙️ Creating local Git repo...   ✅
📄 Generating .gitignore...     ✅
📝 Generating README.md...      ✅
🌐 Creating GitHub repo...      ✅
🔗 Connecting to GitHub...      ✅

🚀 You're ready to code!
🔗 https://github.com/you/my-app
```

No GitHub website. No manual commands. Nothing.

---

## AI Commit Messages

```
> nexgit commit

? How do you want to commit?
❯ 🤖 AI generate message (magic mode ✨)
  ✍️  I'll type my own

🤖 Thinking...  ✅

? Pick a message:
❯ ⭐ feat: add user authentication with JWT
     feat: implement login and signup pages
     chore: update auth files
```

---

## 👨‍💻 Author

**Anirban Mondal**

- GitHub: [@DeveloperAni01](https://github.com/DeveloperAni01)
- npm: [nexgit-cli](https://www.npmjs.com/package/nexgit-cli)

---

## 📄 License

ISC © [Anirban Mondal](https://github.com/DeveloperAni01)

---

<p align="center"><i>❤️ From Anirban Mondal</i></p>