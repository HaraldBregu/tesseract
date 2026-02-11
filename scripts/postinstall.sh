#!/bin/bash

if type update-alternatives 2>/dev/null >&1; then
    # Remove previous link if it doesn't use update-alternatives
    if [ -L '/usr/bin/criterion' -a -e '/usr/bin/criterion' -a "`readlink '/usr/bin/criterion'`" != '/etc/alternatives/criterion' ]; then
        rm -f '/usr/bin/criterion'
    fi
    update-alternatives --install '/usr/bin/criterion' 'criterion' '/opt/Criterion/criterion' 100 || ln -sf '/opt/Criterion/criterion' '/usr/bin/criterion'
else
    ln -sf '/opt/Criterion/criterion' '/usr/bin/criterion'
fi

# Always set SUID permissions for chrome-sandbox to ensure Electron works properly
# This is required for the Chrome sandbox to function correctly
if [ -f '/opt/Criterion/chrome-sandbox' ]; then
    chmod 4755 '/opt/Criterion/chrome-sandbox' || true
    echo "Set SUID permissions on chrome-sandbox"
fi

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# Update icon cache
if hash gtk-update-icon-cache 2>/dev/null; then
    gtk-update-icon-cache /usr/share/icons/hicolor/ 2>/dev/null || true
fi 