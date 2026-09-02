<p align="center">
  <img src="public/favicon.png" width="200" alt="Battlemon">
</p>

# Battlemon

[![release](https://img.shields.io/github/v/release/remarkablegames/battlemon)](https://github.com/remarkablegames/battlemon/releases)
[![build](https://github.com/remarkablegames/battlemon/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/battlemon/actions/workflows/build.yml)

⚔️ **Battlemon** is an autobattler where you tame, battle, and evolve a team of monsters.

Play in your browser:

- [remarkablegames](https://remarkablegames.org/battlemon/)

## Prerequisites

[nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

```sh
brew install nvm
```

## Install

Clone the repository:

```sh
git clone https://github.com/remarkablegames/battlemon.git
cd battlemon
```

Install the dependencies:

```sh
npm install
```

Update the files:

- [ ] `public/app-icon.png`
- [ ] `public/favicon.png`
- [ ] `public/manifest.webmanifest`

## Environment Variables

Update the environment variables:

```sh
cp .env .env.local
```

Update the **Secrets** in the repository **Settings**.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the game in the development mode.

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.

You will also see any errors in the console.

### `npm run build`

Builds the game for production to the `dist` folder.

It correctly bundles in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your game is ready to be deployed!

### `npm run bundle`

Builds the game and compresses the contents into a ZIP archive in the `dist` folder.

Your game can be uploaded to your server, [itch.io](https://itch.io/), etc.

## License

[MIT](LICENSE)
