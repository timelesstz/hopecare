# Script to organize markdown files into appropriate documentation categories

# Migration-related files
$migrationFiles = @(
    "MIGRATION-GUIDE.md",
    "MIGRATION_CHECKLIST.md",
    "MIGRATION_COMPLETE.md",
    "MIGRATION_GUIDE.md",
    "MIGRATION_PROGRESS.md",
    "MIGRATION_REPORT.md",
    "MIGRATION_SUMMARY.md",
    "scripts\migration\migration-plan.md"
)

# Authentication-related files
$authFiles = @(
    "AUTH_GUIDE.md",
    "AUTH_TESTING.md",
    "LOGIN_DETAILS.md"
)

# Firebase-related files
$firebaseFiles = @(
    "FIREBASE_OPTIMIZATION.md",
    "FIREBASE_SECURITY_RULES.md",
    "FIREBASE_SETUP.md",
    "FIRESTORE_INDEXES.md",
    "MISSING_INDEX_HANDLING.md"
)

# Testing-related files
$testingFiles = @(
    "TEST_PLAN.md",
    "PAYMENT_TESTING.md"
)

# Deployment-related files
$deploymentFiles = @(
    "VERCEL_DEPLOYMENT.md"
)

# Guide files (existing docs files to keep in place)
$guideFiles = @(
    "docs\cms-implementation.md",
    "docs\color-guide.md",
    "docs\debugging-guide.md",
    "docs\deployment.md",
    "docs\get-involved.md",
    "docs\governance.md",
    "docs\impact.md",
    "docs\organization.md",
    "docs\past-projects.md",
    "docs\programs.md",
    "docs\progress.md",
    "docs\roadmap.md"
)

# Move migration files
foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file -Destination "docs\migration\$fileName" -Force
        Write-Host "Moved $file to docs\migration\$fileName"
    }
    else {
        Write-Host "File not found: $file"
    }
}

# Move authentication files
foreach ($file in $authFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file -Destination "docs\authentication\$fileName" -Force
        Write-Host "Moved $file to docs\authentication\$fileName"
    }
    else {
        Write-Host "File not found: $file"
    }
}

# Move Firebase files
foreach ($file in $firebaseFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file -Destination "docs\firebase\$fileName" -Force
        Write-Host "Moved $file to docs\firebase\$fileName"
    }
    else {
        Write-Host "File not found: $file"
    }
}

# Move testing files
foreach ($file in $testingFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file -Destination "docs\testing\$fileName" -Force
        Write-Host "Moved $file to docs\testing\$fileName"
    }
    else {
        Write-Host "File not found: $file"
    }
}

# Move deployment files
foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file -Destination "docs\deployment\$fileName" -Force
        Write-Host "Moved $file to docs\deployment\$fileName"
    }
    else {
        Write-Host "File not found: $file"
    }
}

# Handle special cases
if (Test-Path "README.md") {
    Copy-Item "README.md" -Destination "docs\README.md" -Force
    Write-Host "Copied README.md to docs\README.md"
}

if (Test-Path "changes.md") {
    Copy-Item "changes.md" -Destination "docs\CHANGELOG.md" -Force
    Write-Host "Moved changes.md to docs\CHANGELOG.md"
}

# Create index files for each category
@"
# Migration Documentation

This directory contains documentation related to the Firebase to Supabase migration.

## Files

$(foreach ($file in $migrationFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path "docs\migration\$fileName") {
        "- [$fileName](./$(Split-Path $file -Leaf))"
    }
})
"@ | Out-File -FilePath "docs\migration\README.md" -Encoding utf8

@"
# Authentication Documentation

This directory contains documentation related to authentication in the HopeCare application.

## Files

$(foreach ($file in $authFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path "docs\authentication\$fileName") {
        "- [$fileName](./$(Split-Path $file -Leaf))"
    }
})
"@ | Out-File -FilePath "docs\authentication\README.md" -Encoding utf8

@"
# Firebase Documentation

This directory contains documentation related to Firebase configuration and usage.

## Files

$(foreach ($file in $firebaseFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path "docs\firebase\$fileName") {
        "- [$fileName](./$(Split-Path $file -Leaf))"
    }
})
"@ | Out-File -FilePath "docs\firebase\README.md" -Encoding utf8

@"
# Testing Documentation

This directory contains test plans and testing-related documentation.

## Files

$(foreach ($file in $testingFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path "docs\testing\$fileName") {
        "- [$fileName](./$(Split-Path $file -Leaf))"
    }
})
"@ | Out-File -FilePath "docs\testing\README.md" -Encoding utf8

@"
# Deployment Documentation

This directory contains documentation related to deploying the HopeCare application.

## Files

$(foreach ($file in $deploymentFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path "docs\deployment\$fileName") {
        "- [$fileName](./$(Split-Path $file -Leaf))"
    }
})
"@ | Out-File -FilePath "docs\deployment\README.md" -Encoding utf8

# Create main index file
@"
# HopeCare Documentation

This directory contains all documentation for the HopeCare application.

## Categories

- [Migration](./migration/README.md) - Firebase to Supabase migration documentation
- [Authentication](./authentication/README.md) - Authentication-related documentation
- [Firebase](./firebase/README.md) - Firebase configuration and usage
- [Deployment](./deployment/README.md) - Deployment guides and procedures
- [Testing](./testing/README.md) - Test plans and procedures
- [Guides](./guides/README.md) - General guides and documentation

## Other Documentation

- [Changelog](./CHANGELOG.md) - Record of changes to the application
"@ | Out-File -FilePath "docs\README.md" -Encoding utf8

Write-Host "Documentation organization complete!"
