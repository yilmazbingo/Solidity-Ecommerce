import { useWeb3 } from "@components/providers";
import { ActiveLink, Button } from "@components/ui/common";
import { useAccount } from "@components/hooks/web3";
import { useRouter } from "next/router";

export default function Navbar() {
  const { connect, isLoading, requireInstall } = useWeb3();
  const { account } = useAccount();
  console.log("account", account);
  const { pathname } = useRouter();

  return (
    //  Make sure the sticky element has top or bottom set. Or in the case of horizontal scrolling, left or right.
    <section
      style={{ position: "sticky", top: 0, zIndex: 2 }}
      className=" bg-gray-300 "
    >
      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <nav className="relative" aria-label="Global">
          <div className="flex flex-col xs:flex-row justify-between items-center">
            <div>
              <ActiveLink activeLinkClass="text-red-800" href="/">
                <a className="font-medium mr-8 text-black hover:text-pink-800">
                  Home
                </a>
              </ActiveLink>
              <ActiveLink activeLinkClass="text-red-800" href="/marketplace">
                <a className="font-medium mr-8 text-black hover:text-pink-800">
                  Marketplace
                </a>
              </ActiveLink>
              {/* <ActiveLink href="/blogs">
                <a className="font-medium mr-8 text-black hover:text-pink-800">
                  Blogs
                </a>
              </ActiveLink> */}
            </div>
            <div className="text-center">
              {/* <ActiveLink href="/wishlist">
                <a className="font-medium sm:mr-8 mr-1 text-black hover:text-pink-900">
                  Wishlist
                </a>
              </ActiveLink> */}
              {isLoading ? (
                <Button disabled={true} onClick={connect}>
                  Loading...
                </Button>
              ) : account.data ? (
                <Button hoverable={false} className="cursor-default">
                  Hi there {account.isAdmin && "Admin"}
                </Button>
              ) : requireInstall ? (
                <Button
                  onClick={() =>
                    window.open("https://metamask.io/download.html", "_blank")
                  }
                >
                  Install Metamask
                </Button>
              ) : (
                <Button onClick={connect}>Connect</Button>
              )}
            </div>
          </div>
        </nav>
      </div>
      {account.data && !pathname.includes("/marketplace") && (
        <div className="flex justify-end pt-1 sm:px-6 lg:px-8">
          <div className="text-white bg-indigo-600 rounded-md p-2 mb-2">
            {account.data}
          </div>
        </div>
      )}
    </section>
  );
}
