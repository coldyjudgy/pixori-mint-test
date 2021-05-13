import React from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types"
import { SHA3 } from 'sha3';
import * as Elliptic from 'elliptic';


const ec = new Elliptic.ec('p256');

function hashMsgHex(msgHex: string) {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, 'hex'));
  return sha.digest();
}

function signWithKey(privateKey: string, data: string) {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hashMsgHex(data));
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}

interface Account {
  address: string;
  publicKey: string;
  privateKey: string;
  keyId: number;
}

export const buildAuthorization = ({ address, keyId, privateKey }: Account) => (
  account: any
) => ({
  ...account,
  tempId: address,
  addr: address,
  keyId: keyId,
  resolve: null,
  signingFunction: (data: any) => {
    return {
      addr: address,
      keyId: keyId,
      signature: signWithKey(privateKey, data.message),
    };
  },
});

const admin: Account = {
  address: '05f5f6e2056f588b',
  publicKey:
    '2f903857515eb6eb0bbfe6a8e587878e172c728c964914fde02eefe0d23dcf46d766bf9e1e55843c047b1baa132b8d652e77ed5ffae1b1e807c1c9d9ee15ed33',
  privateKey:
    'cfa7ed37cd930acd4f64c843901f276bc66941952b75a7c0e1646a50ec486e22',
  keyId: 0,
};

async function handleTransaction(description: string, args: any) {
  try {
    console.log(description);
    const transaction = await fcl.send(args);
    console.log('-->', transaction.transactionId);
    await fcl.tx(transaction).onceSealed();
    console.log('OK');
  } catch (e) {
    console.log('KO : ', e);
  }
}

export function MintCluster({array}){
async function mint() {
  console.log('Ping...');
  await fcl.send([fcl.ping()]);
  console.log('OK');

  await handleTransaction('Sending transaction...', [
      fcl.transaction`
      import Pixori from 0x05f5f6e2056f588b 

      transaction(metadata: {String: String}) {
      
          let receiverRef: &{Pixori.NFTReceiver}
          let minterRef: &Pixori.NFTMinter
      
          prepare(acct: AuthAccount) {
      
              self.receiverRef = acct.getCapability<&{Pixori.NFTReceiver}>(/public/NFTReceiver)
                  .borrow()
                  ?? panic("Could not borrow receiver reference")
              
              self.minterRef = acct.borrow<&Pixori.NFTMinter>(from: /storage/NFTMinter)
                  ?? panic("Could not borrow minter reference")
          }
      
          execute {
      
              let newNFT <- self.minterRef.mintNFT()
              
              self.receiverRef.deposit(token: <-newNFT, metadata: metadata)
              log("NFT Minted and deposited to the Current user's Collection")
          }
      }
    `,
    fcl.payer(buildAuthorization(admin)),
    fcl.proposer(buildAuthorization(admin)),
    fcl.authorizations([buildAuthorization(admin)]),
    fcl.args([
      fcl.arg(
      [
        {key: "name", value: "test12"},
        {key: "date", value: "May 12"},
        {key: "time", value: "01:17"},
        {key: "color", value: array},
      ],  
      t.Dictionary([
        {key: t.String, value: t.String},
        {key: t.String, value: t.String},
        {key: t.String, value: t.String},
        {key: t.String, value: t.String},
      ])
      )]      
    ),
    fcl.limit(35),
  ]);

}
return (
  <div>
    <button onClick={mint}>Mint</button>
  </div>
);
}

