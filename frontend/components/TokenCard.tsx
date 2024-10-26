import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface TokenCardProps {
  imageSrc: string;
  name: string;
  ticker: string;
  description: string;
  contract_address: string;
}

export default function TokenCard({
  imageSrc,
  name,
  ticker,
  description,
  contract_address,
}: TokenCardProps) {
  return (
    <Card className="w-full overflow-hidden flex flex-row gap-3 p-3">
      <div>
        <div className="relative h-full w-20 rounded-md overflow-hidden">
          <Image
            src={imageSrc}
            alt={`${name} logo`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
      <div>
        <CardHeader className="text-left">
          <CardTitle className="text-xl">{`${name} (${ticker})`}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="font-mono">
          Contract Address: {shortenAddress(contract_address)}
        </CardContent>
      </div>
    </Card>
  );
}
