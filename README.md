<p align="center">
    <img alt="Concord" src="https://raw.githubusercontent.com/8grams/concord/refs/heads/develop/public/logo.png" height="200">
</p>

# Concord

**Concord** is a collaborative platform that helps **DevOps Engineers** manage and provision cloud infrastructure using **Terraform** and **Grafana Tanka**, with Git-driven workflows and a smooth UI/UX for multi-user operations.

> Designed for visibility, collaboration, and streamlined infrastructure management.

## ✨ Features

- 🔐 **Authentication**: Secure login support.
- 🏗️ **Multiple Workspaces**: Organize projects across different environments.
- 🌱 **Provisioning Proposals**: Propose infrastructure changes based on Git commits.
- 🧠 **Git Commit History**: Visualize Git history using Git Graph (powered by GitGraph).
- 💬 **Collaborative Discussions**: Discuss proposals directly within the app.
- 🛠️ **Infrastructure as Code Support**: 
  - Terraform variables management and review via UI
  - Grafana Tanka configuration management and deployment
- 🛠️ **Terraform Variables Update**: Modify and review Terraform variables via UI.

## 📂 Project Structure Conventions

Concord is designed to work with typical infrastructure-as-code repositories with the following structure conventions:

### Terraform Projects

```
project-root/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
├── modules/
│   ├── networking/
│   ├── compute/
│   └── database/
└── README.md
```

### Grafana Tanka Projects

```
project-root/
├── environments/
│   ├── default/
│   ├── dev/
│   ├── staging/
│   └── production/
├── lib/
│   ├── k.libsonnet
│   └── utils.libsonnet
└── vendor/
```

Concord automatically detects these structures and provides appropriate workflows for each project type, allowing seamless management of infrastructure configurations across environments.

## 🔧 Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js    |
| Frontend   | [Astro](https://astro.build/) + AlpineJS |
| Styling    | [DaisyUI](https://github.com/8grams/astro-dashboard-template) |
| Git Graph  | [gitgraph.js](https://github.com/bluef/gitgraph.js) |

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Git
- Terraform (optional, for Terraform provisioning workflows)
- Grafana Tanka (optional, for Tanka provisioning workflows)
- [pnpm](https://pnpm.io/) (Package manager)

### Installation

```bash
git clone https://github.com/8grams/concord.git
cd concord
pnpm install
pnpm dev
```

## Run on Production

In Production, run it via docker. Create `.env` file from `.env.example`, adjust this file with appropriate values and run:

```
docker run -v ./data:/app/data --env-file=./.env -p 4321:4321 ghcr.io/8grams/concord:latest
```


## 🤝 Contributing

We're currently in active development. Feel free to fork and submit PRs. Collaboration is welcome!

## 📄 License

MIT – see [`LICENSE`](./LICENSE) file for details.

---

**Made with ❤️ by [8grams](https://github.com/8grams)**
