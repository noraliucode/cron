const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { mnemonicToMiniSecret } = require("@polkadot/util-crypto");

export const ROCOCO = "wss://rococo-rpc.polkadot.io";
const wsProvider = new WsProvider(ROCOCO);
const api = await ApiPromise.create({ provider: wsProvider });

export const config = {
  runtime: "edge",
};

export const readData = async () => {
  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.NEXT_PUBLIC_BIN_ID}`,
      {
        method: "GET",
        headers: {
          "X-Master-Key": `${process.env.NEXT_PUBLIC_BIN_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`readData HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("There was a network error:", error);
  }
};

export const executeAnnouncedCalls = async () => {
  const data = (await readData()).record;
  const announcedData = data.announce;
  const calls = announcedData.map((announce) => {
    return getAnnouncedCalls(announce.delegate, announce.real);
  });
  await batchCalls(calls);
};

const transferPayment = async () => {
  const data = (await readData()).record;
  const pullPaymentData = data.pullPayment;
  const calls = pullPaymentData.map((payment) => {
    return getTransactionCalls(payment.receiver, payment.amount);
  });
  await batchCalls(calls);
};

const getTransactionCalls = async (receiver, amount) => {
  try {
    const api = await ApiPromise.create();

    const transfer = api.tx.balances.transfer(receiver, amount);

    return transfer;
  } catch (error) {
    console.log("getTransactions error:", error);
  }
};

const getAnnouncedCalls = async (delegate, real) => {
  try {
    const transfer = api.tx.proxy.proxyAnnounced(
      delegate,
      real,
      "Any",
      api.tx.balances.transfer
    );

    return transfer;
  } catch (error) {
    console.log("getTransactions error:", error);
  }
};

const batchCalls = async (calls) => {
  // Sign and send the transaction using our account
  const seed = process.env.NEXT_PUBLIC_SEED;
  console.log("seed: ", seed);

  const keyring = new Keyring({ type: "sr25519" });
  const seedU8a = mnemonicToMiniSecret(seed);
  const sender = keyring.addFromSeed(seedU8a);

  const api = await ApiPromise.create();
  const txHash = await new Promise((resolve, reject) => {
    api.tx.utility
      .batchAll(calls)
      .signAndSend(sender, null, (status) => {
        if (status.isInBlock) {
          console.log("batchCalls status: ", status);

          const tx = status.txHash.toString();
          resolve(tx);
        }
      })
      .catch((error) => {
        console.log("batchCalls error: ", error);
        reject(error);
      });
  });
  return txHash;
};

const handleRequest = async (request) => {
  try {
    await executeAnnouncedCalls();

    // if date === 5th of month
    const currentDate = new Date();
    const dayOfMonth = currentDate.getDate();
    if (dayOfMonth === 5) {
      await transferPayment();
    }
  } catch (error) {
    console.log("handleRequest error: ", error);
  }
};

export default handleRequest;
