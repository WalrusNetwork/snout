# Snout

Private game server manager through Discord

## Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running](#running)
- [Others](#others)
  - [Code Authors](#code-authors)
  - [Formatting](#formatting)
  - [Versioning](#versioning)
  - [Workflow](#workflow)

## Getting Started

These instructions will get you a copy of Snout up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install the following services:

- [Node 12.14.0](https://nodejs.org/en/download/)
- [Redis](https://redis.io/)
- [Walrus' GraphQL API](https://github.com/WalrusNetwork/api)

### Installation

Create a new [Discord Application](https://discordapp.com/developers/) and convert it to a bot. Then, copy its token and save it somewhere, it will be required later.

Clone the repository and run `npm install` to install dependencies. Then, rename `.env.example` to `.env` and save it with your own details, such as Redis installation and the forementioned Discord bot token. If you want to change the bot's prefix, change it here.

**ATTENTION**: It is very important to include a server token and an API url, otherwise the bot will _not_ work as expected, as it relies heavily on the API.

### Running

> npm start

Starts the bot.

> npm run dev

Starts the bot with nodemon, and restarts the process on every file change. For this, please run `npm install nodemon -g`.

## Others

### Code Authors

Each file has an `@author` tag which denotes which member of the team wrote which piece of code. The main purpose of this technique is to provide support for other developers down the line when they need support. Instead of hunting around trying to figure out who wrote what, it's at the top of the file! Alsom be proud of the code you wrote!

### Formatting

We use Prettier. If you want to use our config somewhere else, install `@walrusnetwork/prettier-config` as a developer dependency and include it in your package.json:

```
{
  "name": "snout",
  "version": "0.1.0",
  "prettier": "@walrusnetwork/prettier-config",
  ...
}
```

### Versioning

We use [SemVer](http://semver.org/) for versioning.

### Workflow

- We use Git, with a typical [feature branch workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- Trivial changes and emergency fixes can be merged straight to the master branch
- Any significant change requires a PR, and code review by at least one other developer.
  This applies indiscriminately to all developers. Everyone should have their code reviewed, and anyone can review anyone else's code.
- Once a change has been merged to master, it should be deployed ASAP so that problems can be found.
  Deploying several old changes at once just makes it harder to trace bugs to their source.
- Without automated tests, we rely heavily on user reports and Sentry alerts to discover regressions.
  Developers should be around for at least a few hours after their change is deployed, in case something breaks.
