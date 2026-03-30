import "dotenv/config"
import { Odyssey } from "../../src"
import { DELTAAPI } from "../../src/apis/delta"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()

const main = async (): Promise<any> => {
  const address: string = process.env.WALLET_ADDRESS || "your_wallet_address_here"
  const blockHeight: string = "latest"
  const assetID: string = process.env.ASSET_ID || "8eqonZUiJZ655TLQdhFDCqY8oV4SPDMPzqfoVMVsSNE4wSMWu"
  const balance: object = await dchain.getAssetBalance(
    address,
    blockHeight,
    assetID
  )
  console.log(balance)
}

main()
