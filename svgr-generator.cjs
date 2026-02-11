/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { transform } = require('@svgr/core');

const INPUT_DIR = 'buildResources/icons';
const OUTPUT_DIR = 'src/renderer/src/components/app/icons';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const svgFiles = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.svg'));

async function processFiles() {
    for (const file of svgFiles) {
        const filePath = path.join(INPUT_DIR, file);
        const componentName = 'Icon' + file
            .replace(/\.svg$/, '')
            .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());

        const svgCode = fs.readFileSync(filePath, 'utf8');

        try {
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
                                        removeViewBox: false,
                                        mergePaths: false
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

            const svgContentMatch = result.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
            const svgContent = svgContentMatch ? svgContentMatch[1] : '';

            //const viewBoxMatch = result.match(/viewBox="([^"]*)"/);
            //const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

            const tsCode = `
import { forwardRef, memo } from "react";

const ${componentName} = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            ${svgContent}
        </svg>
    );
});

${componentName}.displayName = '${componentName}';

export default memo(${componentName});
`;

            const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
            fs.writeFileSync(outputPath, tsCode);

            console.log(`Converted: ${file} -> ${componentName}.tsx`);
        } catch (error) {
            console.error(`Error converting ${file}:`, error);
        }
    }
}

processFiles()
    .catch(console.error);