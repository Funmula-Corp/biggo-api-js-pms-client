# BigGo PMS API

This is a library for accessing BigGo PMS API.

## First Step

To get started, first obtain an API key and secret from BigGo API. Then, use the following code to obtain an API object:
```js
const api = new BiggoPMSAPI({ 
  clientID: '<Your client ID>',
  clientSecret: '<Your client secret>' 
})
```

## Usage

### Get Platform List
Get list of platforms the user has access.  
`api.getPlatformList()`  

* Return `Promise<TPlatform[]>`

```js
api.getPlatformList()
```
---
### Get Group List
Get list of groups in the platform.  
`api.getGroupList(<Platform ID>)`

* Return `Promise<TGroup[]>`

```js
api.getGroupList('<Platform ID>')
```
---
### Get Report List
Get list of reports in the platform.  
`api.getReportList('<Platform ID>')`

* Return `Promise<TReportListItem[]>`

```js
api.getReportList('<Platform ID>')
```
---
### Get Report
Save report as file or get file content.  
`api.getReport('<Platform ID>', '<Report ID>', 'json'|'csv'|'excel', [Options])`

* Return `Promise<string | Uint8Array>`, `Uint8Array` if `format` is `excel`

```js
api.getReport('<Platform ID>', '<Report ID>', 'json')
```  
`Options`  
||required|default value|type|description|
|:---:|:---:|:---:|:---:|:---:|
|saveAsFile||true|boolean|save report as file|
|savePath||.|string|path to save file|
|fileName||`<Platform Name>_<Group Name>_<Report Create Time>.<format>`|string|file name|

```js
api.getReport('<Platform ID>', '<Report ID>', 'json')
```