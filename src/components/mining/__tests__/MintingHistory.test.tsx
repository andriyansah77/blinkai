/**
 * Unit tests for MintingHistory component
 * Tests Requirements 6.6, 11.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MintingHistory } from '../MintingHistory';

// Mock fetch
global.fetch = vi.fn();

const mockInscriptionsResponse = {
  success: true,
  inscriptions: [
    {
      id: '1',
      type: 'auto',
      status: 'confirmed',
      inscriptionFee: 0.5,
      gasFee: 0.05,
      tokensEarned: 10000,
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      createdAt: '2024-01-15T10:30:00Z',
      confirmedAt: '2024-01-15T10:35:00Z',
      errorMessage: null,
    },
    {
      id: '2',
      type: 'manual',
      status: 'pending',
      inscriptionFee: 1.0,
      gasFee: 0.05,
      tokensEarned: 10000,
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      createdAt: '2024-01-15T11:00:00Z',
      confirmedAt: null,
      errorMessage: null,
    },
    {
      id: '3',
      type: 'auto',
      status: 'failed',
      inscriptionFee: 0.5,
      gasFee: 0,
      tokensEarned: 0,
      txHash: null,
      createdAt: '2024-01-15T09:00:00Z',
      confirmedAt: null,
      errorMessage: 'Insufficient balance',
    },
  ],
  pagination: {
    total: 3,
    limit: 10,
    offset: 0,
    hasMore: false,
  },
  stats: {
    totalInscriptions: 3,
    totalTokensEarned: '20000',
    totalFeesPaid: '2.1',
  },
};

describe('MintingHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    render(<MintingHistory />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display minting records with all required columns', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Minting History')).toBeInTheDocument();
    });

    // Verify table headers
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Fee')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Tx Hash')).toBeInTheDocument();

    // Verify record data is displayed
    expect(screen.getByText('10,000 REAGENT')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should display transaction hash as clickable link to Tempo Explorer', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      const txLink = screen.getByRole('link', { name: /0x1234...cdef/i });
      expect(txLink).toHaveAttribute(
        'href',
        'https://explore.tempo.xyz/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      expect(txLink).toHaveAttribute('target', '_blank');
      expect(txLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should filter records by status', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockInscriptionsResponse,
        inscriptions: [mockInscriptionsResponse.inscriptions[0]],
        pagination: { ...mockInscriptionsResponse.pagination, total: 1 },
      }),
    });

    render(<MintingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Minting History')).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'confirmed' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=confirmed')
      );
    });
  });

  it('should display empty state when no records exist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        inscriptions: [],
        pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
        stats: { totalInscriptions: 0, totalTokensEarned: '0', totalFeesPaid: '0' },
      }),
    });

    render(<MintingHistory />);

    await waitFor(() => {
      expect(screen.getByText('No minting records found')).toBeInTheDocument();
      expect(screen.getByText('Start minting to see your history here')).toBeInTheDocument();
    });
  });

  it('should format dates in user-friendly format', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      // Check that date is formatted (exact format depends on locale)
      const dateElements = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('should format amounts with proper decimal formatting', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      // Check fee formatting (2 decimals minimum)
      expect(screen.getByText('$0.50')).toBeInTheDocument();
      expect(screen.getByText('$1.00')).toBeInTheDocument();
      
      // Check gas formatting
      expect(screen.getByText('$0.05')).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    const paginatedResponse = {
      ...mockInscriptionsResponse,
      pagination: {
        total: 25,
        limit: 10,
        offset: 0,
        hasMore: true,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    // Test next page button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();

    // Test previous page button (should be disabled on first page)
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should display status badges with correct styling', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      const confirmedBadge = screen.getByText('Confirmed');
      expect(confirmedBadge).toHaveClass('text-green-400');

      const pendingBadge = screen.getByText('Pending');
      expect(pendingBadge).toHaveClass('text-yellow-400');

      const failedBadge = screen.getByText('Failed');
      expect(failedBadge).toHaveClass('text-red-400');
    });
  });

  it('should display type badges correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInscriptionsResponse,
    });

    render(<MintingHistory />);

    await waitFor(() => {
      const autoBadge = screen.getByText('Auto');
      expect(autoBadge).toHaveClass('text-purple-400');

      const manualBadge = screen.getByText('Manual');
      expect(manualBadge).toHaveClass('text-orange-400');
    });
  });
});
