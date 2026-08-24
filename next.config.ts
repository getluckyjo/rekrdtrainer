import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There's a stray lockfile in the home directory; pin the root so Turbopack
  // doesn't infer its way out of this project.
  turbopack: { root: __dirname },

  /**
   * The programme was renamed from Coaches to Ambassadors after six people had
   * already been sent their welcome email, each containing a
   * /coaches/welcome/CODE link to their QR and print card. These redirects are
   * what keep those links — and any card already printed from them — alive.
   *
   * Permanent, because the old paths are never coming back.
   */
  async redirects() {
    return [
      { source: "/coaches", destination: "/ambassadors", permanent: true },
      {
        source: "/coaches/:path*",
        destination: "/ambassadors/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
