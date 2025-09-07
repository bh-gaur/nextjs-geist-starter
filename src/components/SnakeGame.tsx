"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Position {
  x: number;
  y: number;
}

const BOARD_SIZE = 24;
const INITIAL_SNAKE = [{ x: 12, y: 12 }];
const INITIAL_FOOD = { x: 18, y: 18 };
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
        setScore(prev => prev + 10);
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
                  ? 'w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-lg border-2 border-emerald-300 z-20' 
                  : 'w-4 h-4 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-md shadow-md border border-emerald-200 z-10'
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
          className="absolute w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg border-2 border-red-300 animate-pulse z-15"
          style={{
            left: `${(food.x * 100) / BOARD_SIZE}%`,
            top: `${(food.y * 100) / BOARD_SIZE}%`,
            transform: 'scale(1.2)',
          }}
        >
          <div className="absolute inset-0 bg-red-300 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <Card className="relative w-full max-w-3xl shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            🐍 Snake Game
          </CardTitle>
          <div className="flex justify-between items-center mt-6">
            <div className="text-3xl font-bold text-white">
              Score: <span className="text-emerald-400 drop-shadow-lg">{score}</span>
            </div>
            <div className="flex gap-3">
              {!gameStarted ? (
                <Button 
                  onClick={startGame} 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Start Game
                </Button>
              ) : (
                <Button 
                  onClick={pauseGame} 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </Button>
              )}
              <Button 
                onClick={resetGame} 
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔄 Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center">
          <div 
            className="relative w-full max-w-lg h-96 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
            style={{ aspectRatio: '1' }}
          >
            {/* Game board background with subtle pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                  radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${100/BOARD_SIZE}% ${100/BOARD_SIZE}%`
              }}></div>
            </div>
            
            {renderGameBoard()}
            
            {/* Glow effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 pointer-events-none"></div>
          </div>

          {gameOver && (
            <div className="mt-8 text-center">
              <div className="text-4xl font-bold text-red-400 mb-4 animate-bounce drop-shadow-lg">
                💀 Game Over!
              </div>
              <div className="text-xl text-white/80 mb-6">
                Final Score: <span className="font-bold text-emerald-400 text-2xl">{score}</span>
              </div>
              <Button 
                onClick={resetGame} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
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
            <div>🍎 Eat the red food to grow and increase your score!</div>
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
