import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { ProtectedRoute } from '../../components/ProtectedRoute';

const loginSpy = vi.fn();
type MockAuth = { isAuthenticated: boolean; isLoading: boolean; loginWithRedirect: typeof loginSpy };
const mockAuthState: MockAuth = { isAuthenticated: false, isLoading: false, loginWithRedirect: loginSpy };
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuthState,
}));

const Child = () => <div data-testid="protected-child">Secret</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    Object.assign(mockAuthState, { isAuthenticated: false, isLoading: false });
    loginSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders spinner when loading', async () => {
  Object.assign(mockAuthState, { isLoading: true });
    const { unmount } = render(
      <ProtectedRoute>
        <Child />
      </ProtectedRoute>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();
  });

  it('does not render children when not authenticated', async () => {
    render(
      <ProtectedRoute>
        <Child />
      </ProtectedRoute>
    );
    expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
    await waitFor(() => expect(loginSpy).toHaveBeenCalled());
  });
});
