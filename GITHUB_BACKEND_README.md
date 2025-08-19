# GitHub Backend Integration for Music Blocks

This document explains how Music Blocks integrates with a Git-backed backend to publish, browse, fork, version, and load projects on GitHub. It replaces the legacy Planet server flows with a modern GitHub-centric workflow.

The frontend talks to a backend service over HTTP (default base URL: `http://localhost:3000`) under the `/api/github` path. This backend, in turn, talks to the GitHub API and a configured organization/user (i.e `musicblocks-projects`).

Note: This is a thin client integration; the backend implementation is not part of this repository. You must run a compatible service exposing the endpoints described below.

## Features at a glance

- Initialize a new GitHub repository from the current project
- Push changes with a commit message (versioning)
- Browse all public projects and open them in Music Blocks
- View commit history and load a specific revision
- Fork a project into your own repository
- Download a project as a ZIP from GitHub
- Track your own projects locally for quick access

## UI entry points

From the main toolbar GitHub menu in `index.html`:

- “Initialise a Repo” → creates a repo and publishes the current project
- “Push changes” → commits the current project to the existing repo
- “Get commits” → shows commit history; load any version into the editor
- “Fork this project” → creates a fork of the currently opened project
- “Download the project” → downloads a ZIP from GitHub
- “Your Projects” → opens `localProjects.html` (projects you created/forked)
- “All Projects” → opens `projects.html` (projects discovered via backend)

Supporting pages:

- `projects.html` lists projects via `/api/github/allRepos` and opens them
- `localProjects.html` lists your “local” project catalog (stored in `localStorage`) and opens them

## How it replaces Planet server

The legacy Planet server (see `planet/` and `planet/js/ServerInterface.js`) provided centralized listing, sharing, and loading. The GitHub integration replaces those flows by:

- Publishing projects as Git repositories in a GitHub org/user
- Using issues/commits/tags (via Git) for history and collaboration
- Providing discovery via the backend’s aggregated list of repos

Planet code remains for reference and backwards compatibility, but the new recommended flows use the GitHub menu and the two project list pages.

## Backend API (contract)

Base URL: `http://localhost:3000` (configurable in your backend; hardcoded in the frontend at time of writing)

All endpoints below must be CORS-enabled for the origin serving Music Blocks.

### POST /api/github/create

Create a new repo and publish the current project.

Request body (JSON):

```json
{
  "repoName": "my-musicblocks-project",
  "projectData": { /* Music Blocks JSON */ },
  "theme": "music,art,math",
  "description": "Short description"
}
```

Response (JSON):

```json
{
  "repository": "my-musicblocks-project",
  "key": "opaque-edit-key"
}
```

Frontend behavior:

- On success, stores an entry in `localStorage` under `all` with `{ projectName, key, description }`
- Sets `currProject` and `currKey` for subsequent pushes

### PUT /api/github/edit

Commit the current project to an existing repo.

Request body (JSON):

```json
{
  "repoName": "my-musicblocks-project",
  "key": "opaque-edit-key",
  "projectData": { /* Music Blocks JSON */ },
  "commitMessage": "Describe what changed"
}
```

Response (JSON):

```json
{ "success": true }
```

### GET /api/github/commitHistory?repoName=:repo

Return commits for a repository. The frontend expects a list in the GitHub shape:

Example response:

```json
[
  {
    "sha": "abc123...",
    "commit": {
      "message": "Initial commit",
      "author": { "date": "2025-01-01T00:00:00Z" }
    }
  }
]
```

### GET /api/github/getProjectData?repoName=:repo

Return the latest project data for a repository.

Response (JSON):

```json
{
  "content": {
    "projectData": "{\n  \"blocks\": [ ... ]\n}"
  }
}
```

The `projectData` value is a stringified JSON document; the frontend stores it in `localStorage` and then parses it when loading the editor.

### GET /api/github/getProjectDataAtCommit?repoName=:repo&sha=:sha

Return the project state at a specific commit.

Response body: a raw JSON string for the blocks document (not wrapped), which the frontend parses directly.

Example (response body):

```json
{
  "blocks": [
    /* ... */
  ]
}
```

### GET /api/github/allRepos?page=:page

Paginated list of repositories available for discovery.

Response (JSON):

```json
{
  "data": [
    {
      "name": "my-musicblocks-project",
      "description": "...",
      "topics": ["music", "education"]
    }
  ]
}
```

The frontend keeps fetching pages until a page returns fewer items than requested (50).

### POST /api/github/forkHistory

Fork the currently opened project.

Request body (JSON):

```json
{ "sourceRepo": "repo-to-fork" }
```

Response (JSON):

```json
{
  "success": true,
  "repoUrl": {
    "repoName": "forked-repo-name",
    "key": "opaque-edit-key",
    "description": "..."
  }
}
```

On success, the frontend records the fork in `localStorage` (`all`) and sets `currProject`/`currKey`.

## Local storage keys (frontend)

- `all`: Array of your known repos `[ { projectName, key, description } ]`
- `currProject`: Repo name currently targeted for pushes
- `currKey`: Edit key used for pushes
- `repoName`: Helper key saved when navigating in discovery flows
- `musicblocks_blocks`: Temporary storage for blocks to load into the editor
- `SESSIONMy Project`: Also used to stage blocks when navigating

## Downloading projects

The “Download the project” action does a direct download from GitHub:

`https://github.com/musicblocks-projects/${repoName}/archive/refs/heads/main.zip`

Adjust the org/user and default branch in your backend or frontend if needed.

## Running the backend

You need a service exposing the API described above. Typical requirements:

- GitHub Personal Access Token with `repo` scope
- Configured target organization/user (e.g., `musicblocks-projects`)
- CORS enabled for your frontend origin
- JSON request/response bodies matching the contracts above

Recommended local setup:

1. Serve Music Blocks frontend on a port other than 3000 (e.g., 8080) or from `file://`.
2. Run your backend on `http://localhost:3000` to match the hardcoded endpoints.
3. Ensure CORS allows the frontend origin (including `file://` if testing directly from the filesystem).

If you must run the frontend on 3000, proxy `/api/github/**` to your backend via your dev server or reverse proxy.

## Development notes

- Endpoints are currently hardcoded to `http://localhost:3000` in the frontend (`index.html`, `projects.html`, `localProjects.html`, and `js/activity.js`). If you host the backend elsewhere, update these URLs or introduce a configurable base URL.
- `getProjectData` and `getProjectDataAtCommit` intentionally return different shapes (wrapped vs raw JSON string). Ensure your backend matches this behavior or adjust the frontend accordingly.
- The “edit key” is stored in `localStorage`. For production, prefer proper authentication tied to users rather than opaque keys persisted in the browser.

## Manual test checklist

1. Initialise a repo
   - Open main app → GitHub menu → “Initialise a Repo”
   - Provide repo name, theme(s), description
   - Verify success toast and that the repo appears under “Your Projects”
2. Push changes
   - Modify blocks → “Push changes” → enter a commit message → expect success
3. Browse and open
   - Open `projects.html` → wait for cards → click “Open in MusicBlocks” on any repo → verify blocks load
4. Commit history
   - In the main app → “Get commits” → dialog appears → click “Load this version” on a commit → verify blocks load
5. Fork
   - With a project opened from discovery, click “Fork this project” → expect success, fork appears in “Your Projects”
6. Download
   - Click “Download the project” → ZIP download starts

## Files touched by this integration

- `index.html` — GitHub menu actions and commit-history modal, fork and download handlers
- `projects.html` — discovery of all repos via `/api/github/allRepos`
- `localProjects.html` — personal project catalog using `localStorage`
- `js/activity.js` — toolbar GitHub dropdown wiring and calls to `create`/`edit`
- `js/toolbar.js` — renders the GitHub menu and binds handlers

## Troubleshooting

- “Failed to load projects” on `projects.html` → backend not reachable, CORS, or response shape mismatch
- “Failed to create/edit repository” toast → check backend logs and request body
- Nothing happens on “Get commits” → missing `currProject` in `localStorage`; ensure you opened/created a repo first
- ZIP download 404 → confirm org/user and default branch names

## Future improvements

- Configurable backend base URL (env or query param)
- OAuth-based auth instead of opaque keys
- Consistent response shapes for project data endpoints
- Server-side indexing and search across repos


