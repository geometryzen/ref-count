In order to allow Jest testing in consuming libraries, it is necessary to make some "undesirable" changes to this package.json

1. Must remove "type": "module".
2. Must point the default export to the commonjs distribution.

