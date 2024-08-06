const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs/promises");
const contract = require("./constants.json");
require("dotenv").config();

const { Web3 } = require("web3");
const web3 = new Web3("https://avalanche-fuji-c-chain-rpc.publicnode.com");

// const privateKey =
//   "0xf577799910e4f533b2b7ebe5b4659e589b9767b9816670d91d707c6e5e178d6b";
const pubKey = "0x48bFE3CBC548f7b5c232c545E6288317d5Fc6e17";

app.use(express.json());

app.get("/", (req, res) => {
  console.log(process.env.privateKey);
  const account = web3.eth.accounts.create();
  res.json(account);
});

app.get("/users", async (req, res) => {
  const data = await fs.readFile("data.json", "utf8");
  const users = JSON.parse(data).users;
  res.json(users);
});

app.post("/transfer", async (req, res) => {
  // add an account to a wallet
  const account = web3.eth.accounts.wallet.add(process.env.privateKey);
  // amount to transfer from body
  const amount = req.body.amount;
  const to = req.body.receiver;
  // Transfer amount from private key to "to" address
  const decimals = 1000000000000000000;

  const tx = {
    from: account[0].address,
    to,
    value: amount * decimals,
  };
  // With tx this transaction is sent to blockchain using sendTransaction
  const txReceipt = await web3.eth.sendTransaction(tx);
  console.log("Tx hash:", txReceipt.transactionHash);
  res.json({ hash: txReceipt.transactionHash });
});

app.post("/transfer-erc20", async (req, res) => {
  // add an account to a wallet
  web3.eth.accounts.wallet.add(process.env.privateKey);
  // amount to transfer from body
  const amount = req.body.amount;
  const to = req.body.receiver;
  // Transfer amount from private key to "to" address
  // const tx = {
  //   from: account[0].address,
  //   to,
  //   value: web3.utils.toWei(amount, "ether"),
  // };
  const eafitCOPContract = new web3.eth.Contract(
    contract.ABIEAFITCOP,
    contract.EAFITCOP
  );
  const decimals = 1000000000000000000;

  const trx = await eafitCOPContract.methods
    .transfer(to, amount * decimals)
    .send({ from: pubKey });
  console.log({ trx });
  // With tx this transaction is sent to blockchain using sendTransaction
  //   const txReceipt = await web3.eth.sendTransaction(tx);
  //   console.log("Tx hash:", txReceipt.transactionHash);
  res.json({ hash: trx?.transactionHash });
});

app.post("/purchase", async (req, res) => {
  // Importar base de datos
  const data = await fs.readFile("data.json", "utf8");
  // Obtencion del email por los headers
  const headers = req.headers?.authorization;
  const email = headers.split(" ")[1];
  // base de datos de usuarios
  const users = JSON.parse(data).users;
  // Filtro de usuario por email
  const user = users.find((el) => el.email === email);
  if (!user) {
    res.status(400).json({ message: "USER_NOT_FOUND" });
    return;
  }
  // Base de datos de ofertas
  const offers = JSON.parse(data).offers;
  //Filtro de la oferta especifica por id
  const myOffer = offers.find(
    (el) => el.id == req.body.idOffer && el.status == "FREE"
  );
  if (!myOffer) {
    res.status(400).json({ message: "OFFER_DOESNT_EXIST" });
    return;
  }
  const _privateKey = user.priKey;
  const message = `EAFIT-${req.body.idOffer}-Pepito-2025`;
  const sign = web3.eth.accounts.sign(message, _privateKey);
  const purchase = {
    id: JSON.parse(data).purchase.length + 1,
    userId: user.id,
    offerId: myOffer.id,
    energy: myOffer.energy,
    price: myOffer.price,
    typeGenerator: myOffer.typeGenerator,
    cashback: myOffer.price * 0.01,
    status: "PENDING",
    signature: sign.signature,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  };
  let newData = JSON.parse(data);
  newData.purchase.push(purchase);
  newData.offers[myOffer.id - 1].status = "INPROGRESS";
  await fs.writeFile("data.json", JSON.stringify(newData));
  console.log("actualizado");
  res.json({
    message: "PURCHASE_DONE",
    id: purchase.id,
  });
  return;
});

app.post("/purchase-web3", async (req, res) => {
  const { price, userPubKey, userPriKey, purchaseId, signature } = req.body;
  const decimals = 1000000000000000000;
  let approve;
  let deposit;
  try {
    web3.eth.accounts.wallet.add(process.env.privateKey);
    web3.eth.accounts.wallet.add(userPriKey);
    const eafitCOPContract = new web3.eth.Contract(
      contract.ABIEAFITCOP,
      contract.EAFITCOP
    );
    const estimateApprove = await eafitCOPContract.methods
      .approve(contract.Main, price * decimals)
      .estimateGas({ from: userPubKey });
    console.log({ estimateApprove });
    approve = await eafitCOPContract.methods
      .approve(contract.Main, price * decimals)
      .send({ from: userPubKey });
    const eafitMainContract = new web3.eth.Contract(
      contract.ABIMain,
      contract.Main
    );
    deposit = await eafitMainContract.methods
      .deposit(userPubKey, price * decimals, String(purchaseId), signature)
      .send({ from: pubKey });
  } catch (ex) {
    console.log({ ex });
    console.log(ex.message);
  }
  res.json({
    message: "PURCHASE_DONE",
    id: purchaseId,
    approve: approve?.transactionHash,
    deposit: deposit?.transactionHash,
  });
});
app.get("/transactions", async (req, res) => {
  const idTrx= req.body.idTrx
  // Importar base de datos
  const data = await fs.readFile("data.json", "utf8");
   // Obtencion del email por los headers
   const headers = req.headers?.authorization;
   const email = headers.split(" ")[1];
   // base de datos de usuarios
   const users = JSON.parse(data).users;
   // Filtro de usuario por email
   const user = users.find((el) => el.email === email);
   if (!user) {
     res.status(400).json({ message: "USER_NOT_FOUND" });
     return;
   }

  let transactions
  try{
    const eafitCOPContract = new web3.eth.Contract(
      contract.ABIMain,
      contract.Main
    );
    transactions= await eafitCOPContract
      .methods.transfers(String(idTrx)).call();
    console.log({ transactions: Number(transactions) });
  }
  catch (ex) {
    console.log({ ex });
    console.log(ex.message);
  }
  res.json({
    message: "Transactions",
    idTrx: idTrx,
    transactions: Number(transactions)
  });
});

app.post("/withdrawal"), async (req, res) => {
  const account = web3.eth.accounts.wallet.add(process.env.privateKey);
  const amount = req.body.amount;
  const to = req.body.receiver; 
  const decimals = 1000000000000000000;

  const eafitCOPContract = new web3.eth.Contract(
    contract.ABIMain,
    contract.Main
  );
  const withdrawal = await eafitCOPContract.methods
    .withdrawal(to, amount * decimals);
  console.log({ trx });
  res.json({ hash: withdrawal?.transactionHash });
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
