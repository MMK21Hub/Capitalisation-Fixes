#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo "Specify a version number!" >&2
  exit 1
fi

if [[ $(git tag -l $1) ]]; then
  echo "That version already exists!" >&2
  exit 2
fi

# Generate a Resource Pack ZIP file that can be distributed with the release
yarn build && QUIET=1 node dist/main.js $1
BUILD_STATUS=$?
ZIP_COUNT=$(ls -1q out/Capitalisation-Fixes-$1-*.zip | wc -l)

if [[ $ZIP_COUNT == 0 || $BUILD_STATUS != 0 ]]; then
  echo "Build script was unsuccessful!" >&2
  [[ $BUILD_STATUS != 0 ]] && echo "See error message above." >&2
  [[ $ZIP_COUNT == 0 ]] && echo "No output files were found." >&2
  exit 1
fi

echo "Built $ZIP_COUNT Resource Pack .zip file(s): $PWD/out"

# Push all outstanding commits
git push

# Create a new Git tag and push it to GitHub
git tag $1
git push origin $1

# Update the package.json version
# https://classic.yarnpkg.com/en/docs/cli/version
yarn version --new-version $1 --no-git-tag-version

echo "Created new tag $1 successfully. Now go create a GitHub release!"
echo "https://github.com/MMK21Hub/Capitalisation-Fixes/releases/new?tag=$1"
echo "After that, upload the new release to Modrinth (documentation coming soon)."