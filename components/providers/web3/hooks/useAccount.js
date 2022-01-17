import { useEffect } from "react";
import useSWR from "swr";

// get the address from ropsten network and hash it. first is ganache
const adminAddresses = {
  "0xde5c6d38492e6d19bcc924425e43e5d360d2ed814b0ef35cd18b77109b14e1ac": true,
  "0x97ae62c8d8154151174b6f8f63de2d84bdc77700b065cba10c9004219faa1378": true,
};

export const handler = (web3, provider) => () => {
  // A key — a string that serves as the unique identifier for the data we are fetching. This is usually the API URL we are calling
  // mutate revalidates
  const { data, mutate, ...rest } = useSWR(
    // first arg is the identifier
    () => (web3 ? "web3/accounts" : null),
    async () => {
      // if i m not logged in metamask, accounts[0] would be undefined. we should either return data or error in SWR
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      if (!account) {
        throw new Error(
          "Cannot retrieve an account.Please refresh the browser"
        );
      }
      return account;
    }
  );

  useEffect(() => {
    // nullish coalescing operator (??) is a logical operator that returns its right-hand side operand when its left-hand side operand is null or undefined
    // 'mutate' mutates the state that returned from useSwr
    const mutator = (accounts) => mutate(accounts[0] ?? null);
    provider?.on("accountsChanged", mutator);

    return () => {
      provider?.removeListener("accountsChanged", mutator);
    };
  }, [provider]);

  return {
    data,
    isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
    mutate,
    ...rest,
  };
};
