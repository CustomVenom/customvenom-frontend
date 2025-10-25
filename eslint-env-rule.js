// ESLint rule to prevent process.env.FOO dot-access regression
// Add this to your ESLint config to catch any future violations

/* eslint-env node */
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "MemberExpression[object.name='process'][property.name='env'] > Identifier.property",
        message:
          "Use bracket notation for process.env access: process.env['FOO'] instead of process.env.FOO",
      },
    ],
  },
};

// Alternative: More specific rule for process.env dot access
// {
//   "rules": {
//     "no-restricted-syntax": [
//       "error",
//       {
//         "selector": "MemberExpression[object.name='process'][property.name='env'] > Identifier.property",
//         "message": "process.env.FOO is not allowed with exactOptionalPropertyTypes. Use process.env['FOO'] or getEnv('FOO') helper instead."
//       }
//     ]
//   }
// }
