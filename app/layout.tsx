import type { Metadata } from "next";
import { Geist, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CCAT | Collide ",
  description: "Where ideas come together.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${dmMono.variable} antialiased`}
        data-animation-ready="false"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Prevent flash of unstyled content during animations
                document.documentElement.style.setProperty('--animation-state', 'initializing');

                // Mark when page is ready for animations
                if (document.readyState === 'complete') {
                  document.body.setAttribute('data-animation-ready', 'true');
                } else {
                  document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                      document.body.setAttribute('data-animation-ready', 'true');
                    }, 50);
                  });
                }

                // Session activity tracking
                const updateActivity = () => {
                  try {
                    sessionStorage.setItem('ccat-last-activity', Date.now().toString());
                  } catch (e) {}
                };
                updateActivity();
                window.addEventListener('focus', updateActivity);
                window.addEventListener('visibilitychange', updateActivity);
              `,
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
