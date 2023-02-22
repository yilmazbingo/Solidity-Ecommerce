import { useWalletInfo } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button } from "@components/ui/common";

export default function WalletBar() {
  const { requireInstall } = useWeb3();
  const { account, network } = useWalletInfo();

  return (
    <section className="text-white  rounded-lg bg-pink-900 mt-2">
      <div className="p-8">
        <h1 className="text-base xs:text-xl break-words">
          Hello, {account.data}
        </h1>
        <h2 className="subtitle mb-5  text-xm xs:text-base">
          I hope you are having a great day!
        </h2>
        <div className="flex justify-between items-center">
          <div className="sm:flex sm:justify-center lg:justify-start">
            {/* <Button className="mr-2 text-sm xs:text-lg " variant="white">
              Learn how to purchase
            </Button> */}
          </div>
          <div>
            {network.hasInitialResponse && !network.isSupported && (
              <div className="bg-yellow-400 p-4 rounded-lg">
                <div className=" font-bold text-red-900 text-center ">
                  Connected to wrong network!!!
                </div>
                <div className="text-black">
                  Connect to: {` `}
                  <strong className="text-2xl">{network.target}</strong>
                </div>
              </div>
            )}
            {requireInstall && (
              <div className="bg-yellow-500 p-4 rounded-lg">
                Cannot connect to network. Please install Metamask.
              </div>
            )}
            {network.data && (
              <div>
                <span className="text-black">Currently on </span>
                <strong className="text-2xl">{network.data}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
