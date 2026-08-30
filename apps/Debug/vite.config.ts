import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { frameworkAliases } from '../../vite.shared'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  assetsInclude: ['**/*.wad'],
  resolve: { alias: frameworkAliases },
  base: './',
  envDir: '../..',
  envPrefix: ['VITE_', 'DEV_ONLY_MODE'],
  publicDir: '../../assets'
})
