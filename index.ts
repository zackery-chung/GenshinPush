import { GenshinClient } from './providers/genshin';
import { Wechat } from './providers/wechat';

;(async () => {
    const config = require("./config.json")
    const { role_id, cookie, server, wechat_message } = config
    
    const genshin = new GenshinClient(cookie)

    const dailyNote = await genshin.getDailyNote(role_id, server)

    if (dailyNote.retcode) {
        return console.log(dailyNote)
    }

    if (dailyNote.data.current_resin < 120 && dailyNote.data.current_home_coin < 2000) {
        return console.log('还早，不用提醒')
    }

    const wechat_access_token = await Wechat.getAccessTokenByAppSecret(wechat_message.appid, wechat_message.appsecret)

    const wechat = new Wechat(wechat_access_token)
    wechat.pushDailyNote(dailyNote.data)
})()
