import React from "react";
import { useState } from "react";

function Square({ value, onSquareClick, className }) {
  return (
    <button className={`square ${className}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let winningSquares = [];
  let status;
  if (winner) {
    winningSquares = winner.winningSquares;
    status = "Winner: " + winner.winner;
  } else if (squares.every((square) => square !== null)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function renderSquare(index) {
    const isWinningSquare = winningSquares.includes(index);
    return (
      <Square
        key={index}
        value={squares[index]}
        onSquareClick={() => handleClick(index)}
        className={isWinningSquare ? "winning-square" : "square"}
      />
    );
  }

  function buildGameGrid() {
    let counter = 0;
    let rows = [];
    for (let i = 0; i < 3; i++) {
      // row loop
      let rowSquares = [];
      for (let j = 0; j < 3; j++) {
        // column loop
        rowSquares.push(renderSquare(counter));
        counter++;
      }
      rows.push(
        <div key={counter} className="board-row">
          {rowSquares}
        </div>
      );
    }
    return rows;
  }

  const gameGrid = buildGameGrid();

  return (
    <div>
      <div className="status">{status}</div>
      {gameGrid}
    </div>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [moveCoordinates, setMoveCoordinates] = useState([]);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  console.debug("Hello, world!");

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    // Compare the last two moves
    const previousHistory = nextHistory[nextHistory.length - 2];
    const currentHistory = nextHistory[nextHistory.length - 1];

    // Find the changes between the two moves
    const changes = findMoveChanges(previousHistory, currentHistory);
    const coordinates = getCoordinatesFromIndex(changes[0].squareIndex);

    setMoveCoordinates([...moveCoordinates, coordinates]);
  }

  // Function to find changes between two moves (game states)
  function findMoveChanges(previousMove, currentMove) {
    const changes = [];
    for (let i = 0; i < previousMove.length; i++) {
      if (previousMove[i] !== currentMove[i]) {
        changes.push({
          squareIndex: i,
          previousValue: previousMove[i],
          currentValue: currentMove[i]
        });
      }
    }
    return changes;
  }

  function getCoordinatesFromIndex(index) {
    const coordinates = [
      "(0,0)",
      "(0,1)",
      "(0,2)",
      "(1,0)",
      "(1,1)",
      "(1,2)",
      "(2,0)",
      "(2,1)",
      "(2,2)"
    ];
    return coordinates[index];
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleMoveOrder() {
    setIsAscending(!isAscending);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move + moveCoordinates[move - 1];
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{isAscending ? moves : moves.reverse()}</ol>
      </div>
      <div>
        <button onClick={toggleMoveOrder}>
          Toggle Move Order: {isAscending ? "Ascending" : "Descending"}
        </button>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: lines[i]
      };
    }
  }
  return null;
}
