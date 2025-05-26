// @ts-check
// CommonJS module for electron-builder afterSign hook

const { exec } = require('child_process');
const path = require('path');

/**
 * @param {object} context - electron-builder context
 */
module.exports = async function (context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName === 'darwin') {
        console.log('Esecuzione dello script specifico per macOS...');
        // Esegui lo script macOS
        return new Promise((resolve, reject) => {
            exec(`bash ${path.join(__dirname, 'installer.sh')} "${appOutDir}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Errore di esecuzione: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`Output: ${stdout}`);
                if (stderr) console.error(`Errore: ${stderr}`);
                resolve();
            });
        });
    } else {
        console.log(`Salto lo script per la piattaforma: ${electronPlatformName}`);
        return Promise.resolve();
    }
};
