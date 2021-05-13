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

export function TransferCluster({address}) {
async function transfer() {
  console.log('Ping...');
  await fcl.send([fcl.ping()]);
  console.log('OK');

  await handleTransaction('Sending transaction...', [
      fcl.transaction`
      import Pixori from 0x05f5f6e2056f588b 

      transaction(address: Address) {
      
          let transferToken: @Pixori.NFT
          let getMetadataRef: {String: String}
      
          prepare(acct: AuthAccount) {
      
              let collectionRef = acct.borrow<&Pixori.Collection>(from: /storage/NFTCollection)
                  ?? panic("Could not borrow a reference to the owner's collection")
      
              self.transferToken <- collectionRef.withdraw(withdrawID: 34) // set "withdrawID" as a variable
              self.getMetadataRef = collectionRef.getMetadata(id: 34) // set "id" as a variable
          }
      
          execute {
      
              let recipient = getAccount(address) 
      
              let receiverRef = recipient.getCapability<&{Pixori.NFTReceiver}>(/public/NFTReceiver)
                  .borrow()
                  ?? panic("Could not borrow receiver reference")
      
              receiverRef.deposit(token: <-self.transferToken, metadata: self.getMetadataRef)
              log("NFT transferred from Admin account to Current-user account")
          }
      }
    `,
    fcl.payer(buildAuthorization(admin)),
    fcl.proposer(buildAuthorization(admin)),
    fcl.authorizations([buildAuthorization(admin)]),
    fcl.args([fcl.arg(address, t.Address)]),
    fcl.limit(35),
  ]);

}
  return (
    <div>
      <button onClick={transfer}>Transfer</button>
    </div>
  );
}

