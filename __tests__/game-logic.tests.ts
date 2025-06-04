import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { isValidMove, distributeSeeds, handleCapture, checkGameOver, getNextPlayer } from '../lib/game-logic';

describe('Game Logic Tests', () => {
    let board: number[];
    let isPlayer1Turn: boolean;

    beforeEach(() => {
        board = Array(14).fill(4);
        board[6] = 0; // Player 1's store
        board[13] = 0; // Player 2's store
        isPlayer1Turn = true;
    });

    it('should validate moves correctly', () => {
        expect(isValidMove(0, board, isPlayer1Turn)).toBe(true);
        expect(isValidMove(6, board, isPlayer1Turn)).toBe(false); // Player 1's store
        expect(isValidMove(7, board, isPlayer1Turn)).toBe(false); // Player 2's side
        expect(isValidMove(14, board, isPlayer1Turn)).toBe(false); // Out of bounds
    });

    it('should distribute seeds correctly', () => {
        const lastPit = distributeSeeds(board, 0, isPlayer1Turn);
        expect(board[0]).toBe(0);
        expect(board[lastPit]).toBeGreaterThanOrEqual(1);
    });

    it('should handle captures correctly', () => {
        board[0] = 1; // Set up for capture
        handleCapture(board, 0, isPlayer1Turn);
        expect(board[6]).toBeGreaterThanOrEqual(5); // Player 1's store should have captured seeds
        expect(board[0]).toBe(0); // Captured pit should be empty
    });

    it('should check game over conditions correctly', () => {
        board.fill(0, 0, 6); // Empty Player 1's side
        const result = checkGameOver(board);
        expect(result).toBe("player2"); // Player 2 should win
    });

    it('should determine the next player correctly', () => {
        const lastPit = distributeSeeds(board, 0, isPlayer1Turn);
        const nextPlayer = getNextPlayer(lastPit, isPlayer1Turn, 'player1');
        expect(nextPlayer).toBe('player2'); // Should switch to player 2
    });
});