// TODO: a better way to handle duplicated code with apiService.ts in client side folder
// https://github.com/noraliucode/cryptopatronage/blob/dev/src/services/apiService.ts
import { ApiPromise } from "@polkadot/api";

class APIService {
  api: ApiPromise;
  constructor(api: ApiPromise) {
    this.api = api;
  }

  getBalances = async (addresses: string[]) => {
    try {
      const balances = await this.api.query.system.account.multi(addresses);
      return balances;
    } catch (error) {
      console.log("getBalances error: ", error);
    }
  };

  getTransferSubmittable = (receiver: string, amount: number) => {
    return this.api.tx.balances.transfer(receiver, amount);
  };
}

export { APIService };
