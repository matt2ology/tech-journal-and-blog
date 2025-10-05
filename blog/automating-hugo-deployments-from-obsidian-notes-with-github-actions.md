---
authors:
  - matt2ology
categories:
  - blog
date: 2025-09-24T00:01:22-07:00
draft: true
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

##### Option 1: Add a theme using Git submodules

The most common approach is to add a Hugo theme using Git as a submodule. Run the following command from your Hugo site’s root directory:

`git submodule add https://github.com/<theme-author>/hugo-theme-name.git themes/hugo-theme-name git submodule update --init --recursive`

This will add the theme as a submodule under the `themes/` folder. Don't forget to replace `<theme-author>` and `hugo-theme-name` with the actual repository details for the Hugo theme you want to use.

##### Option 2: Download a theme manually

If you'd prefer to avoid using submodules, you can manually download and extract the theme into the `themes/` folder. Simply visit the [Hugo Themes website](https://themes.gohugo.io/), download your theme, and unzip it into the `themes/` directory.

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

File: `.github/workflows/format-and-dispatch.yml`

- Runs on push to `main`
- Formats Markdown files (using Prettier)
- Commits any formatting changes
- Dispatches an event to trigger the Hugo build in your site repo (`username.github.io`)

```yaml
name: Format Markdown & Trigger Site Build

on:
  workflow_dispatch: # Manual trigger
  push:
    branches:
      - main # Adjust if needed

permissions:
  contents: write # Needed for commit/push with GITHUB_TOKEN

jobs:
  format-and-dispatch:
    runs-on: ubuntu-latest
    env:
      NODE_VERSION: 20
      TZ: America/Los_Angeles
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      SITE_REPO_PAT: ${{ secrets.SITE_REPO_PAT }}

    steps:
      - name: Checkout notes repo
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
          token: ${{ env.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Prettier
        run: npm install --global prettier

      - name: Format Markdown files
        run: prettier --write "**/*.md"

      - name: Verify Node & Prettier versions
        run: |
          echo "Node.js: $(node --version)"
          echo "Prettier: $(prettier --version)"

      - name: Commit changes (if any)
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .

          if git diff --cached --quiet; then
            echo "No changes to commit"
          else
            echo "Committing the formatted markdown files..."
            git commit -m "chore: format markdown with prettier"

            echo "Pulling latest main to avoid non-fast-forward error..."
            git pull --rebase origin main

            echo "Pushing changes..."
            git push origin HEAD:main
            echo "Changes have been committed and pushed!"
          fi

      - name: Trigger site repo (repository_dispatch)
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: token ${SITE_REPO_PAT}" \
            https://api.github.com/repos/<your-username>/<your-username>.github.io/dispatches \
            -d '{"event_type":"obsidian_content_updated","client_payload":{"ref":"'"${GITHUB_SHA}"'"}}'
```

> Don't forget to change `https://api.github.com/repos/<your-username>/<your-username>` with your own username/organization

An optional enhancement would be to format file names by slugifying them; for example, converting `Topic Note on Author.md` to `topic-note-on-author.md`.

### Step 4: Workflow for `username.github.io`

```yml
# Sample workflow for building and deploying a Hugo site to GitHub Pages
name: Update Submodule & Deploy Hugo Site to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:
  repository_dispatch:
    types: [obsidian_content_updated]

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: write
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

# Default to bash
defaults:
  run:
    shell: bash

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.128.0
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb

      - name: Install Dart Sass
        run: sudo snap install dart-sass

      - name: Checkout with submodules
        uses: actions/checkout@v5
        with:
          submodules: recursive
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update submodules to latest commit on main branch
        run: |
          # Sync submodules with remote configuration
          git submodule sync --recursive

          # Initialize submodules and update them
          git submodule update --init --recursive

          # Fetch the latest commit for the content submodule
          git submodule update --remote content

          # Set GitHub Actions bot as the author
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          # Check if submodule changes exist and commit them
          if git diff --cached --quiet; then
            echo "No submodule changes to commit"
          else
            echo "Submodule changes detected. Committing..."
            git add content
            git commit -m "chore: sync content from notes repo"
            git push origin HEAD:main
            echo "Changes pushed to main branch"
          fi

      - name: Convert links in markdown files
        run: |
          shopt -s globstar nullglob
          for file in content/**/*.md; do
            # skip templates folder
            if [[ "\$file" == content/templates/* ]]; then
              continue
            fi

            echo "Processing $file"

            # [[Page Name|Alias]] → [Alias]({{< relref "Page Name.md" >}})
            sed -i -E 's/\[\[([^]|#]+)\|([^]]+)\]\]/[\2]({{< relref "\1.md" >}})/g' "$file"

            # [[Page Name#Anchor]] → [Anchor]({{< relref "Page Name.md#Anchor" >}})
            sed -i -E 's/\[\[([^]|#]+)#([^\]]+)\]\]/[\2]({{< relref "\1.md#\2" >}})/g' "$file"

            # [[Page Name]] → [Page Name]({{< relref "Page Name.md" >}})
            sed -i -E 's/\[\[([^]|#]+)\]\]/[\1]({{< relref "\1.md" >}})/g' "$file"

            # [Page Name](page name.md) → [Page Name]({{< relref "page name.md" >}})
            sed -E 's/\[([^]]+)\]\(([^\)]+\.md)(#[^\)]*)?\)/[\1]({{< relref "\2\3" >}})/g' "$file"
          done

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Install Node.js dependencies
        run: "[[ -f package-lock.json || -f npm-shrinkwrap.json ]] && npm ci || true"

      - name: Build with Hugo
        env:
          HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
          HUGO_ENVIRONMENT: production
        run: |
          hugo \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

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
