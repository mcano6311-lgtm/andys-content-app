import { LogOut } from "lucide-react"
import { BottomNav } from "@/components/nav/bottom-nav"
import { QuickCaptureFab } from "@/components/capture/quick-capture-fab"
import { DemoSeed } from "@/components/demo-seed"
import { logout } from "@/app/actions/auth"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DemoSeed />
      <form action={logout} className="fixed top-3 right-3 z-40">
        <button
          type="submit"
          aria-label="Salir"
          className="flex size-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </form>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-24">
        {children}
      </div>
      <QuickCaptureFab />
      <BottomNav />
    </>
  )
}
