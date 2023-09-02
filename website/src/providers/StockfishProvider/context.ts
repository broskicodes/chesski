import { createContext, useContext } from "react";
import { Player } from "../ChessboardProvider";

export enum GameStatus {
  Equal = "position is roughly equal",
  Better = "is slightly better",
  Winning = "has a significant advantage",
  Mate = "has forced mate",
}

export enum SkillLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Experienced = "Experienced",
  Advanced = "Advanced",
  Master = "Master",
}

export const SkillMap: { [key in SkillLevel]: number } = {
  Beginner: 800,
  Intermediate: 1350,
  Experienced: 1800,
  Advanced: 2400,
  Master: 2850,
};

export interface PV {
  eval: number;
  isMate: boolean;
  gameStatus: GameStatus;
  variation: string[];
  advantage: Player;
}

export interface Stockfish {
  name: string;
  worker: Worker;
  isReady: boolean;
  isSearching: boolean;
  skillLvl: SkillLevel;
  numPVs: number;
  moveTime?: number;
  bestMove: string | null;
  pvs: { [key: number]: PV } | null;
}

export interface EngineArgs {
  engineName: string;
  skillLvl: SkillLevel;
  numPVs: number;
  moveTime?: number;
}

export interface StockfishProviderContext {
  initEngine: (args: EngineArgs) => boolean;
  isInit: (engineName: string) => boolean;
  startSearch: (engineName: string) => boolean;
  stopSearch: (engineName: string) => boolean;
  restartEngine: (engineName: string) => boolean;
  setEngineSkillLvl: (engineName: string, lvl: SkillLevel) => boolean;
  getGameStatus: (engineName: string) => [Player, GameStatus];
  getMoveSuggestions: (engineName: string) => PV[];
}

export const StockfishContext = createContext<StockfishProviderContext>({
  initEngine: (_args) => {
    throw new Error("StockfishProvider not initialized");
  },
  isInit: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
  startSearch: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
  stopSearch: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
  restartEngine: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
  setEngineSkillLvl: (_eName, _lvl) => {
    throw new Error("StockfishProvider not initialized");
  },
  getGameStatus: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
  getMoveSuggestions: (_eName) => {
    throw new Error("StockfishProvider not initialized");
  },
});

export const useStockfish = () => useContext(StockfishContext);
