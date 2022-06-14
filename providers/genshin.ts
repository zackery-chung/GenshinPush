import axios, { Axios } from "axios"

import crypto from 'crypto';
import { DailyNote } from "../type";

const md5 = (str: string) => crypto.createHash('md5').update(str).digest('hex');

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const getDS = (query = '', body = '') => {
  const randomStr = randomIntFromInterval(100000, 200000)
  const timestamp = Math.floor(Date.now() / 1000)
  const sign = md5(`salt=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs&t=${timestamp}&r=${randomStr}&b=${body}&q=${query}`)
  return timestamp + ',' + randomStr + ',' + sign
}

export class GenshinClient {
  private request: Axios

  constructor (cookie: string) {
    this.request = axios.create({
      baseURL: 'https://api-takumi-record.mihoyo.com',
      headers: {
        'x-rpc-app_version': '2.19.1',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1',
        'x-rpc-client_type': '5',
        'Referer': 'https://webstatic.mihoyo.com/',
        'Cookie': cookie,
      }
    })


    this.request.interceptors.request.use(config => {
      const query = Object.entries(config.params)
          .sort(([k1], [k2]) => k1.localeCompare(k2))
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      if (!config.headers) {
          config.headers = {}
      }
      config.headers['DS'] = getDS(query)
      return config
    })
  }


  async getDailyNote(role_id: string, server: string) {
  const response = await this.request.get<{retcode: number, data: DailyNote}>('/game_record/app/genshin/api/dailyNote', {
      params: {
          server,
          role_id
      }
  })

  return response.data
}

async getGameRecordCard(uid: number) {
  const response = await this.request.get('/game_record/app/card/wapi/getGameRecordCard', {
      params: {
          uid
      }
  })

  return response.data
}

}