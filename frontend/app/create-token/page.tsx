"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import {
  useWriteTokenFactoryCreateToken,
  useReadTokenFactory,
} from "../../src/generated";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useChainId,
} from "wagmi";
import { LoadingSpinner } from "@/components/ui/spinner";
import TokenCreatedCard from "@/components/TokenCreatedCard";

const formSchema = z.object({
  name: z.string().min(1, { message: "Token Name is required" }),
  ticker: z.string().min(3, { message: "Token Ticker is required" }),
  description: z.string().min(1, { message: "Token Description is required" }),
  image: z.any(),
});

export default function CreateTokenPage() {
  const chainId = useChainId();
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    data: hash,
    isPending,
    writeContract,
  } = useWriteTokenFactoryCreateToken();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const uploadFile = async () => {
    setUploading(true);
    try {
      if (!imageFile) {
        alert("No file selected");
        return;
      }

      const data = new FormData();
      data.set("image", imageFile);
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const ipfsUrl = await uploadRequest.json();
      return ipfsUrl;
    } catch (e) {
      console.log(e);
      alert("Trouble uploading file");
    }
    setUploading(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (imageFile) {
        const ipfsUrl = await uploadFile();
        if (ipfsUrl) {
          await writeContract({
            args: [values.name, values.ticker, values.description, ipfsUrl],
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Card className="max-w-sm mx-auto p-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col justify-evenly min-h-[300px] gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Token Name</FormLabel> */}
                  <FormControl>
                    <Input placeholder="Enter token name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter token ticker" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter token description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      required
                      type="file"
                      {...field}
                      onChange={(event) => {
                        setImageFile(event.target.files?.[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imageFile ? (
              <Image
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : "/images/placeholder.png"
                }
                alt="Token Image"
                width={100}
                height={100}
                className="rounded-md"
              />
            ) : null}
            <Button
              disabled={uploading}
              className="w-full"
              variant="default"
              type="submit"
            >
              {uploading
                ? "Uploading..."
                : loading
                  ? "Processing..."
                  : "Submit"}
            </Button>
          </form>
        </Form>
      </Card>
      {isConfirmed ? <TokenCreatedCard /> : null}
    </>
  );
}
