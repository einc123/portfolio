import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.title}`,
    short_name: "Euan MBCS",
    description:
      "Freelance web designer and developer in Dunfermline — portfolio by Euan Livingstone MBCS.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f5",
    theme_color: "#0f5c4c",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
