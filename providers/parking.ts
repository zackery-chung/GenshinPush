import axios, { Axios } from "axios"

type Right = {
  RightsName: string
  Amount: number
}

type RightsRuleModel = {
  RuleName: string
  RightsList: Right[]
}

type ParkFeeInfo = {
  RightsRuleModelList: RightsRuleModel[]
}

type ParkFeeType = {
  m: number,
  d: ParkFeeInfo
}

type ParkFeeResponseType = {
  ParkFee: string,
  success: boolean
}

function encodeUrlForm(element: any, key?: string, list: string[] = []){
  if(typeof(element) == 'object'){
    for (var idx in element)
      encodeUrlForm(element[idx], key ? key+'['+idx+']' : idx, list);
  } else {
    list.push(key + '=' + encodeURIComponent(element));
  }
  return list.join('&');
}

export class ParkingClient {
  private request: Axios
  private pid: string
  private uid: string
  private mallId: string

  constructor (pid: string, mallId: string, uid: string) {
    this.pid = pid
    this.uid = uid
    this.mallId = mallId
    const cookie = `_uid_huarunpark_h5_${mallId}=${uid}%2C${mallId};`;
    this.request = axios.create({
      baseURL: 'https://parking.mixcapp.com',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Cookie': cookie,
        'Referer': `https://parking.mixcapp.com/a/park/${mallId}/ParkFee/FeeDetails`
      }
    })
  }


  async getParkFeeInit(plate: string): Promise<ParkFeeInfo> {
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('pid', this.pid);
    urlEncodedData.append('plate', plate);
    urlEncodedData.append('barcode', '');
    urlEncodedData.append('orgin', '2');


    const { data } = await this.request.post<ParkFeeResponseType>(`/a/park/${this.mallId}/ParkFee/GetParkFeeInit?_token=`, urlEncodedData)
    console.log(data)
    if (!data.success) {
      throw new Error('获取车辆信息出错，可能未停入')
    }

    const parkFeeInfo = JSON.parse(data.ParkFee) as ParkFeeType

    return parkFeeInfo.d
  }

  async payParkFee(plateNo: string, rights: Right[]) {
    const data = {
      MallID: this.mallId,
      ParkID: this.pid,
      UID: this.uid,
      PlateNo: plateNo,
      Barcode: '',
      FreeMinutes: '0',
      FreeAmount: rights.reduce((sum, r) => sum + r.Amount, 0),
      OrderPrice: '0',
      ParkName: '',
      orderSource: '0',
      RightsModelList: rights
    }

    const response = await this.request.post<ParkFeeResponseType>(`/a/park/${this.mallId}/ParkFee/PayParkFeeV3?_token=`, encodeUrlForm(data))

    return response.data
  }

}