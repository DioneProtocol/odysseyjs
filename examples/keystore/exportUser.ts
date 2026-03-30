import "dotenv/config"
import { Odyssey } from "../../src"
import { KeystoreAPI } from "../../src/apis/keystore"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const keystore: KeystoreAPI = odyssey.NodeKeys()

const main = async (): Promise<any> => {
  const username: string = process.env.USERNAME || "username"
  const password: string = process.env.PASSWORD || "Vz48jjHLTCcAepH95nT4B"
  const user: string = await keystore.exportUser(username, password)
  console.log(user)
}

main()
