# Modrinth publishing tool

A semi-automatic tool to publish versions of the pack to Modrinth.

It uploads the latest batch of pack ZIP files built by the build tool, using the `out/index.json` file for reference.

## Setup

Create a [Modrinth personal access token](https://modrinth.com/settings/pats) with the "create versions" scope.

Create a `.env` file with the following environment variables:

```env
MODRINTH_API=https://staging-api.modrinth.com # Set to https://api.modrinth.com to publish to the real Modrinth site
MODRINTH_PROJECT_ID=JdXoJZy7 # The ID of the Capitalisation Fixes project
MODRINTH_TOKEN= # Personal access token for an account that has permission to upload to the Modrinth project
```

Ensure this file does not get committed or leaked.

## Usage

1. Run the build tool. Ensure you provide a version brand. E.g. `node dist/main.js v2.20`
2. Follow the given instructions to write a changelog.
3. Confirm the changelog to publish the releases.
4. Wait for it to upload the files, and check that everything looks sane on <https://modrinth.com/resourcepack/capitalisation-fixes/versions>.

### Adding new Minecraft versions without bumping the pack version

If there's no changes in the pack, we add support for new Minecraft versions without creating a new release of the pack.

When doing this, there are a few things to get right when using the publisher:

- Naturally, ensure the pack version brand is correct (like `v2.20`).
- Ideally, generate all Minecraft version variants with the build tool. The publisher will avoid uploading any duplicate files.
  - If this isn't possible, only generate the new variant(s). This is because ZIP file checksums won't match (due to the different `capitalisation_fixes.json` file) if a different set of variants is built.
  - In the future, the publisher should have a smarter way to avoid duplicates.
- Ensure the `release/changelog.md` file matches the changelog published with the previous variants. Copy/paste from Modrinth if needed.

Finally, don't forget to upload the new variant(s) to the latest GitHub release, and update the README as appropriate (<kbd>Ctrl</kbd>+<kbd>F</kbd> for the previous MC version and double-check the download links at the top of the README).

See [issue #12](https://github.com/MMK21Hub/Capitalisation-Fixes/issues/12) for ideas to make this process easier.

### Guidelines for writing changelogs

- Don't use heading levels 1 or 2, because that messes up the accessibility tree on Modrinth/GitHub Releases. You can use heading level 3 or below.
