import { SignedTransaction, CosignatureSignedTransaction } from 'symbol-sdk'

export class LedgerService {
  async getAccount(currentPath: any) {
    const param = {
      currentPath: currentPath,
    }
    console.log('------------in LedgerService')
    const host = 'http://localhost:6789'
    const result = await fetch(host + '/ledger/account/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param),
    })
    console.log('---------result is --------', result)
    const data = await result.json()
    console.log('---------data is --------', data)
    const { address, publicKey, path } = data
    return { address, publicKey, path }
  }

  async signTransaction(path: string, transferTransaction: any, networkGenerationHash: string, signer: string) {
    const transferTransactionSerialize = transferTransaction.serialize()
    const param = {
      path: path,
      transferTransactionSerialize: transferTransactionSerialize,
      networkGenerationHash: networkGenerationHash,
      signer: signer,
    }

    const host = 'http://localhost:6789'
    const result = await fetch(host + '/ledger/sign/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param),
    })

    const data = await result.json()
    const signedTransaction = new SignedTransaction(
      data.payload,
      data.transactionHash,
      data.signer,
      transferTransaction.type,
      transferTransaction.networkType,
    )
    return signedTransaction
  }

  async signCosignatureTransaction(
    path: string,
    transferTransaction: any,
    networkGenerationHash: string,
    signer: string,
  ) {
    const transferTransactionSerialize = transferTransaction.serialize()
    const transactionHash = transferTransaction.transactionInfo.hash
    const param = {
      path: path,
      transferTransactionSerialize: transferTransactionSerialize,
      transactionHash: transactionHash,
      networkGenerationHash: networkGenerationHash,
      signer: signer,
    }

    const host = 'http://localhost:6789'
    const result = await fetch(host + '/ledger/signCosignature/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param),
    })

    const data = await result.json()
    const signedTransaction = new CosignatureSignedTransaction(transactionHash, data.signature, data.signer)

    return signedTransaction
  }
}
