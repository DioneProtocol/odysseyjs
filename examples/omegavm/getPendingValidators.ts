import "dotenv/config"
import { Odyssey } from "../../src"
import { OmegaVMAPI } from "../../src/apis/omegavm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()

const main = async (): Promise<any> => {
  const subnetID: string = process.env.SUBNET_ID || "11111111111111111111111111111111LpoYY"
  const pendingValidators: object = await ochain.getPendingValidators(subnetID)
  console.log(pendingValidators)
}

main()
