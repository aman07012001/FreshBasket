import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
  }),
}));

import Signup from '../../../Components/Authantication/Signup/Signup.jsx';

describe('Signup page', () => {
  it('renders required fields', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'OtherPass1');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
