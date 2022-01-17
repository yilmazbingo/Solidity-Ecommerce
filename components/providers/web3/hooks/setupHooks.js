import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createOwnedBooksHook } from "./useOwnedBooks";
import { handler as createOwnedBookHook } from "./useOwnedBook";
import { handler as createManagedBooksHook } from "./useManageBooks";

export const setupHooks = ({ web3, provider, contract }) => {
  return {
    useAccount: createAccountHook(web3, provider),
    useNetwork: createNetworkHook(web3),
    useOwnedBooks: createOwnedBooksHook(web3, contract),
    useOwnedBook: createOwnedBookHook(web3, contract),
    useManagedBooks: createManagedBooksHook(web3, contract),
  };
};
