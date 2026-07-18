"use client"

import { useState } from "react"
import { ChevronLeft, Lightbulb, Link2, Mic, Plus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { IdeaCaptureForm } from "@/components/capture/idea-capture-form"
import { LinkCaptureForm } from "@/components/capture/link-capture-form"
import { VoiceRecorder } from "@/components/capture/voice-recorder"
import { addVoiceNote } from "@/lib/store"
import { useTranslations } from "@/lib/i18n/use-translations"

type Mode = "menu" | "idea" | "link" | "voice"

export function QuickCaptureFab() {
  const { t } = useTranslations()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("menu")

  const titles: Record<Mode, string> = {
    menu: t("capture.title"),
    idea: t("capture.ideaTitle"),
    link: t("capture.linkTitle"),
    voice: t("capture.voiceTitle"),
  }

  const descriptions: Record<Mode, string> = {
    menu: t("capture.subtitle"),
    idea: t("capture.ideaSubtitle"),
    link: t("capture.linkSubtitle"),
    voice: t("capture.voiceSubtitle"),
  }

  function close() {
    setOpen(false)
    setMode("menu")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setMode("menu")
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-1/2 z-40 flex size-14 translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform active:scale-95 sm:right-8 sm:translate-x-0"
        aria-label={t("capture.title")}
      >
        <Plus className="size-6" />
      </button>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
        <SheetHeader>
          {mode !== "menu" && (
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full hover:bg-muted"
              aria-label={t("capture.back")}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          <SheetTitle className="text-center">{titles[mode]}</SheetTitle>
          <SheetDescription className="text-center">
            {descriptions[mode]}
          </SheetDescription>
        </SheetHeader>

        {mode === "menu" && (
          <div className="flex flex-col gap-2 px-4 pb-6">
            <Button
              variant="outline"
              size="lg"
              className="h-14 justify-start gap-3 text-base"
              onClick={() => setMode("idea")}
            >
              <Lightbulb className="size-5 text-amber-500" /> {t("capture.idea")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 justify-start gap-3 text-base"
              onClick={() => setMode("link")}
            >
              <Link2 className="size-5 text-sky-500" /> {t("capture.link")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 justify-start gap-3 text-base"
              onClick={() => setMode("voice")}
            >
              <Mic className="size-5 text-red-500" /> {t("capture.voice")}
            </Button>
          </div>
        )}

        {mode === "idea" && (
          <div className="px-4 pb-6">
            <IdeaCaptureForm onSaved={close} />
          </div>
        )}

        {mode === "link" && (
          <div className="px-4 pb-6">
            <LinkCaptureForm onSaved={close} />
          </div>
        )}

        {mode === "voice" && (
          <div className="px-4 pb-6">
            <VoiceRecorder
              onSave={(dataUrl, duration) => {
                addVoiceNote({
                  audioDataUrl: dataUrl,
                  durationSeconds: duration,
                  contentItemId: null,
                  ideaId: null,
                })
                close()
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
