# Generate a Resource Pack ZIP file that can be distributed with the release
zip -r "Capitalisation-Fixes-$1.zip" assets/** pack.mcmeta README.md pack.png

# Push all outstanding commits
git push

# Create a new Git tag and push it to GitHub
git tag $1
git push origin $1

echo "Created new tag $1 successfully. Now go create a GitHub release!"