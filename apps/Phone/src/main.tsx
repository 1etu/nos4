import { render } from 'solid-js/web'
import './styles.css'
import { PhonePage } from './PhonePage'

const root = document.getElementById('root')
if (!root) throw new Error('howwww')

render(() => <PhonePage />, root)
