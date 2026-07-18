import { ImageResponse } from "next/og"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
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
    { width: 192, height: 192 }
  )
}
