import "dotenv/config"
import { Odyssey } from "../../src"
import { AdminAPI } from "../../src/apis/admin"
import { SetLoggerLevelResponse } from "../../src/apis/admin/interfaces"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const admin: AdminAPI = odyssey.Admin()

const main = async (): Promise<any> => {
  const loggerName: string = "C"
  const logLevel: string = "DEBUG"
  const displayLevel: string = "INFO"
  const loggerLevel: SetLoggerLevelResponse = await admin.setLoggerLevel(
    loggerName,
    logLevel,
    displayLevel
  )
  console.log(loggerLevel)
}

main()
