interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly DEV_ONLY_MODE?: string
  readonly VITE_GAMECENTER_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
