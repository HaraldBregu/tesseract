export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/renderer/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/renderer/src/__mocks__/fileMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/src/renderer/src/setupTests.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                resolveJsonModule: true,
                skipLibCheck: true,
                // Include global types
                types: ['node', 'jest'],
                // Allow implicit any for tests
                noImplicitAny: false,
                strict: false,
            },
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|lodash-es))',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/out/',
    ],
    // Add global type declarations
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    collectCoverageFrom: [
        'src/renderer/src/**/*.{ts,tsx}',
        '!src/renderer/src/**/*.d.ts',
        '!src/renderer/src/main.tsx',
        '!src/renderer/src/types/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    // Extend timeout for slow tests
    testTimeout: 10000,
};