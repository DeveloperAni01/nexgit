# NexGit 🤖

> **Git for Humans — AI Powered Git Assistant**

[![npm version](https://img.shields.io/npm/v/nexgit?color=cyan&style=flat-square)](https://www.npmjs.com/package/nexgit-cli)
[![npm downloads](https://img.shields.io/npm/dm/nexgit?color=green&style=flat-square)](https://www.npmjs.com/package/nexgit-cli)
[![license](https://img.shields.io/npm/l/nexgit?color=yellow&style=flat-square)](https://github.com/DeveloperAni01/nexgit/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)

```
 ███╗   ██╗███████╗██╗  ██╗ ██████╗ ██╗████████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██╔════╝ ██║╚══██╔══╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║  ███╗██║   ██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██║   ██║
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║   ██║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝   ╚═╝
```

---

## 😱 The Problem

Every fresher joining Wipro, TCS, Infosys, or any bootcamp struggles with Git daily:

- ❌ Don't know the difference between local Git and GitHub
- ❌ Accidentally push `node_modules`, `.env`, `bin`, `obj` files
- ❌ Merge wrong branches — everything breaks
- ❌ Git errors look like alien language
- ❌ No tool explains what went wrong in plain English

**NexGit fixes ALL of that.** One tool. Zero confusion.

---

## ✨ Features

- 🤖 **AI Powered** — Explains errors, generates commit messages, writes README files
- 🚀 **One Command Setup** — `nexgit init` creates local repo + GitHub repo + .gitignore + README automatically
- 🛡️ **Safety First** — Warns before every dangerous action
- 📝 **Smart Commits** — AI suggests perfect conventional commit messages
- 🌍 **Multi Language** — English, Hinglish, Hindi support
- 🎯 **Beginner Friendly** — No Git knowledge required
- ⚡ **Works Everywhere** — Windows, Mac, Linux

---

## 📦 Installation

```bash
npm install -g nexgit-cli
```

That's it. NexGit is now available globally on your machine!

---

## 🚀 Quick Start

```bash
# 1. One time setup
nexgit setup

# 2. Create a new project with GitHub repo
nexgit init

# 3. Check what changed
nexgit status

# 4. Commit with AI generated message
nexgit commit

# 5. Push to GitHub
nexgit push
```

---

## 📖 All Commands

### 🔧 Setup & Init

| Command | Description |
|---------|-------------|
| `nexgit setup` | One time setup — language + GitHub token |
| `nexgit init` | Create local repo + GitHub repo + .gitignore + AI README |

### 📊 Daily Workflow

| Command | Description |
|---------|-------------|
| `nexgit status` | See git state in plain English |
| `nexgit commit` | Smart commit with AI message suggestion |
| `nexgit commit "message"` | Commit with your own message |
| `nexgit push` | Safely push to GitHub with warnings |
| `nexgit pull` | Safely pull latest changes |

### 🌿 Branch Management

| Command | Description |
|---------|-------------|
| `nexgit branch` | List all branches |
| `nexgit branch "name"` | Create a new branch |
| `nexgit switch "branch"` | Switch to another branch |
| `nexgit merge "branch"` | Safely merge with warnings |

### 🛠️ Utilities

| Command | Description |
|---------|-------------|
| `nexgit diff` | See what changed in your files |
| `nexgit history` | See commit history in plain English |
| `nexgit ignore` | Auto fix your .gitignore file |
| `nexgit undo` | Safely undo git actions |
| `nexgit explain "error"` | AI explains any git error |
| `nexgit lang` | Change language (English/Hinglish/Hindi) |

---

## 🎯 nexgit init — The Magic Command

```bash
> nexgit init

👋 Welcome to NexGit Init!

📌 Step 1 — Project Details
? 🤖 What is your project name? my-awesome-app
? 🤖 Public or Private repo? 🌍 Public

📌 Step 2 — Project Type
? 📁 What type of project? 🟢 Node.js
? 🌿 Default branch name? 🟢 main

⚙️  Creating local Git repo...  ✅
📄 Generating .gitignore...     ✅
📝 Generating README.md...      ✅
🌐 Creating GitHub repo...      ✅
🔗 Connecting to GitHub...      ✅

🚀 You're ready to code bro!
🔗 GitHub: https://github.com/you/my-awesome-app
```

**No GitHub website. No manual commands. Nothing.**

---

## 🤖 AI Commit Messages

```bash
> nexgit commit

? How do you want to commit?
❯ 🤖 AI generate message (magic mode ✨)
  ✍️  I'll type my own message

🤖 Thinking of a commit message... ✅

? Pick a commit message:
❯ ⭐ feat: add user authentication with JWT tokens
     feat: implement login and signup pages
     chore: update auth related files
```

---

## 🌍 Multi Language Support

```bash
> nexgit lang

# English  → Professional mode
# Hinglish → "Bhai yeh error tab aata hai jab..."
# Hindi    → Full Hindi responses
```

---

## 🛡️ Safety Features

NexGit warns you before EVERY dangerous action:

- 🚨 Pushing `.env`, `node_modules`, `bin`, `obj` files
- 🚨 Merging directly into `main` or `master`
- 🚨 Force pushing or deleting branches
- 🚨 Discarding uncommitted changes

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Core runtime |
| Commander.js | CLI commands |
| simple-git | Git operations |
| Chalk + Boxen | Beautiful terminal UI |
| Gemini AI | AI brain |
| GitHub API | Auto repo creation |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

```bash
git clone https://github.com/DeveloperAni01/nexgit.git
cd nexgit
npm install
```

---

## 👨‍💻 Author

**Anirban Mondal** — Built with 💚 for developers who are learning

- GitHub: [@DeveloperAni01](https://github.com/DeveloperAni01)
- npm: [nexgit](https://www.npmjs.com/package/nexgit)

---

## 📄 License

ISC © [Anirban Mondal](https://github.com/DeveloperAni01)

---

<p align="center">
  <b>Simple • Unique • Real Problem • Real Help</b><br/>
  <i>Built with 💚 — Git for Humans 🤖</i>
</p>