# Package Lifecycle Action

[![CI](https://github.com/ovsds/package-lifecycle-action/workflows/Check%20PR/badge.svg)](https://github.com/ovsds/package-lifecycle-action/actions?query=workflow%3A%22%22Check+PR%22%22)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Package%20Lifecycle-blue.svg)](https://github.com/marketplace/actions/package-lifecycle)

Deletes package versions based on a lifecycle policy.
Highly recommended to be used with dry-run first to validate the policy before actually deleting any package versions.

## Usage

### Example

```yaml
jobs:
  package-lifecycle:
    permissions:
      packages: write

    steps:
      - name: Package Lifecycle
        id: package-lifecycle
        uses: ovsds/package-lifecycle-action@v1
        with:
          package-name: package-lifecycle-action/test-image
          package-type: container
          tag-regex: "^test-tag$"
          untagged: true
          expire-period-days: 10
          retained-tagged-top: 0
          retain-untagged: true
          dry-run: true
```

### Action Inputs

| Name                  | Description                                                                                                                                 | Default                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `package-name`        | The name of the package.                                                                                                                    |                                |
| `package-type`        | Type of the package. Supported values: container.                                                                                           | container                      |
| `owner`               | The owner of the repository.                                                                                                                | ${{ github.repository_owner }} |
| `tag-regex`           | Regex to match version tags to be considered for deletion.                                                                                  | `.*`                           |
| `untagged`            | Whether to apply to untagged versions.                                                                                                      | false                          |
| `expire-period-days`  | The amount of days that must elapse after the creation of a package version in order for it to be eligible for automatic deletion.          | 30                             |
| `retained-tagged-top` | The number of tagged package versions (matching the specified tag filter) that must be kept, even if the expire-period has already expired. | 1                              |
| `retain-untagged`     | Whether to retain untagged versions not older then the oldest retained tagged version.                                                      | true                           |
| `dry-run`             | Whether to perform a dry run, without actually deleting any package versions.                                                               | false                          |
| `github-token`        | GitHub token to authenticate with the GitHub API, scope: 'packages: write'.                                                                 | ${{ github.token }}            |

## Development

### Global dependencies

- [Taskfile](https://taskfile.dev/installation/)
- [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

### Taskfile commands

For all commands see [Taskfile](Taskfile.yaml) or `task --list-all`.

## License

[MIT](LICENSE)
