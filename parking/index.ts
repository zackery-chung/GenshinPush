import { ParkingClient } from '../providers/parking'
import { Wechat } from '../providers/wechat'

async function payParking(uid: string, plateNo: string) {
    const mallId = '10033'
    const parkId = '14'
    const parkingClient = new ParkingClient(parkId, mallId, uid)
    
    const parkFee = await parkingClient.getParkFeeInit(plateNo)
    
    const rightsRule = parkFee.RightsRuleModelList.find(rule => rule.RuleName === '会员权益')
    if (!rightsRule) {
        return console.log('未找到会员权益')
    }

    const blackGoldRight = rightsRule.RightsList.find(rights => rights.RightsName === '黑金卡会员停车享受60元优惠')
    if (!blackGoldRight) {
        return console.log('未找到黑金权益')
    }

    const rights = [{
        ...blackGoldRight,
        RightsName: '会员权益',
    }]

    const response = await parkingClient.payParkFee(plateNo, rights)

    console.log(response)
}

;(async () => {
    const config = require("./config.json")
    const { wechat_message, tasks } = config

    const wechat_access_token = await Wechat.getAccessTokenByAppSecret(wechat_message.appid, wechat_message.appsecret)

    const wechat = new Wechat(wechat_access_token)

    for (const { uid, plateNo, notifyUser } of tasks) {
        let message = '打卡成功'
        try {
            await payParking(uid, plateNo)
        } catch (error) {
            if (error instanceof Error) {
                message = error.message
            }
        }
    
        wechat.pushParkingNote(message, notifyUser)
    }

})()
