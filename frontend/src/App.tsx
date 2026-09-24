import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { Toaster } from '@/components/shared/Toaster';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
