# Desplegar ANDYS en el VPS de Hostinger

## Antes de empezar

- El chat `/andys` y el botón "Sugerir ideas" (integración OpenClaw) se
  quitaron de la app — dependían de un binario instalado solo en la Mac
  mini, que se retira. Si algún día se quiere IA de nuevo, habría que
  correrla en otra máquina o en el propio VPS.
- Los datos viven en `localStorage` del navegador (no hay Supabase
  conectado). En el VPS, cada dispositivo/navegador tendrá su propia copia,
  no compartida.
- **Dominio: `andyscano.com`**, comprado en Vercel, $11.25 USD/año. El DNS
  se administra desde `vercel.com/dashboard` → el dominio → DNS Records
  (no desde hPanel). Ya tiene dos registros `A` apuntando a `177.7.39.60`
  (root y `www`).
- **El VPS ya corre Docker + Traefik** (plantilla de Hostinger), no Nginx
  ni pm2. Traefik ocupa los puertos 80/443 y descubre contenedores nuevos
  automáticamente por sus *labels* de Docker — así que ANDYS se despliega
  como un contenedor más, sin tocar la configuración de Traefik. Traefik
  ya está configurado con un resolver de Let's Encrypt (`letsencrypt`), así
  que el HTTPS sale gratis y automático en cuanto el contenedor esté arriba.
  También corre un contenedor de `code-server` (editor en el navegador) —
  no lo toques.

## 1. Entrar al VPS

Usa la **terminal del navegador** en hPanel → tu VPS → Terminal del
navegador (o `ssh root@177.7.39.60` desde tu Mac si prefieres).

## 2. Subir el código

Desde la Mac (no dentro del SSH del VPS):

```bash
rsync -avz --delete --exclude "node_modules" --exclude ".next" --exclude ".git" --exclude ".env" \
  /Users/miguelcano/Desktop/ANDYS/ root@177.7.39.60:/opt/andys/
```

## 3. Variables de entorno en el VPS

Crea `/opt/andys/.env` con las mismas dos variables que usas localmente
(cópialas del `.env.local` de la Mac, no las regeneres o el login/sesión
existente se invalida):

```
APP_PASSWORD=...
SESSION_SECRET=...
```

## 4. Construir y levantar el contenedor

En el VPS:

```bash
cd /opt/andys
docker compose up -d --build
```

Esto construye la imagen (usa el `Dockerfile` del repo) y arranca el
contenedor `andys` con las labels de Traefik ya puestas en
`docker-compose.yml` — Traefik lo detecta solo, no hay que reiniciarlo ni
tocar su config.

## 5. Verificar

```bash
docker ps                      # confirma que el contenedor "andys" está Up
docker logs andys --tail 50    # revisa errores si algo falla
```

Y desde el navegador: `https://andyscano.com` (puede tardar 1-2 minutos la
primera vez mientras Traefik pide el certificado a Let's Encrypt).

## Actualizar código después de un cambio

```bash
rsync -avz --delete --exclude "node_modules" --exclude ".next" --exclude ".git" --exclude ".env" \
  /Users/miguelcano/Desktop/ANDYS/ root@177.7.39.60:/opt/andys/

# en el VPS:
cd /opt/andys && docker compose up -d --build
```
