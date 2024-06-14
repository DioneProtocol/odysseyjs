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
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
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
const key = ""
const privKey1: Buffer = new Buffer(key, "hex")
// O-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
oKeychain.importKey(privKey1)

// Keypair B
let privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// O-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj
oKeychain.importKey(privKey)

// Keypair D
privKey = "PrivateKey-24gdABgapjnsJfnYkfev6YPyQhTaCU72T9bavtDNTYivBLp2eW"
// O-custom1u6eth2fg33ye63mnyu5jswtj326jaypvhyar45
oKeychain.importKey(privKey)

// Keypair D
privKey = "PrivateKey-2uWuEQbY5t7NPzgqzDrXSgGPhi3uyKj2FeAvPUHYo6CmENHJfn"
// O-custom1t3qjau2pf3ys83yallqt4y5xc3l6ya5f7wr6aq
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const nodeID: string = "NodeID-7sECFXYT5k6VR4LzHRhFbqWdPcSBnXfK3"
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(1000))
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: GetUTXOsResponse = await ochain.getUTXOs(
    oAddressStrings
  )
  const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const weight: BN = new BN(1)
  const subnetID: string = "2ivEh5xHybHhusC2ZzXY7EY99SuR8s2Vet7qwuTsazvnj2VXg2"
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
