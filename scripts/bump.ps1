$newVersion = Invoke-Expression "git cliff --bumped-version"
$versionWithoutV = $newVersion.Replace("v", "")
Write-Output "Bumping to version $versionWithoutV"

Invoke-Expression "pnpm exec bumpp $versionWithoutV -qyp false --commit 'chore(release): release v%s'"

Invoke-Expression "git cliff -o CHANGELOG.md"
Write-Output "Updated CHANGELOG.md"
