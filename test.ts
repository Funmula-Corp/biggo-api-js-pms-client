import axios from 'axios';
import { BiggoPMSAPI } from "./lib";
import fs from 'fs'


(async function main() {
  const api = new BiggoPMSAPI({ clientID: 'd4b63702-d40c-408b-addb-0429ce43658b', clientSecret: 'qlhipme4nc' })
  // test.getPlatformList().then(console.log)
  try {
    // test.getReportList('qXLtTIgB6091apGrIY4I', { filter: { startDate: new Date('2023-5-22'), endDate: new Date() } }).then(console.log)
    // const platformList = await api.getPlatformList()
    // const groupList = await api.getGroupList('oL2CR4gBFtDMZ_jVkzmH').then(console.log)
    // const reportList = await api.getReportList('<platform ID>')
    // const report = await api.getReport('qXLtTIgB6091apGrIY4I', 'ppn7T4kBY89Rt85ccUKG')
    // fs.writeFileSync('./report.json', JSON.stringify(report, null, 2))
    const report = await api.getReport('qXLtTIgB6091apGrIY4I', 'YYHVSokBL6_1ClmiVy5x', 'excel')
    // const filePath = await api.downloadReport('<platform ID>', '<report ID>', 'json')
  }
  catch (e) {
    console.log(e)
  }
})()
