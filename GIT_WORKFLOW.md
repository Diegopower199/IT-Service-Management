# Git Workflow — Help Desk

**English** | [Español](./GIT_WORKFLOW.es.md)

This guide describes the Git and GitHub workflow for Help Desk. Keep `main` stable and develop each significant change on a separate branch.

## 1. Branch conventions

Choose a prefix that describes the branch's purpose. Use a short, specific name after the slash.

| Prefix | When to use it | Help Desk example |
| --- | --- | --- |
| `feat/` | New functionality. | `feat/demo-account-restrictions` |
| `fix/` | A bug fix. | `fix/demo-avatar-deletion` |
| `docs/` | Documentation changes. | `docs/project-documentation` |
| `refactor/` | Internal changes that preserve behavior. | `refactor/database-scripts` |
| `test/` | New or updated tests. | `test/auth-service` |
| `chore/` | Maintenance or configuration. | `chore/docker-development-settings` |

The repository retains older branches with the `feature/` prefix, such as `feature/ticket-attachments`. Use `feat/` for new functionality and keep existing branch names as they are.

## 2. Start a task

Check `git status` before switching branches or running `git pull`. If you have pending changes, review them first and save the work on the appropriate branch. Follow the sequence below with a clean working tree. After switching to `main`, check its status before pulling and review any pending local commits. Replace the example name if a branch with that name already exists.

```bash
git status
git switch main
git pull origin main
git switch -c docs/project-documentation
```

Make the changes on that branch. Review and commit the work before publishing it to GitHub.

## 3. Review and commit changes

Review the status and diff before staging files. This example stages only `README.md`. Read the entire staged diff before running the last command.

```bash
git status
git diff
git add README.md
git diff --cached
git commit -m "docs: update project documentation"
```

- `git status` shows the current branch and staged, unstaged, or new files.
- `git diff` shows unstaged changes to files Git already tracks. For new files, read their contents or view the diff after staging.
- `git add README.md` stages the contents of that file for the next commit.
- `git diff --cached` shows all changes that would go into the commit.
- `git commit -m "docs: update project documentation"` records the staged changes with that message.

### Conventional Commits

Write commit messages in English. Use a type that identifies the reason for the change and a specific description.

| Type | When to use it | Example |
| --- | --- | --- |
| `feat:` | Add functionality. | `feat: restrict demo account permissions` |
| `fix:` | Correct incorrect behavior. | `fix: allow demo accounts to delete their own avatars` |
| `docs:` | Change documentation. | `docs: update backend API documentation` |
| `refactor:` | Restructure the implementation without changing behavior. | `refactor: organize database initialization scripts` |
| `test:` | Add or update tests. | `test: add demo account authorization tests` |
| `chore:` | Maintain project tooling or configuration. | `chore: update Docker development settings` |

Another example is `docs: add Spanish translation of frontend README`. During development, make several small commits as needed, each with a specific purpose.

### Check for private files before committing

Stage files by name. Review the names and contents in the staged diff for any `.env` or `.env.dev` files, passwords, tokens, private keys and certificates, credential files, `database/03_seed_admin.sql`, and other local files. A secret can also appear inside a source file or documentation that belongs in the change.

```bash
git diff --cached --name-only
git check-ignore -v -- .env .env.dev database/03_seed_admin.sql
git ls-files -- .env .env.dev database/03_seed_admin.sql
```

`git diff --cached --name-only` lists staged files. `git check-ignore -v` shows which ignore rule applies to each path. `git ls-files` checks whether any of those paths are already in Git's index. If it lists one, review its status before publishing.

`.gitignore` applies to files that Git does not already track. A committed secret can remain in earlier commits. If a secret was published, revoke or rotate it and coordinate its removal.

## 4. Push the branch to GitHub

Use `git status` to confirm you are on the work branch. Once your commits are ready and reviewed, publish the branch and set its upstream.

```bash
git push -u origin docs/project-documentation
```

Use this command to publish subsequent commits from that branch once the upstream is set.

```bash
git push
```

Pushing the work branch publishes its commits to GitHub. The Pull Request integrates the work into `main` later.

## 5. Update a branch and resolve conflicts

If `main` has advanced, check the status and save any pending work first. With a clean working tree, update your local copy of `main` and merge it into the work branch.

```bash
git switch main
git pull origin main
git switch docs/project-documentation
git merge main
```

If Git completes the merge automatically, the step is complete and no extra commit is needed. If there are conflicts, identify the files that remain unresolved.

```bash
git status
git diff --name-only --diff-filter=U
```

Review the changes and conflict markers in each file. Resolve the content manually so it preserves the necessary changes from both branches, then remove the conflict markers. Stage only the files you resolved. In the example, replace `README.md` with each affected file. When `git status` reports that all conflicts are resolved and a merge is still in progress, complete it.

```bash
git add README.md
git diff --cached
git status
git merge --continue
```

If you need to cancel a merge that is still in progress, use `git merge --abort`. Git attempts to restore the pre-merge state. Save any resolutions you want to keep separately before aborting. Changes that were already uncommitted when the merge started can complicate recovery, so start with a clean working tree.

```bash
git merge --abort
```

After the merge completes, recheck the affected parts and publish the result to the work branch.

## 6. Open and review a Pull Request

1. Publish the branch and open a Pull Request on GitHub. Check that the base is `main` and that the compare branch is the one for your task.

   ```text
   base: main
   compare: docs/project-documentation
   ```

2. Write a clear title. Explain what changed and why, and list the tests or checks you ran with their results.
3. Review the **Files changed** tab. Check that the diff contains only changes related to the task and that it contains no secrets or private files.
4. Resolve any conflicts reported by GitHub on the work branch, rerun affected checks, and publish the changes. Address any review feedback as well.
5. Merge into `main` once the diff is correct, you have reviewed the check results, and any requirements GitHub lists for the Pull Request are met.

You can copy this template into the Pull Request description.

```markdown
## Summary
- What changed and why

## Verification
- Commands or manual checks run and their results
- Checks not run, if any

## Review
- [ ] I reviewed the diff and confirmed it contains no secrets or private files.
- [ ] I resolved any merge conflicts and rechecked the affected changes.
```

## 7. Checks before merging

Accompany functional changes with tests appropriate for the behavior that changes. For documentation work, check the Markdown, links, and commands against the project's files and scripts.

### Backend

Run the Maven Wrapper from `back-end/`. Use the Windows command in PowerShell.

```powershell
.\mvnw.cmd clean verify
```

On Linux or macOS, give the wrapper execute permission if needed with `chmod u+x mvnw`, then use this command.

```bash
./mvnw clean verify
```

`clean verify` clears previous output, compiles the project, runs the configured tests, and executes the Maven lifecycle up through the verification phase.

### Frontend

From `front-end/`, set the API variables the frontend needs and run these commands. [Frontend environment variables](./front-end/README.md#environment-variables)

```bash
npm ci
npm run check
```

`npm ci` installs dependencies from the lockfile. `npm run check` runs ESLint, Vitest once, and the Next.js production build, in that order. It stops if a step fails.

Supplement automated tests with integration checks as appropriate, for example when changing authentication, the MySQL connection, or GridFS attachment storage. In the Pull Request, report which checks you ran and which are still pending. Mark a check as passed only if you ran it successfully. [Testing and Quality Checks](./README.md#testing-and-quality-checks)

## 8. Clean up after the Pull Request

Confirm the Pull Request was merged into `main` and the branch has no pending local work. With a clean working tree, update `main` and delete the already integrated local branch.

```bash
git switch main
git pull origin main
git branch -d docs/project-documentation
```

If `git branch -d` refuses deletion, review the Pull Request and verify where the work was integrated. A squash merge can integrate changes with different commit IDs. Keep the branch until you can confirm that all work is safe.

On GitHub, use **Delete branch** on the merged Pull Request to remove the remote branch if it still exists. Check that no one depends on it and that other Pull Requests do not use it as their base. Keep any branch that still contains pending work.

## 9. Workflow at a glance

```text
main
  ↓
new branch
  ↓
development
  ↓
commits
  ↓
push
  ↓
Pull Request
  ↓
review
  ↓
merge
  ↓
main
```

## 10. Project practices

- Keep `main` stable and use Pull Requests to integrate changes from work branches.
- Make small, descriptive commits. Keep unrelated feature, refactoring, and documentation changes separate.
- Review the complete diff and leave secrets out before each push.
- Avoid rewriting shared branch history with a force push. If there is a justified reason, coordinate first with everyone who uses the branch.
- Review test results and relevant integration checks before merging.

These are the project's working conventions. GitHub branch rules and automated checks depend on repository configuration. Check any requirements GitHub displays and report local checks separately.
