import "dotenv/config"
import { Odyssey } from "../../src"
import { IndexAPI } from "../../src/apis/index"
import { IsAcceptedResponse } from "../../src/apis/index/interfaces"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const index: IndexAPI = odyssey.Index()

const main = async (): Promise<any> => {
  const id: string = "eLXEKFFMgGmK7ZLokCFjppdBfGy5hDuRqh5uJVyXXPaRErpAX"
  const encoding: string = "hex"
  const baseurl: string = "/ext/index/A/tx"
  const isContainerAccepted: IsAcceptedResponse = await index.isAccepted(
    id,
    encoding,
    baseurl
  )
  console.log(isContainerAccepted)
}

main()
