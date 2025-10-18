import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VoteWidget } from '@openask/ui';

describe('VoteWidget', () => {
  it('calls onVote and updates count on upvote', async () => {
    const onVote = vi.fn().mockResolvedValue({ voteCount: 6 });
    render(<VoteWidget voteCount={5} onVote={onVote} />);

  fireEvent.click(screen.getByLabelText('Upvote'));

    await waitFor(() => expect(onVote).toHaveBeenCalledWith(1));
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('calls onVote and updates count on downvote', async () => {
    const onVote = vi.fn().mockResolvedValue({ voteCount: 4 });
    render(<VoteWidget voteCount={5} onVote={onVote} />);

  fireEvent.click(screen.getByLabelText('Downvote'));

    await waitFor(() => expect(onVote).toHaveBeenCalledWith(-1));
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
