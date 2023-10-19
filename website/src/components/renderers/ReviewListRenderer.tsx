import Link from "next/link";
import { useRouter } from "next/router";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Player } from "../../providers/ChessboardProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";
import { Button } from "../display/Button";
import { LandingPage } from "../display/LandingPage";
import { SizedDiv } from "../display/SizedDiv";
import { BlitzIcon } from "../icons/BlitzIcon";
import { BulletIcon } from "../icons/BulletIcon";
import { RapidIcon } from "../icons/RapidIcon";

interface PlayerInfo {
  username: string;
  rating: number;
}

interface Game {
  id: string;
  perf: string;
  players: {
    white: PlayerInfo;
    black: PlayerInfo;
  };
  winner: Player;
  date: number;
}

export const ReviewListRenderer = () => {
  const { isConnected } = useSession();
  const { expanded, screenSize } = useSidebar();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const [lichessName, setLichessName] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const iconSize = useMemo(() => {
    switch (screenSize) {
      case ScreenSize.Desktop:
        return 1.3;
      case ScreenSize.Tablet:
        return 1.1;
      default:
        return 1;
    }
  }, [screenSize]);

  const TimeControlToIconMap: { [key: string]: JSX.Element } = useMemo(
    () => ({
      bullet: BulletIcon({ height: iconSize }),
      blitz: BlitzIcon({ height: iconSize }),
      rapid: RapidIcon({ height: iconSize }),
    }),
    [iconSize],
  );

  const fetchGames = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://lichess.org/api/games/user/${lichessName}?moves=false&tags=false&pgnInJson=true`,
        {
          method: "GET",
          headers: {
            Accept: "application/x-ndjson",
          },
        },
      );

      const text = await res.text();

      const gameObjs = text
        .trim()
        .split("\n")
        .map((g) => {
          const game = JSON.parse(g);

          return {
            id: game.id,
            perf: game.perf,
            players: {
              white: {
                username: game.players.white.user.id,
                rating: game.players.white.rating,
              },
              black: {
                username: game.players.black.user.id,
                rating: game.players.black.rating,
              },
            },
            winner: game.winner,
            date: game.createdAt,
          };
        });

      setGames(gameObjs);
    } catch (e) {
      addNotification({ msg: `No games found for user "${lichessName}"`, type: "error" })
    }

    setLoading(false);
  }, [lichessName]);

  useEffect(() => {
    console.log(games);
  }, [games]);

  return (
    <div className="h-full">
      {isConnected() ? (
        <div
          className={`flex flex-col justify-center items-center h-full space-y-6 ${
            expanded ? "md:ml-72" : "md:ml-20"
          }`}
        >
          <div>
            <form
              className="flex flex-row space-x-4 items-center"
              onSubmit={async (e) => {
                e.preventDefault();
                await fetchGames();
              }}
            >
              <label>Find Games:</label>
              <input
                className="border rounded-md"
                placeholder="Lichess Username"
                onChange={({ target }) => {
                  setLichessName(target.value);
                }}
              />
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </form>
          </div>
          <div className="flex flex-col relative">
            <SizedDiv className="flex overflow-y-auto" height={50}>
              {loading && (
                <div className="z-40 absolute inset-0 flex justify-center items-center">
                  <div className="z-30 absolute inset-0 bg-gray-300/75" />
                  <div className="z-40 loader ease-linear rounded-full border-4 border-t-4 border-t-red-300 border-neutral-900 h-8 w-8 animate-spin" />
                </div>
              )}
              <table className="border">
                <thead className="bg-gray-300 text-center sticky top-0">
                  <tr
                  // className="flex flex-row space-x-4"
                  >
                    <th className="w-12 lg:w-24"></th>
                    <th className="text-left w-64 lg:w-[30rem]">Players</th>
                    <th className="w-16 lg:w-32">Result</th>
                    <th className="w-48 lg:w-96">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {games.map((g) => (
                    <tr
                      key={g.id}
                      className="bg-gray-100 hover:bg-gray-200 border cursor-pointer"
                      onClick={() => {
                        router.push(`/review/${g.id}`);
                      }}
                    >
                      <td className="">
                        <div className="flex justify-center">
                          {TimeControlToIconMap[g.perf]}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col py-1">
                          <p>
                            W: {g.players.white.username} (
                            {g.players.white.rating})
                          </p>
                          <p>
                            B: {g.players.black.username} (
                            {g.players.black.rating})
                          </p>
                        </div>
                      </td>
                      <td className="text-center">
                        {g.winner
                          ? g.winner === Player.White
                            ? "1-0"
                            : "0-1"
                          : "½-½"}
                      </td>
                      <td className="text-center">
                        {new Date(g.date).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SizedDiv>
          </div>
        </div>
      ) : (
        <LandingPage
          header="Review you Games with GPT"
          subText="Enhance your understanding of chess concepts by talking to GPT about the complex positions in your games"
          link="/review"
        />
      )}
    </div>
  );
};
