import { createEffect, on, onCleanup, onMount } from 'solid-js'
import { MapsMetrics } from '../Support/MapsMetrics'

const PageVertexSource = `
precision highp float;
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform vec2 u_cylinderPosition;
uniform vec2 u_cylinderDirection;
uniform float u_cylinderRadius;
uniform vec2 u_viewport;
varying vec2 v_texCoord;
varying float v_shade;
varying float v_fold;
const float Turn = 3.141592653589793;
void main() {
  vec2 axis = vec2(u_cylinderDirection.y, -u_cylinderDirection.x);
  float reach = dot(a_position - u_cylinderPosition, axis);
  float sweep = reach / u_cylinderRadius;
  vec2 seat = a_position - axis * reach;
  vec3 placed;
  if (reach <= 0.0) {
    placed = vec3(a_position, 0.0);
    v_shade = 1.0;
    v_fold = 0.0;
  } else if (reach <= Turn * u_cylinderRadius) {
    placed = vec3(seat + axis * u_cylinderRadius * sin(sweep), u_cylinderRadius * (1.0 - cos(sweep)));
    v_shade = cos(sweep);
    v_fold = clamp(sin(sweep), 0.0, 1.0);
  } else {
    placed = vec3(a_position - axis * (2.0 * reach - Turn * u_cylinderRadius), 2.0 * u_cylinderRadius);
    v_shade = -1.0;
    v_fold = 0.0;
  }
  float depth = -placed.z / (2.0 * u_cylinderRadius + 1.0) * 0.9;
  gl_Position = vec4(
    placed.x / u_viewport.x * 2.0 - 1.0,
    1.0 - placed.y / u_viewport.y * 2.0,
    depth,
    1.0
  );
  v_texCoord = a_texCoord;
}
`

const PageFragmentSource = `
precision mediump float;
uniform sampler2D s_page;
uniform vec3 u_paper;
uniform float u_coverNear;
uniform float u_coverFar;
uniform float u_facingBand;
varying vec2 v_texCoord;
varying float v_shade;
varying float v_fold;
void main() {
  vec4 ink = texture2D(s_page, v_texCoord);
  float cover = mix(u_coverNear, u_coverFar, v_fold);
  vec3 reverse = mix(ink.rgb, u_paper, cover);
  float facing = smoothstep(-u_facingBand, u_facingBand, v_shade);
  gl_FragColor = vec4(mix(reverse, ink.rgb, facing), 1.0);
}
`

const ShadowVertexSource = `
precision highp float;
attribute vec2 a_position;
uniform vec2 u_viewport;
varying vec2 v_position;
void main() {
  v_position = a_position;
  gl_Position = vec4(
    a_position.x / u_viewport.x * 2.0 - 1.0,
    1.0 - a_position.y / u_viewport.y * 2.0,
    0.999,
    1.0
  );
}
`

const ShadowFragmentSource = `
precision mediump float;
uniform vec2 u_cylinderPosition;
uniform vec2 u_cylinderDirection;
uniform float u_cylinderRadius;
uniform float u_shadowDepth;
uniform float u_shadowNear;
uniform float u_shadowFar;
varying vec2 v_position;
void main() {
  vec2 axis = vec2(u_cylinderDirection.y, -u_cylinderDirection.x);
  float reach = dot(v_position - u_cylinderPosition, axis);
  float fade = smoothstep(u_shadowNear, u_shadowFar, reach / (2.0 * u_cylinderRadius));
  gl_FragColor = vec4(0.0, 0.0, 0.0, u_shadowDepth - u_shadowDepth * fade);
}
`

const compile = (gl: WebGLRenderingContext, kind: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(kind)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

const link = (
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null => {
  const program = gl.createProgram()
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!program || !vertex || !fragment) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  return program
}

const buildMesh = (width: number, height: number) => {
  const grid = MapsMetrics.curlResolution
  const positions: number[] = []
  const coords: number[] = []
  const indices: number[] = []
  for (let row = 0; row <= grid; row += 1) {
    for (let column = 0; column <= grid; column += 1) {
      const u = column / grid
      const v = row / grid
      positions.push(u * width, v * height)
      coords.push(u, v)
    }
  }
  const stride = grid + 1
  for (let row = 0; row < grid; row += 1) {
    for (let column = 0; column < grid; column += 1) {
      const a = row * stride + column
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return {
    positions: new Float32Array(positions),
    coords: new Float32Array(coords),
    indices: new Uint32Array(indices)
  }
}

const easeInOut = (t: number): number => 0.5 * (1 - Math.cos(t * Math.PI))

export const MKCurlView = (props: {
  width: number
  height: number
  source: HTMLCanvasElement
  curled: boolean
  onSettled: (curled: boolean) => void
}) => {
  let canvas!: HTMLCanvasElement
  let frame = 0

  onMount(() => {
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: true })
    if (!gl) return

    const pageProgram = link(gl, PageVertexSource, PageFragmentSource)
    const shadowProgram = link(gl, ShadowVertexSource, ShadowFragmentSource)
    if (!pageProgram || !shadowProgram) return

    const wide = gl.getExtension('OES_element_index_uint')
    const mesh = buildMesh(props.width, props.height)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW)

    const coordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, mesh.coords, gl.STATIC_DRAW)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      wide ? mesh.indices : new Uint16Array(mesh.indices),
      gl.STATIC_DRAW
    )

    const shadowBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, shadowBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0,
        props.width, 0,
        0, props.height,
        props.width, 0,
        props.width, props.height,
        0, props.height
      ]),
      gl.STATIC_DRAW
    )

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, props.source)

    const pageUniforms = {
      position: gl.getUniformLocation(pageProgram, 'u_cylinderPosition'),
      direction: gl.getUniformLocation(pageProgram, 'u_cylinderDirection'),
      radius: gl.getUniformLocation(pageProgram, 'u_cylinderRadius'),
      viewport: gl.getUniformLocation(pageProgram, 'u_viewport'),
      paper: gl.getUniformLocation(pageProgram, 'u_paper'),
      coverNear: gl.getUniformLocation(pageProgram, 'u_coverNear'),
      coverFar: gl.getUniformLocation(pageProgram, 'u_coverFar'),
      facingBand: gl.getUniformLocation(pageProgram, 'u_facingBand'),
      page: gl.getUniformLocation(pageProgram, 's_page')
    }
    const shadowUniforms = {
      position: gl.getUniformLocation(shadowProgram, 'u_cylinderPosition'),
      direction: gl.getUniformLocation(shadowProgram, 'u_cylinderDirection'),
      radius: gl.getUniformLocation(shadowProgram, 'u_cylinderRadius'),
      viewport: gl.getUniformLocation(shadowProgram, 'u_viewport'),
      depth: gl.getUniformLocation(shadowProgram, 'u_shadowDepth'),
      near: gl.getUniformLocation(shadowProgram, 'u_shadowNear'),
      far: gl.getUniformLocation(shadowProgram, 'u_shadowFar')
    }

    const start = {
      x: props.width,
      y: props.height / 2,
      angle: MapsMetrics.curlStartAngle,
      radius: MapsMetrics.curlStartRadius
    }
    const target = {
      x: props.width - MapsMetrics.curlEdgeInset,
      y: props.height / MapsMetrics.curlTopDivisor,
      angle: MapsMetrics.curlAngle,
      radius: MapsMetrics.curlRadius
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.viewport(0, 0, canvas.width, canvas.height)

    const paint = (amount: number) => {
      const cx = start.x + (target.x - start.x) * amount
      const cy = start.y + (target.y - start.y) * amount
      const angle = start.angle + (target.angle - start.angle) * amount
      const radius = start.radius + (target.radius - start.radius) * amount
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.disable(gl.DEPTH_TEST)
      gl.useProgram(shadowProgram)
      gl.uniform2f(shadowUniforms.position, cx, cy)
      gl.uniform2f(shadowUniforms.direction, dx, dy)
      gl.uniform1f(shadowUniforms.radius, radius)
      gl.uniform2f(shadowUniforms.viewport, props.width, props.height)
      gl.uniform1f(shadowUniforms.depth, MapsMetrics.curlShadowDepth)
      gl.uniform1f(shadowUniforms.near, MapsMetrics.curlShadowNear)
      gl.uniform1f(shadowUniforms.far, MapsMetrics.curlShadowFar)
      gl.bindBuffer(gl.ARRAY_BUFFER, shadowBuffer)
      const shadowSlot = gl.getAttribLocation(shadowProgram, 'a_position')
      gl.enableVertexAttribArray(shadowSlot)
      gl.vertexAttribPointer(shadowSlot, 2, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.useProgram(pageProgram)
      gl.uniform2f(pageUniforms.position, cx, cy)
      gl.uniform2f(pageUniforms.direction, dx, dy)
      gl.uniform1f(pageUniforms.radius, radius)
      gl.uniform2f(pageUniforms.viewport, props.width, props.height)
      gl.uniform3f(
        pageUniforms.paper,
        MapsMetrics.curlPaper[0],
        MapsMetrics.curlPaper[1],
        MapsMetrics.curlPaper[2]
      )
      gl.uniform1f(pageUniforms.coverNear, MapsMetrics.curlCoverNear)
      gl.uniform1f(pageUniforms.coverFar, MapsMetrics.curlCoverFar)
      gl.uniform1f(pageUniforms.facingBand, MapsMetrics.curlFacingBand)
      gl.uniform1i(pageUniforms.page, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      const pageSlot = gl.getAttribLocation(pageProgram, 'a_position')
      gl.enableVertexAttribArray(pageSlot)
      gl.vertexAttribPointer(pageSlot, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer)
      const coordSlot = gl.getAttribLocation(pageProgram, 'a_texCoord')
      gl.enableVertexAttribArray(coordSlot)
      gl.vertexAttribPointer(coordSlot, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.drawElements(
        gl.TRIANGLES,
        mesh.indices.length,
        wide ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
        0
      )
    }

    let progress = props.curled ? 1 : 0
    let began = 0
    let from = progress
    let to = progress

    const step = (now: number) => {
      frame = 0
      if (began === 0) began = now
      const share = Math.min((now - began) / MapsMetrics.curlMilliseconds, 1)
      progress = from + (to - from) * easeInOut(share)
      paint(progress)
      if (share < 1) {
        frame = requestAnimationFrame(step)
        return
      }
      props.onSettled(to === 1)
    }

    const run = (destination: number) => {
      if (frame !== 0) cancelAnimationFrame(frame)
      from = progress
      to = destination
      began = 0
      frame = requestAnimationFrame(step)
    }

    paint(progress)

    createEffect(
      on(
        () => props.curled,
        (curled) => run(curled ? 1 : 0),
        { defer: true }
      )
    )

    run(props.curled ? 1 : 0)

    onCleanup(() => {
      if (frame !== 0) cancelAnimationFrame(frame)
      gl.deleteTexture(texture)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(coordBuffer)
      gl.deleteBuffer(indexBuffer)
      gl.deleteBuffer(shadowBuffer)
      gl.deleteProgram(pageProgram)
      gl.deleteProgram(shadowProgram)
    })
  })

  return (
    <canvas
      ref={canvas}
      width={Math.round(props.width * Math.min(window.devicePixelRatio, 2))}
      height={Math.round(props.height * Math.min(window.devicePixelRatio, 2))}
      class="pointer-events-none absolute left-0 top-0"
      style={{ width: `${props.width}px`, height: `${props.height}px` }}
    />
  )
}
