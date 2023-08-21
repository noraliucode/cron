import { blake2AsHex } from "@polkadot/util-crypto";
import { APIService } from "./apiService";

const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { mnemonicToMiniSecret } = require("@polkadot/util-crypto");

export const ROCOCO = "wss://rococo-rpc.polkadot.io";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const wsProvider = new WsProvider(ROCOCO);

export const config = {
  runtime: "edge",
};

export const readData = async (collection = "data") => {
  try {
    const response = await fetch(`${API_URL}/${collection}`, {
      method: "GET",
    });

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
  const announcedData = await readData("announced");

  const api = await ApiPromise.create({ provider: wsProvider });
  const apiService = new APIService(api);

  const balances = await apiService.getBalances(
    announcedData.map((announce) => announce.real)
  );
  const validAnnouncedData = announcedData.filter((announce, index) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const balance = balances[index].data.free.toNumber();
    const transferCall = apiService.getTransferSubmittable(
      announce.real,
      announce.total
    );
    const now = new Date().getTime();
    const callHash = blake2AsHex(transferCall.toU8a());
    return (
      balance >= announce.total &&
      callHash === announce.callHash &&
      now > Number(announce.delayUntil)
    );
  });
  console.log("validAnnouncedData: ", validAnnouncedData);

  const calls = validAnnouncedData.map((announce) => {
    console.log("announce: ", announce);
    return getAnnouncedCalls(announce.delegate, announce.real);
  });

  const txHash = await batchCalls(calls);
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
    const api = await ApiPromise.create({ provider: wsProvider });

    const transfer = api.tx.balances.transfer(receiver, amount);

    return transfer;
  } catch (error) {
    console.log("getTransactions error:", error);
  }
};

const getAnnouncedCalls = async (delegate, real) => {
  try {
    const api = await ApiPromise.create({ provider: wsProvider });
    const transfer = api.tx.proxy.proxyAnnounced(
      [delegate],
      [real],
      "Any",
      api.tx.balances.transfer
    );

    return transfer;
  } catch (error) {
    console.log("getAnnouncedCalls error:", error);
  }
};

const batchCalls = async (calls) => {
  // Sign and send the transaction using our account
  const seed = process.env.NEXT_PUBLIC_SEED;
  const keyring = new Keyring({ type: "sr25519" });
  const seedU8a = mnemonicToMiniSecret(seed);
  const sender = keyring.addFromSeed(seedU8a);

  const api = await ApiPromise.create({ provider: wsProvider });
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
