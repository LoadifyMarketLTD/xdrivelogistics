# EXAMPLE: Testing Git LFS

This is a test document to demonstrate Git LFS setup.

## Quick Test

To test that Git LFS is working, try adding a test file:

```bash
# Create a dummy large file (for testing only)
dd if=/dev/zero of=test-large-file.mp4 bs=1M count=150

# Check file size (should be 150MB)
ls -lh test-large-file.mp4

# Add to git
git add test-large-file.mp4

# Check that it's tracked by LFS
git lfs ls-files

# You should see the file listed
# Commit and push
git commit -m "Test large file with LFS"
git push

# Clean up test file
rm test-large-file.mp4
git rm test-large-file.mp4
git commit -m "Remove test file"
git push
```

## Verifying LFS is Working

After adding a file, you can verify it's using LFS:

```bash
# Check LFS status
git lfs status

# List all LFS files
git lfs ls-files

# See what patterns are tracked
git lfs track
```

## What Happens Behind the Scenes

When you add a file matching an LFS pattern:
1. Git stores a small pointer file (~100 bytes) in the repository
2. The actual large file is stored in GitHub LFS storage
3. When someone clones the repo, they get the pointer initially
4. When they need the file, Git LFS downloads it automatically

This keeps your repository fast and lightweight!
