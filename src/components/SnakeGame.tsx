"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Position {
  x: number;
  y: number;
}

const BOARD_SIZE = 162;
const INITIAL_SNAKE = [{ x: 81, y: 81 }];
const INITIAL_FOOD = { x: 128, y: 128 };;
const GAME_SPEED = 120;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setIsPaused(false);
  };

  const startGame = () => {
    setGameStarted(true);
    setIsPaused(false);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || isPaused) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 20);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, isPaused, generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setDirection(prev => prev.y !== 1 ? { x: 0, y: -1 } : prev);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setDirection(prev => prev.y !== -1 ? { x: 0, y: 1 } : prev);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setDirection(prev => prev.x !== 1 ? { x: -1, y: 0 } : prev);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setDirection(prev => prev.x !== -1 ? { x: 1, y: 0 } : prev);
        break;
      case ' ':
        e.preventDefault();
        pauseGame();
        break;
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  const renderGameBoard = () => {
    return (
      <div className="relative w-full h-full">
        {/* Snake segments */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`snake-${index}`}
              className={`absolute transition-all duration-100 ease-out ${
                isHead 
                  ? 'w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg border-2 border-cyan-300 z-20 shadow-cyan-500/50' 
                  : 'w-4 h-4 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-md shadow-md border border-cyan-500/50 z-10 shadow-blue-500/30'
              }`}
              style={{
                left: `${(segment.x * 100) / BOARD_SIZE}%`,
                top: `${(segment.y * 100) / BOARD_SIZE}%`,
                transform: isHead ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          );
        })}
        
        {/* Food */}
        <div
          className="absolute w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full shadow-lg border-2 border-pink-300 animate-pulse z-15 shadow-pink-500/50"
          style={{
            left: `${(food.x * 100) / BOARD_SIZE}%`,
            top: `${(food.y * 100) / BOARD_SIZE}%`,
            transform: 'scale(1.2)',
          }}
        >
          <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-6000"></div>
        </div>
      </div>

      <Card className="relative w-full max-w-3xl shadow-2xl border-0 bg-black/40 backdrop-blur-xl border border-cyan-500/30">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-lg">
            🐍 Snake Game
          </CardTitle>
          <div className="flex justify-between items-center mt-6">
            <div className="text-3xl font-bold text-white">
              Score: <span className="text-cyan-400 drop-shadow-lg">{score}</span>
            </div>
            <div className="flex gap-3">
              {!gameStarted ? (
                <Button 
                  onClick={startGame} 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 shadow-cyan-500/50"
                >
                  🚀 Start Game
                </Button>
              ) : (
                <Button 
                  onClick={pauseGame} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 shadow-purple-500/50"
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </Button>
              )}
              <Button 
                onClick={resetGame} 
                className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 shadow-gray-500/50"
              >
                🔄 Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center">
          <div 
            className="relative w-full max-w-lg h-96 bg-gradient-to-br from-gray-900/80 to-black/90 rounded-2xl shadow-2xl border border-cyan-500/20 backdrop-blur-sm overflow-hidden"
            style={{ aspectRatio: '1' }}
          >
            {/* Game board background with subtle pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(0,255,255,0.1) 1px, transparent 1px),
                  radial-gradient(circle at 75% 75%, rgba(139,92,246,0.1) 1px, transparent 1px),
                  radial-gradient(circle at 50% 50%, rgba(236,72,153,0.05) 1px, transparent 1px)
                `,
                backgroundSize: `${100/BOARD_SIZE}% ${100/BOARD_SIZE}%`
              }}></div>
            </div>
            
            {renderGameBoard()}
            
            {/* Glow effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none"></div>
          </div>

          {gameOver && (
            <div className="mt-8 text-center">
              <div className="text-4xl font-bold text-pink-400 mb-4 animate-bounce drop-shadow-lg">
                💀 Game Over!
              </div>
              <div className="text-xl text-white/80 mb-6">
                Final Score: <span className="font-bold text-cyan-400 text-2xl">{score}</span>
              </div>
              <Button 
                onClick={resetGame} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 shadow-purple-500/50"
              >
                🎮 Play Again
              </Button>
            </div>
          )}

          {isPaused && gameStarted && !gameOver && (
            <div className="mt-8 text-center">
              <div className="text-3xl font-bold text-yellow-400 animate-pulse drop-shadow-lg">
                ⏸️ Game Paused
              </div>
              <div className="text-white/60 mt-3">
                Press Space or click Resume to continue
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-white/60 space-y-2">
            <div className="text-lg">🎮 Use arrow keys to control the snake</div>
            <div>⏯️ Press Space to pause/resume</div>
            <div>🍎 Eat pink food to grow and increase your score!</div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SnakeGame;
