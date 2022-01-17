import { useHooks } from "@components/providers/web3";
import { useEffect } from "react";
import { useWeb3 } from "@components/providers";
import { useRouter } from "next/router";
import { _isEmpty } from "@utils/isDataEmpty";

const enhanceHook = (swrRes) => {
  const { data, error } = swrRes;
  // !!null=false but !![]=true,!![]=false
  const hasInitialResponse = !!(data || error);
  const isEmpty = hasInitialResponse && _isEmpty(data);

  return {
    ...swrRes,
    hasInitialResponse,
    isEmpty,
  };
};

export const useNetwork = () => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useNetwork)());
  return {
    network: swrRes,
  };
};

export const useManagedBooks = (...args) => {
  const swrRes = enhanceHook(
    useHooks((hooks) => hooks.useManagedBooks)(...args)
  );

  return {
    managedBooks: swrRes,
  };
};

export const useAccount = () => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useAccount)());
  return {
    account: swrRes,
  };
};

export const useAdmin = ({ redirectTo }) => {
  const { account } = useAccount();
  const { requireInstall } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (
      requireInstall ||
      (account.hasInitialResponse && !account.isAdmin) ||
      account.isEmpty
    ) {
      router.push(redirectTo);
    }
  }, [account, redirectTo, requireInstall]);

  return { account };
};

export const useOwnedBooks = (...args) => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useOwnedBooks(...args)));

  return {
    ownedBooks: swrRes,
  };
};

export const useOwnedBook = (...args) => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useOwnedBook)(...args));

  return {
    ownedBook: swrRes,
  };
};

export const useWalletInfo = () => {
  const { account } = useAccount();
  const { network } = useNetwork();

  const isConnecting =
    !account.hasInitialResponse && !network.hasInitialResponse;

  return {
    account,
    network,
    isConnecting,
    hasConnectedWallet: !!(account.data && network.isSupported),
  };
};
