import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Auth0ProviderWrapper } from './providers/Auth0Provider';
import { SDKProvider } from './providers/SDKProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { AskQuestion } from './pages/AskQuestion';
import { QuestionDetail } from './pages/QuestionDetail';
import { Profile } from './pages/Profile';
import { AuthCallback } from './pages/AuthCallback';
import { About } from './pages/About';
import { Docs } from './pages/Docs';
import { SearchResults } from './pages/SearchResults';

function App() {
  return (
    <Auth0ProviderWrapper>
      <SDKProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/ask"
              element={
                <ProtectedRoute>
                  <AskQuestion />
                </ProtectedRoute>
              }
            />
            <Route path="/q/:id" element={<QuestionDetail />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </BrowserRouter>
      </SDKProvider>
    </Auth0ProviderWrapper>
  );
}

export default App;
