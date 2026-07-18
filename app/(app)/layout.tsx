import { BottomNav } from "@/components/nav/bottom-nav"
import { LogoutButton } from "@/components/nav/logout-button"
import { LanguageToggle } from "@/components/nav/language-toggle"
import { QuickCaptureFab } from "@/components/capture/quick-capture-fab"
import { DemoSeed } from "@/components/demo-seed"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DemoSeed />
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
        <LanguageToggle />
        <LogoutButton />
      </div>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pt-12 pb-24">
        {children}
      </div>
      <QuickCaptureFab />
      <BottomNav />
    </>
  )
}
