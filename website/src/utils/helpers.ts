import { Chess } from "chess.js";
import { ParsedPGN, Header, Move, Comment } from "pgn-parser";

export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  return new Uint8Array(await new Blob([file]).arrayBuffer());
};

export const parsedPgnToChessJs = (pgn: ParsedPGN) => {
  const game = new Chess();

  pgn.headers?.forEach((header) => {
    game.header(header.name, header.value);
  });

  pgn.moves.forEach(({ move }) => {
    game.move(move.replaceAll(".", ""));
  });

  return game;
};

export const parsedPgnToString = (pgn: ParsedPGN) => {
  const parseHeader = (header: Header) => {
    return `[${header.name}  "${header.value}"]`;
  };

  // wtm = white to move (i.e. white has first move in current position)
  const preprocessMoves = (moves: Move[], wtm: boolean) => {
    let tempMoves = moves;

    const modRes = wtm ? 1 : 0;

    for (let i = 0; i < tempMoves.length; i++) {
      if (i % 2 === modRes && tempMoves[i].move_number) {
        tempMoves[i].move_number = undefined;
        if (
          i > 0 &&
          (tempMoves[i - 1].ravs ||
            (tempMoves[i - 1].comments &&
              (tempMoves[i - 1].comments as unknown as Comment[])[0].text))
        ) {
          tempMoves[i].move = `...${moves[i].move}`;
        }
      }

      if (tempMoves[i].ravs) {
        tempMoves[i].ravs = tempMoves[i].ravs?.map((rav) => {
          return {
            ...rav,
            moves: preprocessMoves(rav.moves, i % 2 === modRes),
          };
        });
      }
    }

    return tempMoves;
  };

  const parseComment = (comment: Comment): string | null => {
    return comment.text ? comment.text : null;
  };

  const parseMove = (move: Move): string => {
    const ravs = move.ravs
      ? move.ravs
          .map((rav) => {
            const moveStrs = rav.moves.map((move) => {
              return parseMove(move);
            });

            return `(${moveStrs.join(" ")}${
              rav.result ? ` ${rav.result}` : ""
            })`;
          })
          .join(" ")
      : "";

    const comments = move.comments
      ? move.comments
          .map((comment) => {
            const parsed = parseComment(comment as unknown as Comment);
            return parsed ? `{${parsed}}` : "";
          })
          .join(" ")
      : "";

    return `${move.move_number ? `${move.move_number}. ` : ""}${move.move}${
      comments.length > 0 ? ` ${comments}` : ""
    }${ravs.length > 0 ? ` ${ravs}` : ""}`;
  };

  pgn.moves = preprocessMoves(pgn.moves, true);

  return `${pgn.headers
    ?.map((header) => {
      return parseHeader(header);
    })
    .join("\n")}\n\n${pgn.moves
    .map((move) => {
      return parseMove(move);
    })
    .join(" ")} ${pgn.result}`;
};
