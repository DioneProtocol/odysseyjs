import { GetAtomicTxParams } from "../../src/apis/delta"

const main = async (): Promise<any> => {
  const getAtomicTxParams: GetAtomicTxParams = {
    txID: process.env.TX_ID || "2wYzSintaK3NWk71CGBvzuieFeAzJBLYpwfypGwQMsyotcK8Zs"
  }
  console.log(getAtomicTxParams)
}

main()
