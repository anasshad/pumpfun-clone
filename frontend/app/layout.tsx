import "../styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Header from "../components/Header";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-center text-center min-h-screen gap-5">
        <Providers>
          <Header />
          <div className="p-5 md:p-10"> {children}</div>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
