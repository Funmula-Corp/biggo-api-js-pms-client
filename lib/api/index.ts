import axios from "axios";
import fs from 'fs'
import type {
  BaseRequestParams, TGroup, TPlatform, TReportListItem,
  TReportListOption, TTokenResponse, TDownloadFileOptions
} from "./type";
import path from "path";
import { BigGoAuthError, BigGoError } from "../error";
export class BiggoPMSAPI {
  #clientID: string;
  #clientSecret: string;
  #accessToken: string = '';
  #tokenType: 'Bearer' | string = 'Bearer';
  /**
   * in seconds
   */
  #expiresAt: number = 0;
  #baseURL: string = 'https://api.biggo.com/api/v1/pms';

  constructor({ clientID, clientSecret }: { clientID: string, clientSecret: string }) {
    this.#clientID = clientID;
    this.#clientSecret = clientSecret;
  }

  public setClientID(clientID: string): this {
    this.#clientID = clientID;
    return this;
  }
  public setClientSecret(clientSecret: string): this {
    this.#clientSecret = clientSecret;
    return this;
  }
  public setToken(token: string, expiresAt: Date, tokenType: 'Bearer' | string = 'Bearer'): this {
    this.#accessToken = token;
    this.#tokenType = tokenType;
    this.#expiresAt = expiresAt.getTime() / 1000;
    return this;
  }

  public async getToken() {
    if (!this.#accessToken || this.isTokenExpired()) {
      await this.#renewToken();
    }
    return this.#accessToken;
  }

  async #renewToken() {
    this.#accessToken = '';
    this.#tokenType = 'Bearer';
    this.#expiresAt = 0;
    const basicAuthHeader = `Basic ${Buffer.from(`${this.#clientID}:${this.#clientSecret}`).toString('base64')}`;

    try {
      const response = await axios.post<TTokenResponse>('https://api.biggo.com/auth/v1/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': basicAuthHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).catch(err => {
        if (typeof err.response.data === 'object' && 'error' in err.response.data) {
          return err.response
        }
        throw new BigGoAuthError(`${err.message}`);
      })

      if ('error' in response.data) {
        throw new BigGoAuthError(`${response.data.error.message}`, response.data.error.code);
      }
      const { access_token, token_type, expires_in } = response.data;
      this.#accessToken = access_token;
      this.#tokenType = token_type === 'bearer' ? 'Bearer' : token_type;
      this.#expiresAt = Date.now() / 1000 + expires_in - 30;
    }
    catch (err) {
      if (err instanceof BigGoAuthError)
        throw err;
      else if (err instanceof Error)
        throw new BigGoAuthError(`${err.message}`);
      else
        throw new BigGoAuthError(`${err}`);
    }
  }
  /**
   * Check the token is expired.
   */
  public isTokenExpired(): boolean {
    return Date.now() / 1000 >= this.#expiresAt;
  }

  private async request(prams: BaseRequestParams) {
    return axios({
      baseURL: this.#baseURL,
      url: prams.path,
      method: prams.method,
      headers: {
        'Authorization': `${this.#tokenType} ${await this.getToken()}`,
        ...prams.extraHeaders
      },
      params: prams.extraParams,
      responseType: prams.responseType,
      data: prams.body,
    })
      .then((res) => {
        if (res.data.error_code || res.data.result === false)
          throw new BigGoError(`${res.data.error || res.data.message}`, res.data.error_code);
        return res;
      })
      .catch(err => {
        if (err instanceof BigGoError)
          throw err;
        else if (err instanceof Error)
          throw new BigGoError(`${err.message}`);
        else
          throw new BigGoError(`${err}`);
      })
  }
  /**
   * Get this user's platform list.
   */
  public async getPlatformList(): Promise<TPlatform[]> {
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
      } satisfies TPlatform;
    });
  }
  /**
   * Get group list of the platform.
   */
  public async getGroupList(platformID: string): Promise<TGroup[]> {
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
      } satisfies TGroup
    });
  }
  /**
   * Get history report list of the platform.
   */
  public async getReportList(platformID: string, options?: TReportListOption): Promise<TReportListItem[]> {
    const { data } = await this.request({
      path: '/export',
      method: 'GET',
      extraParams: {
        pms_platformid: platformID,
        size: options?.size ?? 5000,
        in_sort: options?.sort ?? 'desc',
        in_form: options?.startIndex ?? 0,
        in_opt: (options?.groupID || options?.startDate || options?.endDate) ? {
          pms_groupid: options.groupID?.join(','),
          start: options.startDate ?
            `${options.startDate.getUTCFullYear()}-${options.startDate.getUTCMonth() + 1}-${options.startDate.getUTCDate()}` :
            undefined,
          end: options.endDate ?
            `${options.endDate.getUTCFullYear()}-${options.endDate.getUTCMonth() + 1}-${options.endDate.getUTCDate()}` :
            undefined,
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
      } satisfies TReportListItem
    })
  }

  /**
   * Download a History Report. require platformID and reportID.
   * 
   * if saveAsFile in options is true, return the file path.
   * 
   * if saveAsFile in options is false(default), return the file content.
   * when fileType is `excel`, return `Promise<Uint8Array>`.
   * otherwise, return `Promise<string>`.
   */
  public async getReport(platformID: string, reportID: string, fileType: 'csv' | 'json' | 'excel',
    options: TDownloadFileOptions = { saveAsFile: false }
  ): Promise<string | Uint8Array> {
    const res = await this.request({
      path: `/export/${reportID}`,
      method: 'GET',
      extraParams: {
        pms_platformid: platformID,
        file_type: fileType,
      },
      responseType: fileType === 'excel' ? 'arraybuffer' : undefined
    })

    let fileContent: string | Uint8Array = ''
    if (fileType === 'csv') {
      fileContent = String.fromCharCode(0xFEFF) + res.data;
    }
    else if (fileType === 'json') {
      fileContent = JSON.stringify(res.data, null, 2);
    }
    else if (fileType === 'excel') {
      fileContent = res.data;
    }
    if (!options.saveAsFile) return Promise.resolve(fileContent)
    let { fileName, saveDir = '.' } = options;
    if (!fileName)
      fileName = decodeURIComponent(res.headers['content-disposition']?.split('filename=')[1] ??
        `output.${fileType === 'excel' ? 'xlsx' : fileType}`);

    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const filePath = `${path.join(saveDir, fileName)}`;
    fs.writeFileSync(filePath, fileContent);
    return Promise.resolve(path.resolve(filePath));
  }
}