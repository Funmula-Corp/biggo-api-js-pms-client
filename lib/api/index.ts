import axios from "axios";
import fsp from 'fs/promises';
import fs from 'fs'
import type { BaseRequestParams, TGroupListItem, TPlatformListItem, TReportHistoryDetail, TReportHistoryListItem, TReportHistoryListOption, TTokenResponse } from "./type";
import path from "path";
export class BiggoPMSAPI {
  #clientID: string;
  #clientSecret: string;
  #accessToken: string = '';
  #tokenType: 'Bearer' | string = 'Bearer';
  #expiresAt: number = 0;
  #baseURL: string = 'https://api.biggo.com/api/v1/pms';
  constructor({ clientID, clientSecret }: { clientID: string, clientSecret: string }) {
    this.#clientID = clientID;
    this.#clientSecret = clientSecret;
  }
  public setClientID(clientID: string) {
    this.#clientID = clientID;
    return this;
  }
  public setClientSecret(clientSecret: string) {
    this.#clientSecret = clientSecret;
    return this;
  }

  async #renewToken() {
    const basicAuth: string = Buffer.from(`${this.#clientID}:${this.#clientSecret}`).toString('base64');
    try {
      const response = await axios.post<TTokenResponse>('https://api.biggo.com/auth/v1/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if ('error' in response.data) {
        console.log(response.data)
        throw new Error(`${response.data.error.message}, code:${response.data.error.code}`)
      }
      const { access_token, token_type, expires_in } = response.data;
      this.#accessToken = access_token;
      this.#tokenType = token_type === 'bearer' ? 'Bearer' : token_type;
      this.#expiresAt = Date.now() + expires_in * 1000 - 30 * 1000;
    }
    catch (err) {
      if (err instanceof Error)
        throw new Error(`BigGo Auth Error: ${err.message}`);
      else
        throw new Error(`BigGo Auth Error: ${err}`)
    }
  }
  private isTokenExpired(): boolean {
    return Date.now() >= this.#expiresAt;
  }

  private async request(prams: BaseRequestParams) {
    if (!this.#accessToken || this.isTokenExpired()) {
      await this.#renewToken();
    }
    return axios({
      baseURL: this.#baseURL,
      url: prams.path,
      method: prams.method,
      headers: {
        'Authorization': `${this.#tokenType} ${this.#accessToken}`,
        ...prams.extraHeaders
      },
      params: prams.extraParams,
      responseType: prams.responseType,
      data: prams.body,
    })
      .then((res) => {
        if (res.data.error_code || !res.data.result) throw `${res.data.error || res.data.message}`
        if (res.statusText !== 'OK') throw 'Unknown Error'
        return res;
      })
      .catch(err => {
        if (err instanceof Error)
          throw new Error(`BigGo PMS Error: ${err.message}`);
        else
          throw new Error(`BigGo PMS Error: ${err}`)
      })

  }

  public async getPlatformList(): Promise<TPlatformListItem[]> {
    const { data } = await this.request({
      path: '/platform',
      method: 'GET'
    });
    return data.data.map((platform: any) => {
      return {
        id: platform._id,
        name: platform.platform_name,
        status: platform.status,
        userList: platform.userid_list,
        emailList: platform.email_list
      } satisfies TPlatformListItem;
    });
  }

  public async getGroupList(platformID: string): Promise<TGroupListItem[]> {
    const { data } = await this.request({
      path: '/group',
      method: 'GET',
      extraParams: {
        pms_platformid: platformID
      }
    });
    return data.data.map((group: any) => {
      return {
        id: group._id,
        schedule: group.crontab_setting,
        isScheduleOn: group.crontab === 'true' ? true : false,
        name: group.group_name,
        district: group.district,
        status: group.status,
        exportCount: group.export_count,
        sampleCount: group.sample_count
      } satisfies TGroupListItem
    });
  }

  public async getReportHistoryList(platformID: string, options?: TReportHistoryListOption): Promise<TReportHistoryListItem[]> {
    const { data } = await this.request({
      path: '/export',
      method: 'GET',
      extraParams: {
        pms_platformid: platformID,
        size: options?.size ?? 5000,
        in_sort: options?.sort ?? 'desc',
        in_form: options?.startPosition ?? 0,
        in_opt: options?.filter ? {
          pms_groupid: options.filter.groupID,
          start: options.filter.startDate ? `${options.filter.startDate.getFullYear()}-${options.filter.startDate.getMonth()}-${options.filter.startDate.getDay()}` : undefined,
          end: options.filter.endDate ? `${options.filter.endDate.getFullYear()}-${options.filter.endDate.getMonth()}-${options.filter.endDate.getDay()}` : undefined,
        } : undefined,
      }
    })
    return data.data.map((report: any) => {
      return {
        id: report._id,
        createTime: report.createtime,
        groupID: report.pms_groupid,
        groupName: report.group_name,
        district: report.district,
        sampleSize: report.sample_size
      } satisfies TReportHistoryListItem
    })
  }

  public async getReportHistory(platformID: string, reportID: string): Promise<TReportHistoryDetail> {
    const { data } = await this.request({
      path: `/export-json/${reportID}`,
      method: 'GET',
      extraParams: {
        pms_platformid: platformID
      }
    })
    return {
      groupID: data.data.pms_groupid,
      groupName: data.data.group_name,
      sampleSize: data.data.sample_size,
      district: data.data.district,
      createTime: data.data.createtime,
      json_data: data.data.json_data
    } satisfies TReportHistoryDetail
  }

  public async downloadReportHistory(platformID: string, reportID: string, downloadFileType: 'csv' | 'json' | 'excel',
    savePath: string = '.', fileName?: string) {
    const res = await this.request({
      path: `/export/${reportID}`,
      method: 'GET',
      extraParams: {
        pms_platformid: platformID,
        file_type: downloadFileType,
      },
      responseType: downloadFileType === 'excel' ? 'arraybuffer' : undefined
    })
    if (!fileName)
      fileName = decodeURIComponent(res.headers['content-disposition']?.split('filename=')[1] ??
        `output.${downloadFileType === 'excel' ? 'xlsx' : downloadFileType}`)

    let fileContent: string = ''
    if (downloadFileType === 'csv') {
      fileContent = String.fromCharCode(0xFEFF) + res.data
    }
    else if (downloadFileType === 'json') {
      fileContent = JSON.stringify(res.data, null, 2)
    }
    else if (downloadFileType === 'excel') {
      fileContent = res.data
    }

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true })
    return fsp.writeFile(`${path.join(savePath, fileName)}`, fileContent)
  }
}