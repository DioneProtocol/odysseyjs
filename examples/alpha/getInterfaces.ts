import { SendResponse } from "../../src/apis/alpha"

const main = async (): Promise<any> => {
  const sendResponse: SendResponse = {
    txID: process.env.TX_ID || "2wYzSintaK3NWk71CGBvzuieFeAzJBLYpwfypGwQMsyotcK8Zs",
    changeAddr: process.env.CHANGE_ADDR || "A-dione1vwf7dg22l9c0lnt92kq3urf0h9j3x6296sue77"
  }
  console.log(sendResponse)
}

main()
