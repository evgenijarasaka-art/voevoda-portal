# Branch Protection Rules

## main

Enable:
- Require a pull request before merging
- Require approvals: 2
- Dismiss stale approvals
- Require review from Code Owners
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push
- Do not allow bypassing the above settings
- Include administrators

Allow only:
- Squash merging

Disable:
- Merge commits
- Rebase merging

## develop

Enable:
- Require a pull request before merging
- Require approvals: 1
- Require status checks
- Require branches to be up to date
- Include administrators
