#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo "Specify a version number!" >&2
  exit 1
fi

# Generate a Resource Pack ZIP file that can be distributed with the release
yarn build && QUIET=1 node dist/main.js $1
ZIP_COUNT=$(ls -1q out/Capitalisation-Fixes-$1-*.zip | wc -l)
echo "Built $ZIP_COUNT Resource Pack .zip file(s): $PWD/out"

# Push all outstanding commits
git push

# Create a new Git tag and push it to GitHub
git tag $1
git push origin $1

echo "Created new tag $1 successfully. Now go create a GitHub release!"
echo "https://github.com/MMK21Hub/Capitalisation-Fixes/releases/new?tag=$1"