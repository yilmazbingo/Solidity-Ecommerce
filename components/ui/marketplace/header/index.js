import { useAccount } from "@components/hooks/web3";
import { Breadcrumbs } from "@components/ui/common";
import { EthRates, WalletBar } from "@components/ui/web3";

const LINKS = [
  {
    href: "/marketplace",
    value: "Buy",
  },
  {
    href: "/marketplace/books/owned",
    value: "My Books",
  },
  {
    href: "/marketplace/books/manage",
    value: "Manage Books",
    requireAdmin: true,
  },
];

export default function Header() {
  const { account } = useAccount();
  return (
    <>
      <div>
        <WalletBar className="pt-4" />
      </div>

      <EthRates />
      <div className="flex flex-row-reverse p-4   sm:px-6 lg:px-8">
        <Breadcrumbs isAdmin={account.isAdmin} items={LINKS} />
      </div>
    </>
  );
}
