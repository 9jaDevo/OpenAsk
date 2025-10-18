import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AskQuestion } from '../AskQuestion';
import { SDKContext } from '../../providers/SDKProvider';
import type { OpenAskSDK } from '@openask/sdk';

const sdkMock = {
  createQuestion: vi.fn().mockResolvedValue({ _id: 'q1' }),
} as Partial<OpenAskSDK> as OpenAskSDK;

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() }, __esModule: true }));

describe('AskQuestion page', () => {
  it('shows validation errors for empty form and submits when valid', async () => {
    render(
      <MemoryRouter>
  <SDKContext.Provider value={{ sdk: sdkMock }}>
          <AskQuestion />
        </SDKContext.Provider>
      </MemoryRouter>
    );

    // Try submit empty
    fireEvent.click(screen.getByRole('button', { name: /post question/i }));

    expect(await screen.findAllByText(/minimum|characters|required/i)).toHaveLength(2);

  // Fill valid inputs
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'How to test React components?' } });
    fireEvent.change(screen.getByLabelText(/question body/i), { target: { value: 'I want to test a component. Any tips?' } });
  // Add a tag
  const tagInput = screen.getByPlaceholderText(/add tags/i);
  fireEvent.change(tagInput, { target: { value: 'react' } });
  fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByRole('button', { name: /post question/i }));

    await waitFor(() => expect(sdkMock.createQuestion).toHaveBeenCalled());
  });
});
