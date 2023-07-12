import { BiggoPMSAPI } from "./lib";




(async function main() {
  const test = new BiggoPMSAPI({ clientID: 'd4b63702-d40c-408b-addb-0429ce43658b', clientSecret: 'qlhipme4nc' })

  // test.getPlatformList().then(console.log)
  try {
    test.getReportHistoryList('qXLtTIgB6091apGrIY4I').then(console.log)
    // const historyReport = await test.downloadReportHistory('qXLtTIgB6091apGrIY4I', 'XDRUM4gBEXbxD-dNzPn5', 'csv')
  }
  catch (e) {
    console.log(e)
  }

})()
