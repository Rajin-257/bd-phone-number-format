# bd-phone-number-format

Validate, normalize, and format Bangladesh mobile phone numbers for Node.js projects.

## Features

- Validates Bangladesh mobile numbers (local and international forms)
- Ensures local format has 11 digits and starts with valid prefixes (`01[3-9]`)
- Supports input cleanup (`+880 1712-345678`, `8801712345678`, `01712345678`, etc.)
- Returns multiple output formats: local, international, E.164, pretty, and masked
- Provides clear validation error reasons

## Installation

```bash
npm install bd-phone-number-format
```

## Usage

```js
const {
  validateBdPhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneNumber,
  normalizeBdPhoneNumber
} = require("bd-phone-number-format");

console.log(isValidBdPhoneNumber("01712345678"));
// true

console.log(normalizeBdPhoneNumber("+880 1712-345678"));
// +8801712345678

console.log(formatBdPhoneNumber("01712345678", "pretty"));
// 017-123-45678

console.log(validateBdPhoneNumber("01212345678"));
// { isValid: false, input: '01212345678', reason: 'Invalid Bangladesh mobile operator code.' }
```

## API

### `validateBdPhoneNumber(input, options?)`

Returns a detailed validation object.

Success:

```js
{
  isValid: true,
  input: '01712345678',
  local: '01712345678',
  international: '8801712345678',
  e164: '+8801712345678',
  pretty: '017-123-45678',
  masked: '017****5678',
  operatorCode: '17'
}
```

Failure:

```js
{
  isValid: false,
  input: 'abc',
  reason: 'Phone number cannot contain letters.'
}
```

### `isValidBdPhoneNumber(input, options?)`

Returns `true` or `false`.

### `formatBdPhoneNumber(input, format?, options?)`

Returns a formatted string when valid, otherwise `null`.

Supported `format` values:

- `local` -> `01712345678`
- `international` -> `8801712345678`
- `e164` -> `+8801712345678`
- `pretty` -> `017-123-45678`
- `masked` -> `017****5678`

### `normalizeBdPhoneNumber(input, options?)`

Shortcut for returning one normalized format.

- Default format is `e164`
- You can pass `options.format`

## Options

- `allowMissingLeadingZero` (default: `true`)
  - Allows input like `1712345678` and converts it to local form `01712345678`

## License

MIT
