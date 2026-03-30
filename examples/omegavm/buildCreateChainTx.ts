import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer, GenesisData } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import {

  UnixNow
} from "../../src/utils"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
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

// Keypair C
privKey = new Buffer(process.env.PRIVATE_KEY_C || "your_private_key_c_here", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer(process.env.PRIVATE_KEY_D || "your_private_key_d_here", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const genesisDataStr: string =
    process.env.GENESIS_DATA || "11111DdZMhYXUZiFV9FNpfpTSQroysjHyMuT5zapYkPYrmap7t7S3sDNNwFzngxR9x1XmoRj5JK1XomX8RHvXYY5h3qYeEsMQRF8Ypia7p1CFHDo6KGSjMdiQkrmpvL8AvoezSxVWKXt2ubmBCnSkpPjnQbBSF7gNg4sPu1PXdh1eKgthaSFREqqG5FKMrWNiS6U87kxCmbKjkmBvwnAd6TpNx75YEiS9YKMyHaBZjkRDNf6Nj1"
  const subnetIDStr: string =
    process.env.SUBNET_ID || "2cXEvbdDaP6q6srB6x1T14raebpJaM4s2t9NE5kiXzLqLXQDWm"
  const memo: Buffer = Buffer.from(
    "Utility function to create a CreateChainTx transaction"
  )
  const subnetID: Buffer = bintools.cb58Decode(subnetIDStr)
  const chainName: string = process.env.CHAIN_NAME || "EPIC ALPHA"
  const vmID: string = process.env.VM_ID || "alpha"
  const fxIDs: string[] = ["secp256k1fx", "nftfx", "propertyfx"]

  // Only for ALPHA serialization. For other VMs comment these 2 lines
  const genesisData: GenesisData = new GenesisData()
  genesisData.fromBuffer(bintools.cb58Decode(genesisDataStr))

  // For VMs other than ALPHA. For ALPHA comment this line
  // const genesisData = genesisDataStr
  const subnetAuthCredentials: [number, Buffer][] = [
    [0, oAddresses[3]],
    [1, oAddresses[1]]
  ]

  const unsignedTx: UnsignedTx = await ochain.buildCreateChainTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    subnetID,
    chainName,
    vmID,
    fxIDs,
    genesisData,
    memo,
    asOf,
    subnetAuthCredentials
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
