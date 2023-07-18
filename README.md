# BigGo API PMS Javascript Client


BigGo API PMS Javascript Client is a API written in Javascript. 

short future:

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Initializing](#initializing)
  - [Accessing BigGo API PMS](#accessing-biggo-api-pms)
- [Typescript](#typescript)
- [License](#license)

## Getting Started

### Installation

Using npm

```shell
npm i biggo-api-pms --save
```

Using yarn

```shell
yarn add biggo-api-pms
```

Using pnpm

```shell
pnpm add biggo-api-pms
```

### Usage

Using ESM:

```js
import { BiggoAPIPMS } from "biggo-api-pms"
```

Using CJS:

```js
const { BiggoAPIPMS } = require("biggo-api-pms")
```

### Initializing

To get started, first obtain a client id and secret from BigGo API. Then, use the following code to obtain an API object:

```js
const api = new BiggoAPIPMS({ 
  clientID: '<Your client ID>',
  clientSecret: '<Your client secret>' 
})
```

You can refer to this guide to get the client id and secret

[Funmula-Corp/guide](https://github.com/Funmula-Corp/guide)

### Accessing BigGo API PMS

You can access all BigGo API PMS resources using the api object. Simply use the object obtained from `new BiggoAPIPMS()`. For example:

```js
// Get list of platforms the user has access.
const platformList = await api.getPlatformList()
// Get list of groups in the platform.
const groupList = await api.getGroupList('<Platform ID>')
// Get list of reports in the platform.
const reportList = await api.getReportList('<Platform ID>')
// Get file content or save report as file.
const reportJson = await api.getReport('<Platform ID>', '<Report ID>', 'json')
```

if you need more information, you can refer to this [document](./lib/api/README.md).
## Typescript

This library supports typescript.

## License

[MIT](./LICENSE)
