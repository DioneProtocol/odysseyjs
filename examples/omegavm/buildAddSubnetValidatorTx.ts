import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import { GetUTXOsResponse } from "../../src/apis/omegavm/interfaces"
import {

  UnixNow
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
// Keychain with 4 keys-A, B, D, and D
const oKeychain: KeyChain = ochain.keyChain()
// Keypair A
const key = process.env.PRIVATE_KEY || "your_private_key_here"
let privKey: Buffer = new Buffer(key, "hex")
oKeychain.importKey(privKey)

// Keypair B
privKey = new Buffer(process.env.PRIVATE_KEY_B || "your_private_key_b_here", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer(process.env.PRIVATE_KEY_C || "your_private_key_c_here", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer(process.env.PRIVATE_KEY_D || "your_private_key_d_here", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const nodeID: string = process.env.NODE_ID || "NodeID-7sECFXYT5k6VR4LzHRhFbqWdPcSBnXfK3"
const startTime: BN = UnixNow().add(new BN(process.env.START_TIME || 60 * 1))
const endTime: BN = startTime.add(new BN(process.env.END_TIME || 1000))
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: GetUTXOsResponse = await ochain.getUTXOs(
    oAddressStrings
  )
  const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const weight: BN = new BN(1)
  const subnetID: string = process.env.SUBNET_ID || "2ivEh5xHybHhusC2ZzXY7EY99SuR8s2Vet7qwuTsazvnj2VXg2"
  const memo: Buffer = Buffer.from(
    "Utility function to create a AddSubnetValidatorTx transaction"
  )
  const subnetAuthCredentials: [number, Buffer][] = [
    [0, oAddresses[3]],
    [1, oAddresses[1]]
  ]
  const unsignedTx: UnsignedTx = await ochain.buildAddSubnetValidatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    weight,
    subnetID,
    memo,
    asOf,
    subnetAuthCredentials
  )
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
