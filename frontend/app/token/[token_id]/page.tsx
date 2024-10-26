"use client";
import { useParams } from "next/navigation";
import { useReadTokenFactoryTokenInfo } from "@/src/generated";
import { LoadingSpinner } from "@/components/ui/spinner";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function TokenPage() {
  const { token_id } = useParams();
  const { data, error, isLoading } = useReadTokenFactoryTokenInfo({
    args: [token_id],
  });

  console.log(data);

  if (isLoading) {
    return (
      <div className="flex flex-row w-full justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col md:flex-row">
      <AspectRatio ratio={1 / 1}>
        <Image
          src={data[3]}
          alt={`${data[0]}`}
          fill
          className="h-full w-full rounded-md object-cover"
        />
      </AspectRatio>
      <div>
        <h1>
          {data[0]} ({data[1]})
        </h1>
        <p>{data[2]}</p>
        <p>Contract Address: {data[5]}</p>
      </div>
    </div>
  );
}
