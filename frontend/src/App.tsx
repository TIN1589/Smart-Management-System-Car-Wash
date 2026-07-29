import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from '@/app/store'
import { AppRouter } from '@/app/router'
import './App.css'

export default function App() {
  return (
    <Provider store={store}>
      <AppRouter />
      <Toaster position="top-right" reverseOrder={false} />
    </Provider>
  )
}
