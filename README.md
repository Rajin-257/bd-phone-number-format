# bd-phone-number-format

Validate, normalize, and format Bangladesh mobile phone numbers for Node.js projects.

## Features

- Validates Bangladesh mobile numbers (local and international forms)
- Ensures local format has 11 digits and starts with valid prefixes (`01[3-9]`)
- Supports input cleanup (`+880 1712-345678`, `8801712345678`, `01712345678`, etc.)
- Returns multiple output formats: local, international, E.164, pretty, and masked
- Supports custom refactor flow (remove from start/end and add your own prefix/suffix)
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
  normalizeBdPhoneNumber,
  customizeBdPhoneNumber,
  refactorBdPhoneNumber,
  getBdPhoneOperator,
  isBdPhoneOperator
} = require("bd-phone-number-format");

const number = "01712345678";

// 1) Basic validity
console.log(isValidBdPhoneNumber(number));
// true

console.log(isValidBdPhoneNumber("1712345678", { allowMissingLeadingZero: false }));
// false

console.log(isValidBdPhoneNumber("01812345678", { expectedOperator: "Robi" }));
// true

// 2) Full validation object
console.log(validateBdPhoneNumber(number));
// {
//   isValid: true,
//   input: '01712345678',
//   local: '01712345678',
//   international: '8801712345678',
//   e164: '+8801712345678',
//   pretty: '017-123-45678',
//   masked: '017****5678',
//   operatorCode: '17',
//   operator: 'Grameenphone'
// }

console.log(validateBdPhoneNumber("01212345678"));
// { isValid: false, input: '01212345678', reason: 'Invalid Bangladesh mobile operator code.' }

// 3) All output formats
console.log(formatBdPhoneNumber(number, "local"));
// 01712345678

console.log(formatBdPhoneNumber(number, "international"));
// 8801712345678

console.log(formatBdPhoneNumber(number, "e164"));
// +8801712345678

console.log(formatBdPhoneNumber(number, "pretty"));
// 017-123-45678

console.log(formatBdPhoneNumber(number, "masked"));
// 017****5678

// 4) Normalize (default and custom)
console.log(normalizeBdPhoneNumber("+880 1712-345678"));
// +8801712345678

console.log(normalizeBdPhoneNumber("+880 1712-345678", { format: "pretty" }));
// 017-123-45678

// 5) Operator detection/check
console.log(getBdPhoneOperator(number));
// Grameenphone

console.log(isBdPhoneOperator(number, "gp"));
// true

console.log(isBdPhoneOperator(number, "robi"));
// false

// 6) Custom refactor: remove digits + add your own prefix
console.log(customizeBdPhoneNumber("01615928286", { removeFromStart: 1, prefix: "+880" }));
// +8801615928286

console.log(customizeBdPhoneNumber("1615928286", { removeFromStart: 0, prefix: "+880" }));
// +8801615928286

console.log(customizeBdPhoneNumber("8801615928286", { removeFromStart: 1, base: "local", prefix: "+880" }));
// +8801615928286

console.log(customizeBdPhoneNumber("+8801615928286", { removeFromStart: 1, prefix: "+880" }));
// +8801615928286

console.log(customizeBdPhoneNumber("01615928286", { removeFromStart: 1, removeFromEnd: 2, prefix: "X" }));
// X16159282

console.log(refactorBdPhoneNumber("01615928286", { removeFromStart: 1, prefix: "880" }));
// 8801615928286

console.log(customizeBdPhoneNumber("01615928286", { removeFromStart: 1, suffix: "-RAW" }));
// 1615928286-RAW

console.log(customizeBdPhoneNumber("01615928286", {
  removeFromStart: 1,
  prefix: "+880",
  separator: " ",
  suffix: "BD",
  suffixSeparator: " #"
}));
// +880 1615928286 #BD
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
  operatorCode: '17',
  operator: 'Grameenphone'
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

### `customizeBdPhoneNumber(input, options?)`

Transforms a valid number by removing digits from start/end and adding your custom prefix/suffix.

Options:

- `base`: `local` (default), `core`, `international`
- `removeFromStart`: number of digits to cut from the beginning
- `removeFromEnd`: number of digits to cut from the end
- `prefix`: your custom prefix string (for example `+880`, `880`, `X`)
- `separator`: text inserted between prefix and final number
- `suffix`: your custom suffix string (for example `-RAW`, `-BD`)
- `suffixSeparator`: text inserted between final number and suffix

Example:

```js
customizeBdPhoneNumber("01615928286", { removeFromStart: 1, prefix: "+880" });
// +8801615928286
```

### `refactorBdPhoneNumber(input, options?)`

Alias of `customizeBdPhoneNumber`.

### `getBdPhoneOperator(input, options?)`

Returns operator name for a valid number, otherwise `null`.

Possible return values:

- `Grameenphone` (`013`, `017`)
- `Robi` (`016`, `018`)
- `Banglalink` (`014`, `019`)
- `Teletalk` (`015`)

### `isBdPhoneOperator(input, operatorName, options?)`

Checks whether a number belongs to a specific operator.

Accepted names/aliases include:

- `grameenphone`, `gp`
- `robi`, `airtel`, `robi airtel`
- `banglalink`, `bl`
- `teletalk`, `tt`

## Options

- `allowMissingLeadingZero` (default: `true`)
  - Allows input like `1712345678` and converts it to local form `01712345678`
- `expectedOperator` (optional)
  - Example: `validateBdPhoneNumber('01812345678', { expectedOperator: 'Robi' })`

## License

MIT
