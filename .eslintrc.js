module.exports = {
    parser: 'babel-eslint',
    extends: ['plugin:import/errors', 'plugin:import/warnings', 'airbnb'],
    rules: {
        'no-unused-vars': [2, { vars: 'all', args: 'after-used', varsIgnorePattern: '[iI]gnored' }],
        'no-console': 1,
        semi: [2, 'never'],
        'max-len': [2, 100],
        'no-warning-comments': 1,
        'prefer-const': 1,
        'no-trailing-spaces': [2],
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                groups: ['index', ['builtin', 'external'], ['sibling', 'parent', 'internal']],
            },
        ],
        indent: [1, 4, { SwitchCase: 1 }],
    },
    plugins: ['jest'],
    env: {
        'jest/globals': true,
    },
}
