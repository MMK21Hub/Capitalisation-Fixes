#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo "Specify a version number!" >&2
  exit 1
fi

if [[ $(git tag -l $1) ]]; then
  echo "That version already exists!" >&2
  exit 2
fi

if [[ $(git status -s --porcelain) ]]; then
  echo "Warning: You have uncommited changes!" >&2
  echo "Please chack that you don't intend to include them in the release." >&2
  git status -s
  read -r -p "Press Ctrl+C to cancel, or Enter to continue. "
fi

# Generate a Resource Pack ZIP file that can be distributed with the release
yarn build && node dist/main.js $1
BUILD_STATUS=$?
ZIP_COUNT=$(ls -1q out/Capitalisation-Fixes-$1-*.zip | wc -l)

if [[ $ZIP_COUNT == 0 || $BUILD_STATUS != 0 ]]; then
  echo "Build script was unsuccessful!" >&2
  [[ $BUILD_STATUS != 0 ]] && echo "See error message above." >&2
  [[ $ZIP_COUNT == 0 ]] && echo "No output files were found." >&2
  exit 10
fi

echo "Built $ZIP_COUNT Resource Pack .zip file(s): $PWD/out"

# Update the package.json version
# https://yarnpkg.com/cli/version/
YARN_VERSION="$1.0"
echo "Updating package.json version to $YARN_VERSION"
yarn version $YARN_VERSION
YARN_VERSION_STATUS=$?

if [[ $YARN_VERSION_STATUS != 0 ]]; then
  echo "Failed to bump package.json version!" >&2
  exit 11
fi

# Commit the version bump to the package.json
git add package.json && git commit -m "Bump version for $1"
COMMIT_STATUS=$?

if [[ $COMMIT_STATUS != 0 ]]; then
  echo "Failed to commit the new package.json version!" >&2
  exit 12
fi

# Push all outstanding commits
git push
PUSH_STATUS=$?

if [[ $PUSH_STATUS != 0 ]]; then
  echo "Failed to upload the local commits!" >&2
  exit 13
fi

# Create a new Git tag and push it to GitHub
git tag $1
git push origin $1

echo "Created new tag $1 successfully. Now go create a GitHub release!"
echo "https://github.com/MMK21Hub/Capitalisation-Fixes/releases/new?tag=$1"
echo "After that, upload the new release to Modrinth (documentation coming soon)."