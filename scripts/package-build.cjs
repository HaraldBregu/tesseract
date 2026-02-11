/**
 * Cross-platform script to package build artifacts
 * Usage: node scripts/package-build.cjs <platform> <env>
 *   platform: windows | linux | macos
 *   env: dev | stg | pre
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const platform = args[0];
const env = args[1];

// Validate arguments
if (!platform || !env) {
  console.error('Usage: node scripts/package-build.cjs <platform> <env>');
  console.error('  platform: windows | linux | macos');
  console.error('  env: dev | stg | pre');
  process.exit(1);
}

if (!['windows', 'linux', 'macos'].includes(platform)) {
  console.error('Error: platform must be one of: windows, linux, macos');
  process.exit(1);
}

if (!['dev', 'stg', 'pre'].includes(env)) {
  console.error('Error: env must be one of: dev, stg, pre');
  process.exit(1);
}

// Get version from package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in current directory');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Define paths
const distDir = path.join(process.cwd(), 'dist');
const outputName = `${platform}-build-${env}-${version}.zip`;
const outputPath = path.join(distDir, outputName);

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error(`Error: dist directory not found at ${distDir}`);
  process.exit(1);
}

// Define file patterns based on platform
const patterns = {
  windows: ['.exe'],
  linux: ['.deb'],
  macos: ['.pkg']
};

const extensions = patterns[platform];

// Find artifacts
const files = fs.readdirSync(distDir).filter(file => {
  const filePath = path.join(distDir, file);
  // Only include files, not directories
  if (!fs.statSync(filePath).isFile()) return false;
  return extensions.some(ext => file.endsWith(ext));
});

if (files.length === 0) {
  console.error(`Error: No ${platform} artifacts (${extensions.join(', ')}) found in ${distDir}`);
  process.exit(1);
}

console.log(`📦 Packaging ${platform} build for environment: ${env}`);
console.log('');
console.log('Found artifacts:');
files.forEach(file => console.log(`  - ${file}`));

// Remove existing zip if present
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
  console.log(`\nRemoved existing archive: ${outputName}`);
}

console.log('');
console.log(`Creating archive: ${outputName}`);

// Create zip archive
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    // Use PowerShell on Windows with properly escaped paths
    const filePaths = files.map(f => path.join(distDir, f));
    // Escape single quotes for PowerShell by doubling them
    const filePathsArg = filePaths.map(p => `'${p.replace(/'/g, "''")}'`).join(',');
    const outputPathEscaped = outputPath.replace(/'/g, "''");
    const psCommand = `Compress-Archive -Path ${filePathsArg} -DestinationPath '${outputPathEscaped}' -Force`;
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
  } else {
    // Use zip command on Unix-like systems with proper quoting
    // Escape special characters in filenames
    const fileArgs = files.map(f => `'${f.replace(/'/g, "'\\''")}'`).join(' ');
    execSync(`cd '${distDir.replace(/'/g, "'\\''")}' && zip -9 '${outputName.replace(/'/g, "'\\''")}' ${fileArgs}`, { 
      stdio: 'inherit',
      shell: '/bin/bash'
    });
  }

  // Verify and show result
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('');
    console.log(`✅ Successfully created: ${outputPath}`);
    console.log(`📊 Size: ${sizeMB} MB`);
  } else {
    throw new Error('Archive was not created');
  }
} catch (error) {
  console.error('');
  console.error('❌ Error: Failed to create archive');
  console.error(error.message);
  process.exit(1);
}
