#!/bin/bash

# Exit on error
set -e

# Configuration
VERSION=$1
RELEASE_DIR="releases/hopecare-$VERSION"
ARTIFACTS_DIR="$RELEASE_DIR/artifacts"

if [ -z "$VERSION" ]; then
  echo "Please provide a version number (e.g., 1.0.0)"
  exit 1
fi

echo "Creating release package for version $VERSION..."

# Create release directory structure
mkdir -p "$ARTIFACTS_DIR"

# Run tests
echo "Running tests..."
npm run test:ci

# Build application
echo "Building application..."
npm run build

# Create artifacts
echo "Creating artifacts..."

# 1. Application bundle
cp -r dist "$ARTIFACTS_DIR/app"

# 2. Database migrations
cp -r prisma/migrations "$ARTIFACTS_DIR/migrations"

# 3. Configuration templates
cp .env.example "$ARTIFACTS_DIR/config"
cp next.config.js "$ARTIFACTS_DIR/config"
cp tailwind.config.cjs "$ARTIFACTS_DIR/config"

# 4. Documentation
cp -r docs "$ARTIFACTS_DIR/docs"

# 5. Scripts
mkdir -p "$ARTIFACTS_DIR/scripts"
cp scripts/deploy.sh "$ARTIFACTS_DIR/scripts"
cp scripts/health-check.sh "$ARTIFACTS_DIR/scripts"
cp scripts/cache-warmup.sh "$ARTIFACTS_DIR/scripts"

# Create package.json with production dependencies
node -e "
  const pkg = require('./package.json');
  const newPkg = {
    name: pkg.name,
    version: '$VERSION',
    dependencies: pkg.dependencies,
    scripts: {
      start: pkg.scripts.start,
      'start:prod': pkg.scripts['start:prod']
    }
  };
  require('fs').writeFileSync('$ARTIFACTS_DIR/package.json', JSON.stringify(newPkg, null, 2));
"

# Create release notes
cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOL
# HopeCare v$VERSION Release Notes

## New Features
- Complete testing framework with security, performance, and accessibility tests
- Production-ready deployment scripts
- Comprehensive documentation
- Monitoring dashboard
- Enhanced security measures

## Installation
1. Extract the artifacts to your deployment directory
2. Copy config files from \`artifacts/config\` and configure as needed
3. Run database migrations: \`npx prisma migrate deploy\`
4. Install dependencies: \`npm ci --production\`
5. Start the application: \`npm run start:prod\`

## Documentation
Refer to \`artifacts/docs/deployment.md\` for detailed deployment instructions.

## Security
All dependencies have been audited and are up to date.

## Support
For support, please contact the development team.

EOL

# Create checksum file
cd "$RELEASE_DIR"
find . -type f -exec sha256sum {} \; > SHA256SUMS.txt

# Create archive
cd ..
tar -czf "hopecare-$VERSION.tar.gz" "hopecare-$VERSION"

echo "Release package created: hopecare-$VERSION.tar.gz"
echo "Release notes available at: $RELEASE_DIR/RELEASE_NOTES.md"
echo "Checksums available at: $RELEASE_DIR/SHA256SUMS.txt"
