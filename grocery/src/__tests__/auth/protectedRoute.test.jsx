import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ProtectedRoute from '../../Components/ProtectedRoute/ProtectedRoute.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';

const renderWithAuth = ({ user, loading }) => {
  return render(
    <AuthContext.Provider
      value={{
        user,
        loading,
        error: '',
        login: () => Promise.resolve(),
        register: () => Promise.resolve(),
        logout: () => {},
        restoreSession: () => {},
      }}
    >
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderWithAuth({ user: null, loading: false });

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithAuth({ user: { id: '1', name: 'Test', email: 't@example.com' }, loading: false });

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});
