import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Intech Computer Shop — Laptops, TVs & Electronics in Kenya" },
      { name: "description", content: "Buy genuine laptops, smart TVs, phones, printers, networking & electronics in Kenya. Free Nairobi delivery, M-Pesa payments." },
      { name: "author", content: "Intech Computer Shop" },
      { property: "og:title", content: "Intech Computer Shop — Laptops, TVs & Electronics in Kenya" },
      { property: "og:description", content: "Buy genuine laptops, smart TVs, phones, printers, networking & electronics in Kenya. Free Nairobi delivery, M-Pesa payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Intech Computer Shop — Laptops, TVs & Electronics in Kenya" },
      { name: "twitter:description", content: "Buy genuine laptops, smart TVs, phones, printers, networking & electronics in Kenya. Free Nairobi delivery, M-Pesa payments." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/676723e5-f5a6-4367-9987-feab6f279315/id-preview-75ac8dfd--ecb0be3e-3b32-4a9e-9e36-33ee2a225f65.lovable.app-1777489747793.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/676723e5-f5a6-4367-9987-feab6f279315/id-preview-75ac8dfd--ecb0be3e-3b32-4a9e-9e36-33ee2a225f65.lovable.app-1777489747793.png" },
      { name: "theme-color", content: "#ff6a1a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Intech" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
