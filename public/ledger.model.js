const BIPPath = require('bip32-path');
const Symbol = require('symbol-sdk');


const MAX_CHUNK_SIZE = 255

class SymbolLedger {
    transport;

    constructor(transport, scrambleKey) {
        this.transport = transport
        transport.decorateAppAPIMethods(this, ['getAddress', 'signTransaction', 'getAppConfiguration'], scrambleKey)
    }

    /**
     * get NEM address for a given BIP 32 path.
     *
     * @param path a path in BIP 32 format
     * @param display optionally enable or not the display
     * @param chainCode optionally enable or not the chainCode request
     * @param ed25519
     * @return an object with a publicKey, address and (optionally) chainCode
     * @example
     * const result = await NemLedger.getAddress(bip32path);
     * const { publicKey, address } = result;
     */
    async getAccount(path) {
        const display = false
        const chainCode = false
        const ed25519 = true

        const bipPath = BIPPath.fromString(path).toPathArray()
        const curveMask = ed25519 ? 0x80 : 0x40

        // APDU
        const cla = 0xe0
        const ins = 0x02
        const p1 = display ? 0x01 : 0x00
        const p2 = curveMask | (chainCode ? 0x01 : 0x00)
        const data = Buffer.alloc(1 + bipPath.length * 4)

        data.writeInt8(bipPath.length, 0)
        bipPath.forEach((segment, index) => {
            data.writeUInt32BE(segment, 1 + index * 4)
        })

        const response = await this.transport.send(cla, ins, p1, p2, data)

        const result = {
            address: '',
            publicKey: '',
            path: '',
        }
        const addressLength = response[0]
        const publicKeyLength = response[1 + addressLength]
        result.address = response.slice(1, 1 + addressLength).toString('ascii')
        result.publicKey = response.slice(1 + addressLength + 1, 1 + addressLength + 1 + publicKeyLength).toString('hex')
        result.path = path
        return result
    }

    /**
     * sign a NEM transaction with a given BIP 32 path
     *
     * @param path a path in BIP 32 format
     * @param rawPayload a raw payload transaction hex string
     * @param networkGenerationHash the network generation hash of block 1
     * @return a SignedTransaction
     * @example
     * const signature = await NemLedger.signTransaction(bip32path,
     * "B40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
     * 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000190544140420F000
     * 0000000FBA412E61900000090FC443D62754C19452DC196C3C8CDC86782F36565BEC9A41D1000010057656C636F6D6520546F204E454D
     * 32B0348BFF6E081A7A0100000000000000", "DEEF3950CFF3995F3AAD88AA5C593ADA6A6833D744611769E3E66F3942B2838B");
     */
    // public signingBytes:any
    async signTransaction(path, transferTransaction, networkGenerationHash, signer) {
        var rawPayload = transferTransaction
        var signingBytes = networkGenerationHash + rawPayload.slice(216)
        var rawTx = Buffer.from(signingBytes, 'hex')
        // symbol-sdk 0.17.3
        let twiceTransfer
        // The length of the APDU buffer is 255Bytes
        if (rawTx.length > 446) {
            console.error('Transaction length is over the limit.');
        } else {
            twiceTransfer = rawTx.length > 234 ? true : false;
        }

        let response
        await this.generateDataUnit(rawTx, path, twiceTransfer)
            .then((res) => {
                response = res
            })
            .catch((err) => console.log(err))

        // Response from Ledger
        const h = response.toString('hex')

        const signature = h.slice(0, 128)

        const payload = rawPayload.slice(0, 16) + signature + signer + rawPayload.slice(16 + 128 + 64, rawPayload.length)

        const generationHashBytes = Array.from(Symbol.Convert.hexToUint8(networkGenerationHash))

        const transactionHash = Symbol.Transaction.createTransactionHash(payload, generationHashBytes)

        return {payload,transactionHash}
    }
    async signCosignatureTransaction(
        path,
        transferTransaction,
        transactionHash,
        networkGenerationHash,
        signer,
    ) {
        var rawPayload = transferTransaction
        var signingBytes = transactionHash + rawPayload.slice(216)
        var rawTx = Buffer.from(signingBytes, 'hex')
        let twiceTransfer

        // The length of the APDU buffer is 255Bytes
        if (rawTx.length > 446) {
            console.error('Transaction length is over the limit.');
        } else {
            twiceTransfer = rawTx.length > 234 ? true : false;
        }

        let response
        await this.generateDataUnit(rawTx, path, twiceTransfer)
            .then((res) => {
                response = res
            })
            .catch((err) => console.log(err))

        // Response from Ledger
        const h = response.toString('hex')
        const signature = h.slice(0, 128)
        return {signature}
    }

    async generateDataUnit(rawTx, path, twiceTransfer) {
        let offset = 0
        const curveMask = 0x80
        const bipPath = BIPPath.fromString(path).toPathArray()
        const apdus = []

        while (offset !== rawTx.length) {
            const maxChunkSize = offset === 0 ? MAX_CHUNK_SIZE - 1 - bipPath.length * 4 : MAX_CHUNK_SIZE
            const chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize
            const apdu = {
                cla: 0xe0,
                ins: 0x04,
                p1: offset === 0 ? 0x00 : 0x80,
                p2: curveMask,
                data: offset === 0 ? Buffer.alloc(1 + bipPath.length * 4 + chunkSize) : Buffer.alloc(chunkSize),
            }

            if (offset === 0) {
                apdu.data.writeInt8(bipPath.length, 0)
                bipPath.forEach((segment, index) => {
                    apdu.data.writeUInt32BE(segment, 1 + index * 4)
                })
                rawTx.copy(apdu.data, 1 + bipPath.length * 4, offset, offset + chunkSize)
                if (!twiceTransfer) {
                    apdu.p1 = 0x90
                }
            } else {
                rawTx.copy(apdu.data, 0, offset, offset + chunkSize)
            }

            apdus.push(apdu)
            offset += chunkSize
        }
        let response = Buffer.alloc(0)
        for (const apdu of apdus) {
            response = await this.transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data)
        }
        return response
    }
}


module.exports = {
    SymbolLedger
}