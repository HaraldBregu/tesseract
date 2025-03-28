/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { transform } = require('@svgr/core');

const INPUT_DIR = 'src/renderer/src/assets/icons';
const OUTPUT_DIR = 'src/renderer/src/assets/reactIcons';

// Assicurati che la directory di output esista
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Leggi tutti i file SVG dalla directory di input
const svgFiles = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.svg'));

// Processa ogni file SVG
async function processFiles() {
    for (const file of svgFiles) {
        const filePath = path.join(INPUT_DIR, file);
        const componentName = file
            .replace(/\.svg$/, '')
            .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());

        const svgCode = fs.readFileSync(filePath, 'utf8');

        try {
            // Prima trasformazione per ottenere il JSX normale
            const result = await transform(
                svgCode,
                {
                    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                    icon: true,
                    typescript: true,
                    svgoConfig: {
                        plugins: [
                            {
                                name: 'preset-default',
                                params: {
                                    overrides: {
                                        removeViewBox: false
                                    }
                                }
                            },
                            {
                                name: 'removeAttrs',
                                params: {
                                    attrs: 'fill'
                                }
                            }
                        ]
                    }
                },
                { componentName }
            );

            // Estrai il contenuto interno dell'SVG
            const svgContentMatch = result.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
            const svgContent = svgContentMatch ? svgContentMatch[1] : '';

            // Estrai il viewBox se presente
            const viewBoxMatch = result.match(/viewBox="([^"]*)"/);
            const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

            // Genera il componente finale utilizzando SvgIcon
            const tsCode = `
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type ${componentName}Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const ${componentName} = (props: ${componentName}Props) => {
  return (
    <SvgIcon viewBox="${viewBox}" {...props}>
      ${svgContent}
    </SvgIcon>
  );
};

export default ${componentName};
`;

            // Scrivi il file di output
            const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
            fs.writeFileSync(outputPath, tsCode);

            console.log(`Convertito: ${file} -> ${componentName}.tsx`);
        } catch (error) {
            console.error(`Errore durante la conversione di ${file}:`, error);
        }
    }
}

processFiles().catch(console.error);