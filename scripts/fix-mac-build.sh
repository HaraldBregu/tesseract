#!/bin/bash

# Fix macOS Build Issues for Apple Silicon Macs
# This script handles:
# - PKG builder process cleanup
# - Temporary files cleanup
# - Node.js rebuild issues

set -e

echo "🔧 Fixing macOS build issues for Apple Silicon..."

# Function to kill stuck build processes
kill_stuck_processes() {
    echo "🔍 Checking for stuck PKG builder processes..."
    
    local pkg_pids=$(ps aux | grep -E "productbuild|pkgbuild|pkgutil" | grep -v grep | awk '{print $2}' || true)
    
    if [ -n "$pkg_pids" ]; then
        echo "⚡ Found stuck PKG builder processes, killing them:"
        for pid in $pkg_pids; do
            echo "   Killing PID: $pid"
            sudo kill -9 "$pid" 2>/dev/null || true
        done
    else
        echo "✅ No stuck PKG builder processes found"
    fi
}

# Function to clean temporary files
cleanup_temp_files() {
    echo "🗑️  Cleaning temporary build files..."
    
    # Remove temp PKG files
    sudo rm -rf /private/var/folders/*/*/TemporaryItems/NSIRD_productbuild* 2>/dev/null || true
    sudo rm -rf /tmp/criterion-* 2>/dev/null || true
    sudo find /tmp -name "*Criterion*.pkg*" -delete 2>/dev/null || true
    
    # Clean up any partial PKG files in dist
    if [ -d "dist" ]; then
        find dist -name "*Criterion*.pkg.tmp" -delete 2>/dev/null || true
        find dist -name "*partial*" -delete 2>/dev/null || true
    fi
    
    # Clean up build output directories with proper permissions
    if [ -d "out" ]; then
        echo "🔧 Fixing permissions for out directory..."
        sudo chmod -R 755 out/ 2>/dev/null || true
        sudo chown -R $(whoami) out/ 2>/dev/null || true
    fi
    
    if [ -d "dist" ]; then
        echo "🔧 Fixing permissions for dist directory..."
        sudo chmod -R 755 dist/ 2>/dev/null || true
        sudo chown -R $(whoami) dist/ 2>/dev/null || true
    fi
    
    echo "✅ Temporary files cleaned"
}

# Function to fix node-gyp and electron-rebuild issues
fix_node_rebuild_issues() {
    echo "⚙️  Fixing node-gyp and electron-rebuild issues..."
    
    # Fix permissions on node_modules
    if [ -d "node_modules" ]; then
        echo "🔧 Fixing node_modules permissions..."
        sudo chown -R $(whoami) node_modules/ 2>/dev/null || true
        sudo chmod -R 755 node_modules/ 2>/dev/null || true
        
        # Specifically fix build directories
        sudo find node_modules -name "build" -type d -exec chmod -R 755 {} \; 2>/dev/null || true
        sudo find node_modules -name "build" -type d -exec chown -R $(whoami) {} \; 2>/dev/null || true
        
        # Clean up any stuck .target.mk files
        find node_modules -name ".target.mk" -delete 2>/dev/null || true
        find node_modules -name "*.tmp" -delete 2>/dev/null || true
    fi
    
    # Clear electron and electron-builder caches
    echo "🗑️  Clearing electron build caches..."
    rm -rf node_modules/.cache/electron 2>/dev/null || true
    rm -rf node_modules/.cache/electron-builder 2>/dev/null || true
    rm -rf ~/.cache/electron 2>/dev/null || true
    rm -rf ~/.cache/electron-builder 2>/dev/null || true
    
    # Clear npm cache for native modules
    npm cache clean --force 2>/dev/null || true
    
    echo "✅ Node rebuild issues fixed"
}

# Main execution
main() {
    echo "🚀 Apple Silicon macOS Build Fix"
    echo "================================="
    
    # Run all cleanup functions
    kill_stuck_processes
    cleanup_temp_files
    fix_node_rebuild_issues
    
    # Wait for system to settle
    echo "⏳ Waiting for system to settle..."
    sleep 2
    
    echo "🎉 macOS build fix completed!"
    echo ""
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
