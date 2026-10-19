# Parashar Lab

A fully static research-lab website built with React and Vite. It is designed for GitHub Pages and has no runtime database or server.

## Local development

```bash
npm install
npm run dev
```

Run `npm run build` to create the static site in `dist/`, and `npm run lint` to check the source.

## Updating content

Team members, projects, publications, and news are Markdown records in [`content/`](content/). See [CONTENT-EDITOR-GUIDE.md](CONTENT-EDITOR-GUIDE.md) for the GitHub-based editing workflow.

## GitHub Pages

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys the site whenever changes are pushed to `main`.

After pushing the repository to GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. All supplied names, publications, projects, addresses, and email addresses are sample content.
