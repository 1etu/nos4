import { onCleanup, onMount, type JSX } from 'solid-js'
import { gsAttachScroller } from 'GraphicsServices'

export const UIScrollView = (props: {
  class?: string
  style?: JSX.CSSProperties
  children: JSX.Element
}) => {
  let host!: HTMLDivElement

  onMount(() => {
    const scroller = gsAttachScroller(host)
    onCleanup(scroller.detach)
  })

  return (
    <div ref={host} class={`gs-scroll-view ${props.class ?? ''}`} style={props.style}>
      {props.children}
    </div>
  )
}
