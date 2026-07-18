"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Square, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

type RecorderState = "idle" | "recording" | "preview"

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function VoiceRecorder({
  onSave,
}: {
  onSave: (dataUrl: string, durationSeconds: number) => void
}) {
  const { t } = useTranslations()
  const [state, setState] = useState<RecorderState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        const url = URL.createObjectURL(blob)
        const dataUrl = await blobToDataUrl(blob)
        setPreviewUrl(url)
        setPreviewDataUrl(dataUrl)
        setState("preview")
        streamRef.current?.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      startedAtRef.current = Date.now()
      setElapsed(0)
      setState("recording")
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
      }, 250)
    } catch {
      setError(t("recorder.error"))
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function discard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewDataUrl(null)
    setElapsed(0)
    setState("idle")
  }

  function save() {
    if (!previewDataUrl) return
    onSave(previewDataUrl, elapsed)
    discard()
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const ss = String(elapsed % 60).padStart(2, "0")

  if (state === "preview" && previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <audio src={previewUrl} controls className="w-full" />
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={discard}>
            <Trash2 /> {t("recorder.rerecord")}
          </Button>
          <Button className="flex-1" onClick={save}>
            {t("recorder.save")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <button
        type="button"
        onClick={state === "recording" ? stopRecording : startRecording}
        className={
          "flex size-20 items-center justify-center rounded-full text-white shadow-lg transition-colors " +
          (state === "recording"
            ? "bg-red-600 animate-pulse"
            : "bg-primary")
        }
        aria-label={state === "recording" ? t("recorder.stopLabel") : t("recorder.startLabel")}
      >
        {state === "recording" ? <Square className="size-7" /> : <Mic className="size-8" />}
      </button>
      <p className="font-mono text-lg tabular-nums text-muted-foreground">
        {mm}:{ss}
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {state === "recording" ? t("recorder.recording") : t("recorder.idle")}
      </p>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
