---
authors:
  - matt2ology
categories:
  - blog
date: 2025-09-24T00:01:22-07:00
draft: false
tags:
  - guide
  - obsidian
  - hugo
  - github-pages
  - github-actions
  - static-site-generator
  - automation
  - ci-cd
  - deployment
  - devops
  - git-submodules
title: Blog - Automating Hugo Deployments from Obsidian Notes with GitHub Actions
---

## End-to-End Guide: Obsidian → Hugo → GitHub Pages with 2 Repos

I came across Hugo through Jeff Delaney’s [Fireship](https://www.youtube.com/@Fireship) video, "[Hugo in 100 Seconds](https://www.youtube.com/watch?v=0RKpf3rK57I)".

This project serves as my personal starting point for gaining hands-on experience with GitHub Actions.

The guide I’ve put together is primarily a reference for myself - a way to document the steps and automation involved in this workflow. I find it’s best to keep things flexible and general, without locking into a specific theme. That way, both you and I can apply the workflow to any theme or configuration.

| Repository                    | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| 📝 `obsidian-note-vault-repo` | Your Obsidian vault (source of Markdown content) |
| 🌍 `username.github.io`       | Your Hugo site (deployed via GitHub Pages)       |

The relationship:

1. The site repo has a **submodule** at `content/` pointing to `obsidian-notes-repo`.
2. On every push to `obsidian-note-vault-repo/main`, a GitHub Action formats Markdown and triggers a **repository_dispatch** event to `username.github.io`.
3. The site repo workflow listens for that event, updates its submodule to the latest commit, builds Hugo, and deploys.

### Prerequisites

1. A GitHub account and two repos:
   - `obsidian-note-vault-repo` — your Obsidian vault (content).
   - `username/username.github.io` — your Hugo site repo (user site).
2. Local git + Hugo to test locally.
3. A secret you’ll create later:
   - In `obsidian-note-vault-repo`: a fine-grained PAT (details below) used to trigger the site repo.

**Important about tokens**: to trigger a workflow in _another_ repo via `repository_dispatch` you’ll need a PAT (the built-in `GITHUB_TOKEN` cannot dispatch to a different repository). For fine-grained PATs, read the docs and grant only the minimal repo permissions you need.

#### Adding A theme

Once your Hugo repo site is set up you can now add a theme to your site.

You'll need to configure Hugo to use a them. Edit your `config.toml` (or `config.yaml`/`config.json` if using a different format) and specify your theme:

`# config.toml theme = "hugo-theme-name"`

Replace `"hugo-theme-name"` with the actual name of your theme.

This is done by the following options and here's how to do that:

### Step 1: Add your Obsidian repo as a submodule

Run this locally in your **site repo** (`username.github.io`):

```bash
# from site repo root
git submodule add -b main https://github.com/<your-username>/obsidian-note-vault-repo.git content
git commit -m "chore: add content submodule (obsidian-notes-repo, branch=main)"
git push origin main
```

> Don't forget to change `https://api.github.com/repos/<your-username>/<your-username>` with your own username/organization

This records the branch in `.gitmodules` so we can use

```bash
git submodule update --remote
```

to pull the tip of `main`.

**Note**: If the submodule already exists, use `git submodule set-branch --branch main content`.

Confirm `.gitmodules` looks like this:

```ini
[submodule "content"]
  path = content
  url = https://github.com/<your-username>/obsidian-note-vault-repo.git
  branch = main
```

### Step 2: Create a fine-grained PAT for triggering site updates

You only need **one fine-grained Personal Access Token (PAT)**.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **"Generate new token"**
3. Choose a name: a descriptive name like one of the following
   - `obsidian-site-dispatch`
   - `site-update-trigger`
   - `obsidian-content-sync`
   - `gh-pages-push-token`
   - `personal-site-deploy`
   - `obsidian-ci-token`
   - `gh-token-site-refresh`
   - `update-token-obsidian-site`
4. Repository access: **only select** your site repo (`username.github.io`)
5. Permissions:
   - ✅ **Repository contents** → Read and write
   - ✅ **Metadata** → Read
6. Expiration: choose 90 days or similar (renew as needed)
7. Copy the token (you won’t see it again 😈)

Then add it to your **`obsidian-note-vault-repo`** as a **repository secret**:

- Go to `obsidian-note-vault-repo → Settings → Secrets and variables → Actions → New repository secret`
- Name: `SITE_REPO_PAT`
- Value: paste the PAT

The repository secret name can be different from the fine-grained Personal Access Token (PAT) made earlier (e.g. `SITE_REPO_PAT`).

Personally I like to keep the PAT and the repository secret the same, but made UPPER_CASE with "TOKEN" appended. For example:

- `obsidian-site-dispatch` → `OBSIDIAN_SITE_DISPATCH_TOKEN`
- `obsidian-content-sync` → `OBSIDIAN_CONTENT_SYNC_TOKEN`
- `personal-site-deploy` → `PERSONAL_SITE_DEPLOY_TOKEN`
- `update-token-obsidian-site` → `OBSIDIAN_SITE_UPDATE_TOKEN`

### Step 3: Workflow for `obsidian-note-vault-repo`

Hugo gets a bit weird with dollar signs (`$`) in code blocks and tries to treat them like shortcodes; so, instead of dropping the GitHub Actions workflow directly in this post, I’ve put it in a GitHub Gist to keep things clean and readable.

GitHub Gist: [`.github/workflows/format-and-dispatch.yml`](https://gist.github.com/matt2ology/4b8800889e149f5087ba9b8071be05d9)

- Runs on push to `main`
- Formats Markdown files (using Prettier)
- Commits any formatting changes
- Dispatches an event to trigger the Hugo build in your site repo (`username.github.io`)

> Don't forget to change `https://api.github.com/repos/<your-username>/<your-username>` with your own username/organization

An optional enhancement would be to format file names by slugifying them; for example, converting `Topic Note on Author.md` to `topic-note-on-author.md`.

### Step 4: Workflow for `username.github.io`

GitHub Gist: [`.github/workflows/update-format-links-build-deploy.yml`](https://gist.github.com/matt2ology/048b2d9d10b802697d9427e7885cd989)

- **Triggers** on push to `main`, manual dispatch, or external `repository_dispatch` event.
- **Updates Hugo submodule** (`content`) to latest commit from its repo and commits changes if needed.
- **Converts Obsidian-style links** in Markdown files to Hugo `relref` shortcodes.
- **Builds Hugo site** with `hugo`, using Dart Sass and Node.js if needed.
- **Deploys the site** to GitHub Pages via artifact upload and deployment step.

### Step 5: Enable GitHub Pages in the site repo

1. Go to your site repo (`username.github.io`)
2. Navigate to: **Settings → Pages**
3. Under **Build and deployment**, select **“GitHub Actions”**

### Step 6: Test the full pipeline

1. Commit a Markdown change in your `obsidian-note-vault-repo/main` branch.
2. Push it to GitHub.
3. In **obsidian-note-vault-repo → Actions**, confirm:
   - Markdown formatted
   - “Trigger site repo” step runs successfully
4. In **username.github.io → Actions**, confirm:
   - Repository dispatch received
   - Submodule updated
   - Hugo build + deployment succeeded
5. Visit `https://username.github.io` to verify content updated.

## Recap

| Step | What happens                         | Repo                       |
| ---- | ------------------------------------ | -------------------------- |
| 1    | You push Markdown updates            | `obsidian-note-vault-repo` |
| 2    | Markdown is auto-formatted           | `obsidian-note-vault-repo` |
| 3    | Site build trigger is sent           | via `repository_dispatch`  |
| 4    | Site updates submodule + builds Hugo | `username.github.io`       |
| 5    | Site automatically redeploys         | `GitHub Pages`             |
