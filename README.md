# BigGo PMS API Javascript Client


BigGo PMS API Javascript Client is a API written in Javascript. 

short future:

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Initializing](#initializing)
  - [Accessing BigGo PMS API](#accessing-biggo-pms-api)
- [Typescript](#typescript)
- [License](#license)

## Getting Started

### Installation

Using npm

```shell
npm i ???? --save
```

Using yarn

```shell
yarn add ????
```

Using pnpm

```shell
pnpm add ????
```

### Usage

Using ESM:

```js
import { BiggoPMSAPI } from "????"
```

Using CJS:

```js
const { BiggoPMSAPI } = require("????")
```

### Initializing

To get started, first obtain a client id and secret from BigGo API. Then, use the following code to obtain an API object:

```js
const api = new BiggoPMSAPI({ 
  clientID: '<Your client ID>',
  clientSecret: '<Your client secret>' 
})
```

You can refer to this guide to get the client id and secret

[Funmula-Corp/guide](https://github.com/Funmula-Corp/guide)

### Accessing BigGo PMS API

You can access all BigGo PMS API resources using the api object. Simply create a new instance of the desired resource, passing in the client object obtained from auth.getJWTClient(). For example:

```js
// Get list of platforms the user has access.
const platformList = await api.getPlatformList()
// Get list of groups in the platform.
const groupList = await api.getGroupList('<Platform ID>')
// Get list of reports in the platform.
const reportList = await api.getReportList('<Platform ID>')
// Save report as file or get file content.
const filePath = await api.getReport('<Platform ID>', '<Report ID>', 'json')
```

if you need more information, you can refer to this [document](./lib/api/README.md).
## Typescript

This library supports typescript.

## License

[MIT](./LICENSE)
