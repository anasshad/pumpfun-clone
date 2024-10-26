import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

function Header() {
  return (
    <div className="flex flex-col content-center justify-center gap-5">
      <h1 className="font-semibold text-xl">Pump.fun Clone</h1>
      <div className="mx-auto">
        <ConnectButton />
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-400">
        <Link href="/">Home</Link>
        <Link href="/create-token">Create Token</Link>
        <Link href="/my-tokens">My Tokens</Link>
      </div>
    </div>
  );
}

export default Header;
