/**
 * @packageDocumentation
 * @module API-DELTA-Transactions
 */

import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import { DELTAConstants } from "./constants"
import { SelectCredentialClass } from "./credentials"
import { KeyChain, KeyPair } from "./keychain"
import { Credential } from "../../common/credentials"
import { DELTAStandardTx, DELTAStandardUnsignedTx } from "../../common/deltatx"
import createHash from "create-hash"
import { DELTABaseTx } from "./basetx"
import { ImportTx } from "./importtx"
import { ExportTx } from "./exporttx"
import { SerializedEncoding } from "../../utils/serialization"
import { TransactionError } from "../../utils/errors"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()

/**
 * Takes a buffer representing the output and returns the proper [[DELTABaseTx]] instance.
 *
 * @param txTypeID The id of the transaction type
 *
 * @returns An instance of an [[DELTABaseTx]]-extended class.
 */
export const SelectTxClass = (
  txTypeID: number,
  ...args: any[]
): DELTABaseTx => {
  if (txTypeID === DELTAConstants.IMPORTTX) {
    return new ImportTx(...args)
  } else if (txTypeID === DELTAConstants.EXPORTTX) {
    return new ExportTx(...args)
  }
  /* istanbul ignore next */
  throw new Error("TransactionError - SelectTxClass: unknown txType")
}

export class UnsignedTx extends DELTAStandardUnsignedTx<
  KeyPair,
  KeyChain,
  DELTABaseTx
> {
  protected _typeName = "UnsignedTx"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.transaction = SelectTxClass(fields["transaction"]["_typeID"])
    this.transaction.deserialize(fields["transaction"], encoding)
  }

  getTransaction(): DELTABaseTx {
    return this.transaction as DELTABaseTx
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0)
    offset += 2
    const txtype: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.transaction = SelectTxClass(txtype)
    return this.transaction.fromBuffer(bytes, offset)
  }

  /**
   * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
   *
   * @param kc An [[KeyChain]] used in signing
   *
   * @returns A signed [[StandardTx]]
   */
  sign(kc: KeyChain): Tx {
    const txbuff: Buffer = this.toBuffer()
    const msg: Buffer = Buffer.from(
      createHash("sha256").update(txbuff).digest()
    )
    const creds: Credential[] = this.transaction.sign(msg, kc)
    return new Tx(this, creds)
  }
}

export class Tx extends DELTAStandardTx<KeyPair, KeyChain, UnsignedTx> {
  protected _typeName = "Tx"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.unsignedTx = new UnsignedTx()
    this.unsignedTx.deserialize(fields["unsignedTx"], encoding)
    this.credentials = []
    for (let i: number = 0; i < fields["credentials"].length; i++) {
      const cred: Credential = SelectCredentialClass(
        fields["credentials"][`${i}`]["_typeID"]
      )
      cred.deserialize(fields["credentials"][`${i}`], encoding)
      this.credentials.push(cred)
    }
  }

  /**
   * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it,
   * populates the class, and returns the length of the Tx in bytes.
   *
   * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
   * @param offset A number representing the starting point of the bytes to begin parsing
   *
   * @returns The length of the raw [[Tx]]
   */
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.unsignedTx = new UnsignedTx()
    offset = this.unsignedTx.fromBuffer(bytes, offset)
    const numcreds: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.credentials = []
    for (let i: number = 0; i < numcreds; i++) {
      const credid: number = bintools
        .copyFrom(bytes, offset, offset + 4)
        .readUInt32BE(0)
      offset += 4
      const cred: Credential = SelectCredentialClass(credid)
      offset = cred.fromBuffer(bytes, offset)
      this.credentials.push(cred)
    }
    return offset
  }
}
