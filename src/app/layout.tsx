import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Keith Rumjahn - Personal Links",
  description: "Keith Rumjahn's personal links page - A.I. content creator, educator, and n8n expert",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Umami Analytics */}
        <Script
          src="https://umami.rumjahn.synology.me/script.js"
          strategy="afterInteractive"
          defer
          data-website-id="f53cf938-91aa-4875-85d8-bd89f9c9da91"
        />
        {/* Matomo Analytics */}
        <Script id="matomo-init" strategy="afterInteractive">
          {`
            var _paq = (window._paq = window._paq || []);
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function () {
              var u = "//shrewd-lyrebird.pikapod.net/";
              _paq.push(['setTrackerUrl', u + 'matomo.php']);
              _paq.push(['setSiteId', '8']);
              var d = document,
                g = d.createElement('script'),
                s = d.getElementsByTagName('script')[0];
              g.async = true;
              g.src = u + 'matomo.js';
              s.parentNode!.insertBefore(g, s);
            })();
          `}
        </Script>
      </head>
      <body
        className={`${poppins.variable} antialiased min-h-screen bg-gray-50 font-sans`}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* <MainNav /> */}
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
