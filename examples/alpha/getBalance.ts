import "dotenv/config"
import { Odyssey } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const address: string = process.env.ADDRESS || "A-dione19zfygxaf59stehzedhxjesads0p5jdvfeedal0"
  const balance: object = await achain.getBalance(address, process.env.ASSET_ID || "DIONE")
  console.log(balance)
}

main()
