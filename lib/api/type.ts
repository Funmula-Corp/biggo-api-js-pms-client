export type TTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
} | {
  result: false;
  error: {
    code: number;
    message: string;
  }
}

import type { ResponseType } from 'axios';
export interface BaseRequestParams {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  extraHeaders?: Record<string, string>;
  extraParams?: Record<string, any | undefined>;
  responseType?: ResponseType;
  body?: Record<string, any>;
}

export interface TPlatform {
  id: string;
  name: string;
  status: 'enable' | 'disable';
  userList: {
    jointime: string;
    permission: 'administrator' | 'standard';
    userid: string;
  }[];
  emailList: {
    name: string;
    email: string;
    group_list: ['all'] | string[];
  }[]
}

export interface TGroup {
  id: string;
  schedule: {
    min: string;
    hour: string;
    day: string;
    month: string;
    week: string;
  }
  isScheduleOn: boolean;
  name: string;
  district: string;
  status: 'active' | 'deleted';
  sampleCount: number;
  exportCount: number;
}

export interface TReportListOption {
  size?: number;
  startIndex?: number;
  sort?: 'desc' | 'asc';
  groupID?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface TReportListItem {
  id: string;
  createTime: string;
  groupID: string;
  groupName: string;
  district: string;
  sampleSize: number;
}

export type TDownloadFileOptions = {
  saveAsFile: true,
  saveDir?: string,
  fileName?: string
} | {
  saveAsFile: false
}