import { ImageResponse } from "next/og"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 260,
          fontWeight: 700,
          background: "#ec4899",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        A
      </div>
    ),
    { width: 512, height: 512 }
  )
}
