#!/bin/bash
newVersion=$(git cliff --bumped-version)
versionWithoutV=${newVersion#v}
echo "Bumping to version $versionWithoutV"

pnpm exec bumpp $versionWithoutV -qyp false --commit "chore(release): release v%s"

git cliff -o CHANGELOG.md
echo "Updated CHANGELOG.md"
