import { Card, CardContent } from "./ui/card";
import { CheckCircle2 } from "lucide-react";

export default function Component() {
  return (
    <Card className="bg-green-100 border-green-300">
      <CardContent className="flex items-center p-4 text-green-800">
        <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
        <span className="font-medium">Token successfully created</span>
      </CardContent>
    </Card>
  );
}
