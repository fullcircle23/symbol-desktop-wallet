var JSAlert = require('js-alert');
const express = require('express');
const cors = require('cors');
const app = express();
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid');
const TransportWebUSB = require('@ledgerhq/hw-transport-webusb')
const SymbolLedger = require("./ledger.model");
const TransactionType = require('symbol-sdk')
const Port = 6789;

// Enable preflight requests for all routes
app.use(cors());

// Replace if using a different env file or config
// const env = require("dotenv").config({ path: "./.env" });

app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        }
    })
);

// app.use(cors(corsOptions));

async function account(req, res) {
  const { currentPath } = req.body;
  // alert('This is account function in LedgerCallServer!');
  console.log("--------------########___________currentPath in public/ledgerCallServer is :",currentPath)
  const transport = await TransportNodeHid["default"].open('');//["default"].create();
  console.log('transport',transport)
  const symbolLedger = new SymbolLedger.SymbolLedger(transport, 'XYM');
  console.log('symbolLedger',symbolLedger)
  const accountResult = await symbolLedger.getAccount(currentPath);
  console.log('accountResult',accountResult)
  const { address, publicKey, path } = accountResult;
  transport.close();
  console.log("----------------req:",req)
  console.log('----------------accountResult',accountResult)
  res.send({ address, publicKey, path });
}

async function sign(req, res) {
  const { path, transferTransactionSerialize, networkGenerationHash, signer } = req.body;
  const transport = await TransportNodeHid["default"].create();
  const symbolLedger = new SymbolLedger.SymbolLedger(transport, 'XYM');
  const signedTransaction = await symbolLedger.signTransaction(path, transferTransactionSerialize, networkGenerationHash, signer)

  const {payload, transactionHash} = signedTransaction
  transport.close();
  res.send({payload,transactionHash,signer});
}

async function signCosignatureTransaction(req, res) {
  const { path, transferTransactionSerialize,transactionHash, networkGenerationHash, signer } = req.body;
  const transport = await TransportNodeHid["default"].create();
  const symbolLedger = new SymbolLedger.SymbolLedger(transport, 'XYM');
  const signedTransaction = await symbolLedger.signCosignatureTransaction(path, transferTransactionSerialize, transactionHash, networkGenerationHash, signer);
  const {signature} = signedTransaction
  transport.close();
  res.send({signature,signer});

}

app.post('/ledger/account',async(req,res)=>{
  JSAlert.alert("this is alert in Post")
  console.log("post account data to /ledger/account ")
  account(req,res);
  
  // const  address= 'TCTBZLHW5R6VQW2TER33WCYAQ5JK2K5MZAUKKWWJ'
  // const  publicKey= '68db1b91fba59f04eefb98111790e1c3de177ffadc6ef039ded83b45c97093b9'
  // const  path= "m/44'/4343'/152'/0'/0'"
  
  // res.send({address,publicKey,path})
})
app.post('/ledger/sign',async(req,res)=>{
  JSAlert.alert("this is alert in Post")
  console.log("Post signed data to /ledger/account ")
  sign(req,res);
})
app.post('/ledger/signCosignature',async(req,res)=>{
  console.log("post CosignatureSignedTx data to /ledger/account ")
  signCosignatureTransaction(req,res);
})

app.listen(Port, () => console.log(`Node server listening on port ${Port}!`));
