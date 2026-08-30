export interface SKTexture {
  readonly image: HTMLImageElement
  readonly frameWidth: number
  readonly frameHeight: number
  readonly frameCount: number
}

export interface SKTextureSource {
  readonly url: string
  readonly frameWidth?: number
  readonly frameHeight?: number
}

export const skLoadTexture = async (source: SKTextureSource): Promise<SKTexture> => {
  const image = new Image()
  image.src = source.url
  await image.decode()

  const frameWidth = source.frameWidth ?? image.naturalWidth
  const frameHeight = source.frameHeight ?? image.naturalHeight
  return {
    image,
    frameWidth,
    frameHeight,
    frameCount: Math.max(1, Math.floor(image.naturalWidth / frameWidth))
  }
}

export const skLoadTextures = async <K extends string>(
  sources: Readonly<Record<K, SKTextureSource>>
): Promise<Readonly<Record<K, SKTexture>>> => {
  const names = Object.keys(sources) as K[]
  const loaded = await Promise.all(names.map((name) => skLoadTexture(sources[name])))
  const textures = {} as Record<K, SKTexture>
  names.forEach((name, index) => {
    const texture = loaded[index]
    if (texture) textures[name] = texture
  })
  return textures
}
