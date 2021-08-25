module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
  },
  'rules': {
    'new-cap': 0,
    quotes: 2,
    semi: 2,
    indent: ['error', 2],
    'quote-props': 0,
    'require-jsdoc': 0,
    'padded-blocks': 0,
    'object-curly-spacing': 0,
    'valid-typeof': 2,
    'no-return-await': 2,
  },
};
