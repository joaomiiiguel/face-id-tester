import '@/styles/globals.css'
import { Provider } from 'react-redux'
import store from '@/redux/store'
import { Toaster } from 'react-hot-toast'


export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 4000,
        }}
      />
    </Provider>
  )
}
