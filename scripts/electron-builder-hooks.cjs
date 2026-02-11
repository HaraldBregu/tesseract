/**
 * Electron Builder Hooks
 * These hooks are used to customize the build process for PKG installers on macOS
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

/**
 * afterPack hook - runs after the app is packaged but before the installer is created
 * We use this to inject custom scripts into the PKG
 */
exports.afterPack = async function (context) {
  // Only run for macOS pkg target
  if (context.electronPlatformName !== 'darwin') {
    return
  }

  console.log('afterPack: Preparing PKG scripts for macOS...')

  const scriptsSourceDir = path.join(context.packager.projectDir, 'scripts', 'pkg-scripts')
  const scriptsDestDir = path.join(context.packager.projectDir, 'dist', 'pkg-scripts-temp')

  // Check if source scripts exist
  if (!fs.existsSync(scriptsSourceDir)) {
    console.log('afterPack: No pkg-scripts directory found, skipping script injection')
    return
  }

  // Create temp directory for scripts
  if (!fs.existsSync(scriptsDestDir)) {
    fs.mkdirSync(scriptsDestDir, { recursive: true })
  }

  // Copy scripts to temp location
  const scripts = ['preinstall', 'postinstall']
  for (const script of scripts) {
    const srcPath = path.join(scriptsSourceDir, script)
    const destPath = path.join(scriptsDestDir, script)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      fs.chmodSync(destPath, '755')
      console.log(`afterPack: Copied ${script} script`)
    }
  }

  console.log('afterPack: PKG scripts prepared successfully')
}

/**
 * afterAllArtifactBuild hook - runs after all artifacts are built
 * We use this to rebuild the PKG with custom scripts using productbuild
 */
exports.afterAllArtifactBuild = async function (context) {
  const isMac = context.platformToTargets.has(require('electron-builder').Platform.MAC)
  if (!isMac) {
    return context.artifactPaths
  }

  const pkgArtifacts = context.artifactPaths.filter((p) => p.endsWith('.pkg'))
  if (pkgArtifacts.length === 0) {
    return context.artifactPaths
  }

  console.log('afterAllArtifactBuild: Rebuilding PKG with custom scripts...')

  const projectDir = context.configuration.directories?.output
    ? path.dirname(context.artifactPaths[0])
    : path.join(process.cwd(), 'dist')

  const scriptsDir = path.join(process.cwd(), 'scripts', 'pkg-scripts')

  // Check if scripts exist
  if (!fs.existsSync(scriptsDir)) {
    console.log('afterAllArtifactBuild: No scripts directory, returning original artifacts')
    return context.artifactPaths
  }

  const preinstallScript = path.join(scriptsDir, 'preinstall')
  const postinstallScript = path.join(scriptsDir, 'postinstall')

  if (!fs.existsSync(preinstallScript) && !fs.existsSync(postinstallScript)) {
    console.log('afterAllArtifactBuild: No pre/post install scripts found')
    return context.artifactPaths
  }

  for (const pkgPath of pkgArtifacts) {
    try {
      await rebuildPkgWithScripts(pkgPath, scriptsDir, projectDir)
      console.log(`afterAllArtifactBuild: Successfully rebuilt ${path.basename(pkgPath)} with scripts`)
    } catch (error) {
      console.error(`afterAllArtifactBuild: Failed to rebuild ${pkgPath}:`, error.message)
      // Don't fail the build, just log the error
    }
  }

  return context.artifactPaths
}

/**
 * Rebuild a PKG file with custom pre/post install scripts
 */
async function rebuildPkgWithScripts(pkgPath, scriptsDir, projectDir) {
  const tempDir = path.join(projectDir, 'pkg-rebuild-temp')
  const expandedDir = path.join(tempDir, 'expanded')
  const pkgName = path.basename(pkgPath)

  console.log(`Rebuilding ${pkgName} with scripts...`)

  // Clean up any previous temp directory - must be done BEFORE creating new one
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
  
  // Wait a bit for filesystem to catch up
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Create only the parent temp directory, NOT the expanded dir (pkgutil will create it)
  fs.mkdirSync(tempDir, { recursive: true })

  try {
    // Expand the existing PKG
    execSync(`pkgutil --expand "${pkgPath}" "${expandedDir}"`, { stdio: 'pipe' })

    // Find the component package directory
    const contents = fs.readdirSync(expandedDir)
    const componentPkg = contents.find((f) => f.endsWith('.pkg') && fs.statSync(path.join(expandedDir, f)).isDirectory())

    if (!componentPkg) {
      throw new Error('Could not find component package in expanded PKG')
    }

    const componentDir = path.join(expandedDir, componentPkg)

    // Create Scripts directory in the component package
    const scriptsDestDir = path.join(componentDir, 'Scripts')
    if (!fs.existsSync(scriptsDestDir)) {
      fs.mkdirSync(scriptsDestDir, { recursive: true })
    }

    // Copy scripts
    let scriptsAdded = false
    for (const scriptName of ['preinstall', 'postinstall']) {
      const srcScript = path.join(scriptsDir, scriptName)
      if (fs.existsSync(srcScript)) {
        const destScript = path.join(scriptsDestDir, scriptName)
        fs.copyFileSync(srcScript, destScript)
        fs.chmodSync(destScript, '755')
        console.log(`  Added ${scriptName} script`)
        scriptsAdded = true
      }
    }

    if (!scriptsAdded) {
      console.log('  No scripts to add')
      return
    }

    // Update PackageInfo to reference scripts
    const packageInfoPath = path.join(componentDir, 'PackageInfo')
    if (fs.existsSync(packageInfoPath)) {
      let packageInfo = fs.readFileSync(packageInfoPath, 'utf8')

      // Add scripts reference if not present
      if (!packageInfo.includes('<scripts>')) {
        // Insert scripts element before closing pkg-info tag
        packageInfo = packageInfo.replace(
          '</pkg-info>',
          '    <scripts>\n' +
            '        <preinstall file="./preinstall"/>\n' +
            '        <postinstall file="./postinstall"/>\n' +
            '    </scripts>\n' +
            '</pkg-info>'
        )
        fs.writeFileSync(packageInfoPath, packageInfo)
        console.log('  Updated PackageInfo with scripts reference')
      }
    }

    // Flatten the PKG back
    const newPkgPath = pkgPath + '.new'
    execSync(`pkgutil --flatten "${expandedDir}" "${newPkgPath}"`, { stdio: 'pipe' })

    // Replace the original PKG
    fs.unlinkSync(pkgPath)
    fs.renameSync(newPkgPath, pkgPath)

    console.log(`  Successfully rebuilt ${pkgName}`)
  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
  }
}
