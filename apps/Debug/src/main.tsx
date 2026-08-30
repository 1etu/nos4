import { render } from 'solid-js/web'
import './styles.css'
import { DebugPage } from './DebugPage'

const root = document.getElementById('root')
if (!root) throw new Error('missing root element')

render(() => <DebugPage />, root)
