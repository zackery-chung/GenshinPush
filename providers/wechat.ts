import axios from "axios"
import { writeFileSync } from "fs";
import { DailyNote } from "../type";

const BASE_URL = 'https://api.weixin.qq.com/cgi-bin'
// 

export class Wechat {
  private access_token: string;

  constructor (acess_token: string) {
    this.access_token = acess_token
  }

  setAccessToken(access_token: string) {
    this.access_token = access_token
  }

  pushDailyNote(dailyNote: DailyNote) {
    const { wechat_message } = require('../config')
    const { openid: touser, template_id } = wechat_message
    const transformer_recovery_time = dailyNote.transformer.recovery_time
    axios.post(BASE_URL + '/message/template/send', {
      touser,
      template_id: template_id.dailynote,
      data: {
        resin: {
          value: dailyNote.current_resin
        },
        current_home_coin: {
          value: dailyNote.current_home_coin
        },
        transformer_recovery_time: {
          value: `${transformer_recovery_time.Day}天${transformer_recovery_time.Hour}小时${transformer_recovery_time.Minute}分钟${transformer_recovery_time.Second}秒`
        }
      }
    }, {
      params: {
        access_token: this.access_token
      }
    })
  }

  static async getAccessTokenByAppSecret(appid: string, secret: string) {
    let wechatToken = { access_token: '', expiredTime: 0 }
    try {
      wechatToken = require('../wechat_token.json')
    } catch {
      // pass
    }

    if (Date.now() > wechatToken.expiredTime) {
        const { data } = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
          params: {
            grant_type: 'client_credential',
            appid, secret
          }
        })
        if (data.errcode) {
          console.log(appid, secret)
          throw new Error(data.errmsg)
        }
        data.expiredTime = Date.now() + 7200000 - 60000
        writeFileSync(__dirname + '/../wechat_token.json', JSON.stringify(data))
        return data.access_token
    }

    return wechatToken.access_token
  }
}
