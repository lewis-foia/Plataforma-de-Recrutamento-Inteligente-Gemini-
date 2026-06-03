import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        expand
        visibleToasts={3}
        duration={4000}
        closeButton
        toastOptions={{
          style: {
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App