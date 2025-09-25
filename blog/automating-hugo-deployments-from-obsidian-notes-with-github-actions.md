---
authors:
  - matt2ology
categories:
  - blog
date: 2025-09-24T00:01:22-07:00
draft: true
tags:
  - guide
title: Blog - Automating Hugo Deployments from Obsidian Notes with GitHub Actions
---

## End-to-End Guide: Obsidian → Hugo → GitHub Pages with 2 Repos

You have two repositories:

1. **`obsidian-note-vault-repo`** → Your Obsidian vault with Markdown notes
    
2. **`username.github.io`** → Hugo site repo deployed with GitHub Pages
    
    - Has a **git submodule**: `content/` → points to `obsidian-note-vault-repo`
        

Goal:

- On push to `obsidian-note-vault-repo`:
    
    1. Format Markdown with Prettier
        
    2. Commit any changes
        
    3. Trigger a workflow in `username.github.io`
        
- On trigger, `username.github.io` should:
    
    1. Pull updated submodule content
        
    2. Build Hugo site
        
    3. Deploy to GitHub Pages
        
- You should also be able to **manually rebuild Hugo** from `username.github.io`
    

---

## Step 0. Add `obsidian-note-vault-repo` as a Submodule in `username.github.io`

This step links your Obsidian notes to the Hugo site via a **Git submodule**, so Hugo can read and build them as part of its content.

### Add the Submodule (Tracking `main` Branch Only)

From your terminal:

```bash
git clone https://github.com/username/username.github.io.git
cd username.github.io

# Add the submodule and explicitly track the `main` branch
git submodule add -b main https://github.com/username/obsidian-note-vault-repo.git content

# Commit the submodule configuration
git add .gitmodules content
git commit -m "chore: Added obsidian-note-vault-repo as submodule (main branch only)"
git push origin main
```

### Step 1. Create a Fine-grained PAT

1. Go to **GitHub → Settings → Developer settings → Fine-grained tokens**
    
2. Click **Generate new token**
    
    - **Name:** `OBSIDIAN_NOTE_TO_HUGO_PAT`
        
    - **Owner:** your GitHub account
        
    - **Expiration:** set to a safe rotation policy
        
3. **Repository access** → Select:
    
    - `obsidian-note-vault-repo`
        
    - `username.github.io`
        
4. **Permissions:**
    
    - `Contents`: **Read and Write**
        
    - `Metadata`: **Read-only**
        
5. Save token.
    
6. Add as a **secret** in both repos:
    
    - `Settings → Secrets and variables → Actions → New repository secret`
        
    - Name: `OBSIDIAN_NOTE_TO_HUGO_PAT`
        

---

### Step 2. Workflow in `obsidian-note-vault-repo`

File: `.github/workflows/format-and-trigger.yml`

```yml
name: Format Markdown with Prettier

on:
  workflow_dispatch:   # manual trigger
  push:
    branches:
      - main           # adjust branch if needed

permissions:
  contents: write      # allow commits/push with GITHUB_TOKEN

jobs: 
  format-and-trigger:
    runs-on: ubuntu-latest
    env:
      NODE_VERSION: 20
      TZ: America/Los_Angeles

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Prettier
        run: npm install --global prettier

      - name: Run Prettier on Markdown
        run: prettier --write "**/*.md"

      - name: Verify installations
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
            git push origin HEAD:main
            echo "Changes have been committed and pushed!"
          fi

      - name: Trigger Hugo site workflow
        run: |
          echo "Triggering Hugo site workflow in username.github.io..."
          curl -X POST \
            -H "Authorization: token ${{ secrets.OBSIDIAN_NOTE_TO_HUGO_PAT }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/username/username.github.io/dispatches \
            -d '{"event_type": "sync-from-notes", "client_payload": {"source_sha": "${{ github.sha }}"}}'
```

---

### Step 3. Workflow in `username.github.io`

File: `.github/workflows/deploy-hugo.yml`

```yml
name: Build and Deploy Hugo Site

on:
  workflow_dispatch:  # Manual trigger
  repository_dispatch:  # Triggered from another repo (e.g., notes)
    types: [sync-from-notes]

permissions:
  contents: write
  pages: write
  id-token: write

env:
  HUGO_CACHEDIR: /tmp/hugo_cache  # Predictable path for Hugo module caching

jobs:
  build-hugo-site:
    runs-on: ubuntu-latest

    steps:
      # Checkout the site repo (including submodules)
      - name: Checkout site repo (with submodules)
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
          submodules: recursive
          token: ${{ secrets.OBSIDIAN_NOTE_TO_HUGO_PAT }}

      # Pull latest changes from submodules (e.g., notes repo)
      - name: Update submodules
        run: |
          git submodule update --remote --merge
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content
          if git diff --cached --quiet; then
            echo "✅ No submodule changes to commit"
          else
            echo "🔄 Submodule changes detected. Committing..."
            git commit -m "chore: sync content from notes repo"
            git push origin HEAD:main
            echo "🚀 Changes pushed to main branch"
          fi

      # Install Hugo
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      # Show installed Hugo version (debugging aid)
      - name: Show Hugo version
        run: hugo version

      # Cache Hugo Modules
      - name: Cache Hugo Modules
        uses: actions/cache@v4
        with:
          path: ${{ env.HUGO_CACHEDIR }}
          key: ${{ runner.os }}-hugomod-${{ hashFiles('**/go.sum') }}
          restore-keys: |
            ${{ runner.os }}-hugomod-

      # (Optional) Cache Hugo resources/ folder
      - name: Cache Hugo resources
        uses: actions/cache@v4
        with:
          path: resources
          key: ${{ runner.os }}-hugoresources-${{ github.ref }}
          restore-keys: |
            ${{ runner.os }}-hugoresources-

      # Build the Hugo site with production flags
      - name: Build Hugo site
        run: hugo --gc --minify

      # Upload the `public/` directory for deployment
      - name: Upload artifact for GitHub Pages
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./public

  deploy:
    name: Deploy to GitHub Pages
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build-hugo-site

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Workflow Recap

1. You write notes in **Obsidian** → push to `obsidian-note-vault-repo`
    
2. Workflow formats with **Prettier**, commits if needed, and triggers Hugo site build
    
3. `username.github.io` workflow runs:
    
    - Updates `content` submodule
        
    - Builds Hugo site
        
    - Deploys to GitHub Pages
        
4. You can also manually run `deploy-hugo.yml` in `username.github.io` to force a rebuild
    

---

## Why Two Tokens?

- **`GITHUB_TOKEN`** (auto-provided)
    
    - Used for **commits inside `obsidian-note-vault-repo`**
        
    - Only works in same repo
        
- **`OBSIDIAN_NOTE_TO_HUGO_PAT`** (your fine-grained PAT)
    
    - Used for **cross-repo triggers** and **submodule updates**
        
    - Scoped to just the two repos with least privilege
        

---

With this, you now have a **clean CI/CD pipeline**: Obsidian → Notes repo → Hugo → GitHub Pages, with manual override.
