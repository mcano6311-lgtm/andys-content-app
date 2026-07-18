import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Andrea — Agenda de contenido",
    short_name: "Andrea",
    description: "Calendario, ideas e inspiracion para el contenido de Andrea",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6ec",
    theme_color: "#fdf6ec",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
