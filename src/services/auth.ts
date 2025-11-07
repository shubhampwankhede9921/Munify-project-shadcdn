import { apiService } from "./api"

const LOGIN_PK_BASE64 = import.meta.env.VITE_LOGIN_PK as string | undefined

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (!base64) throw new Error("Missing VITE_LOGIN_PK public key")
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i)
  return bytes.buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export type LoginCredentials = {
  username: string
  password: string
  macaddress?: string | null
  imeiNumber?: string | null
}

export async function getToken(credentials: LoginCredentials): Promise<any> {
  const keyBase64 = LOGIN_PK_BASE64
  if (!keyBase64) throw new Error("Login is not configured. Missing VITE_LOGIN_PK.")

  const encoded = new TextEncoder().encode(JSON.stringify({
    username: credentials.username,
    password: credentials.password,
    macaddress: credentials.macaddress ?? null,
    imeiNumber: credentials.imeiNumber ?? null
  }))

  const keyBuffer = base64ToArrayBuffer(keyBase64)
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )

  const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encoded)
  const loginData = arrayBufferToBase64(encrypted)

  // Send to backend; backend should forward/decrypt as needed
  return await apiService.post("/auth/login", {
    loginData,
    skip_relogin: "yes",
    userName: credentials.username,
  })
}


