"use client"

import { useActionState } from "react"
import Image from "next/image"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: { error?: string } = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Image
            src="/icon.png"
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-2xl"
          />
          <h1 className="text-lg font-semibold">Andrea</h1>
          <p className="text-sm text-muted-foreground">
            Agenda de contenido — acceso privado
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
