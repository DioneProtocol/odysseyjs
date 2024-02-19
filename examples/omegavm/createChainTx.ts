import "dotenv/config"
import {
  Odyssey,
  BinTools,
  BN,
  Buffer,
  GenesisAsset,
  GenesisData
} from "../../src"
import { InitialStates } from "../../src/apis/alpha"
import {
  OmegaVMAPI,
  KeyChain,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  CreateChainTx,
  Tx
} from "../../src/apis/omegavm"
import { Output } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  ONEDIONE
} from "../../src/utils"

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
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// O-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
oKeychain.importKey(privKey)

// Keypair B
privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
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
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const oChainBlockchainID: string = "11111111111111111111111111111111LpoYY"
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = ONEDIONE
const threshold: number = 1
const locktime: BN = new BN(0)
const dioneUTXOKeychain: Buffer[] = [oAddresses[0], oAddresses[1]]
const dioneUTXOKeychainStrings: string[] = [
  oAddressStrings[0],
  oAddressStrings[1]
]

const main = async (): Promise<any> => {
  const assetAlias: string = "AssetAliasTest"
  const name: string = "Test Asset"
  const symbol: string = "TEST"
  const denomination: number = 0
  const amount: BN = new BN(507)
  const vcapSecpOutput = new SECPTransferOutput(
    amount,
    dioneUTXOKeychain,
    locktime,
    threshold
  )
  const initialStates: InitialStates = new InitialStates()
  initialStates.addOutput(vcapSecpOutput)
  const memo: Buffer = Buffer.from(
    "Manually create a CreateChainTx which creates a 1-of-2 DIONE utxo and instantiates a VM into a blockchain by correctly signing the 2-of-3 SubnetAuth"
  )
  const genesisAsset = new GenesisAsset(
    assetAlias,
    name,
    symbol,
    denomination,
    initialStates,
    memo
  )
  const genesisAssets: GenesisAsset[] = []
  genesisAssets.push(genesisAsset)
  const genesisData: GenesisData = new GenesisData(genesisAssets, networkID)
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings[0])
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    unlocked.sub(fee),
    dioneUTXOKeychain,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const omegaVMUTXOResponse: any = await ochain.getUTXOs(
    dioneUTXOKeychainStrings
  )
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    const output: Output = utxo.getOutput()
    if (output.getOutputID() === 7) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()
      const txid: Buffer = utxo.getTxID()
      const outputidx: Buffer = utxo.getOutputIdx()

      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      secpTransferInput.addSignatureIdx(0, oAddresses[0])

      const input: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        dioneAssetID,
        secpTransferInput
      )
      inputs.push(input)
    }
  })

  const subnetID: Buffer = bintools.cb58Decode(
    "yKRV4EvGYWj7HHXUxSYzaAQVazEvaFPKPhJie4paqbrML5dub"
  )
  const chainName: string = "EPIC ALPHA"
  const vmID: string = "alpha"
  const fxIDs: string[] = ["secp256k1fx", "nftfx", "propertyfx"]
  fxIDs.sort()
  const blockchainID: Buffer = bintools.cb58Decode(oChainBlockchainID)
  const createChainTx: CreateChainTx = new CreateChainTx(
    networkID,
    blockchainID,
    outputs,
    inputs,
    memo,
    subnetID,
    chainName,
    vmID,
    fxIDs,
    genesisData
  )

  createChainTx.addSignatureIdx(0, oAddresses[3])
  createChainTx.addSignatureIdx(1, oAddresses[1])
  const unsignedTx: UnsignedTx = new UnsignedTx(createChainTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
