import { useMemo, useState } from "react";
import debounce from "debounce";
import { match } from "ts-pattern";
import type { BffListResponse } from "../../../packages/core/tmdb/types";

interface UpdateWatchlistFormProps {}

// [ ]: implement proper error handling
const searchMovies = async (query: string) => {
  const queryParams = new URLSearchParams({
    query,
  });

  const response = await fetch(
    "https://dz76rj93fd.execute-api.ap-southeast-2.amazonaws.com/search?" +
      queryParams,
    {
      method: "GET",
    }
  );

  const results = await response.json();

  return results;
};

const useSearchMovies = () => {
  const [value, setValue] = useState("");

  const [result, setResult] = useState<
    | { status: "success"; data: BffListResponse }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" }
  >({
    status: "success",
    data: [
      {
        title: "There Will Be Blood",
        release_date: "2007-12-26",
        overview:
          "Ruthless silver miner, turned oil prospector, Daniel Plainview, moves to oil-rich California. Using his son to project a trustworthy, family-man image, Plainview cons local landowners into selling him their valuable properties for a pittance. However, local preacher Eli Sunday suspects Plainview's motives and intentions, starting a slow-burning feud that threatens both their lives.",
        poster_path: "/fa0RDkAlCec0STeMNAhPaF89q6U.jpg",
        cast: [
          { name: "Daniel Day-Lewis", character: "Daniel Plainview" },
          { name: "Paul Dano", character: "Paul Sunday / Eli Sunday" },
        ],
        genres: ["Drama"],
      },
      {
        title: "There Will Be No Blood",
        release_date: "2020-01-01",
        overview:
          "Tom needs help. His friend tries to help. Tom is scared of blood. Things don’t go as planned.",
        poster_path: null,
        cast: [],
        genres: [],
      },
      {
        title: "There Will Be Blood on Wednesday",
        release_date: "2015-11-11",
        overview:
          "Aras with the help of his sister and some friends takes hostages in an exchange shop demanding for the release of his friend who is in prison and is about to be executed.",
        poster_path: "/9wU9JCyF4NXo2Uy1z7LYvaDPLHW.jpg",
        cast: [{ name: "Hamed Behdad", character: "" }],
        genres: [],
      },
      {
        title: "Naruto Shippuden the Movie: Blood Prison",
        release_date: "2011-07-30",
        overview:
          "After his capture for attempted assassination of the Raikage, leader of Kumogakure, as well as killing Jōnin from Kirigakure and Iwagakure, Naruto is imprisoned in Hōzukijou: A criminal containment facility known as the Blood Prison. Mui, the castle master, uses the ultimate imprisonment technique to steal power from the prisoners, which is when Naruto notices his life has been targeted. Thus begins the battle to uncover the truth behind the mysterious murders and prove Naruto's innocence.",
        poster_path: "/4WT7zYFpe0fsbg6TitppiHddWAh.jpg",
        cast: [
          { name: "Junko Takeuchi", character: "Naruto (voice)" },
          { name: "Mie Sonozaki", character: "Ryûzetsu (voice)" },
        ],
        genres: [
          "Thriller",
          "Animation",
          "Action",
          "Comedy",
          "Horror",
          "Mystery",
        ],
      },
      {
        title: "Guinea Pig 2: Flower of Flesh and Blood",
        release_date: "1985-10-07",
        overview:
          'Late at night, a woman is kidnapped by an unknown assailant and taken back to his blood-spattered dungeon, where he turns her into a "flower of blood and flesh" through a series of dismemberment and evisceration.',
        poster_path: "/hV4KI3AyknlfGIaVyMq7p66Tc3X.jpg",
        cast: [
          { name: "Hiroshi Tamura", character: "Samurai" },
          { name: "Kirara Yugao", character: "Victim" },
        ],
        genres: ["Horror"],
      },
      {
        title: "Dragon Ball: Curse of the Blood Rubies",
        release_date: "1986-12-20",
        overview:
          "The great King Gurumes is searching for the Dragon Balls in order to put a stop to his endless hunger. A young girl named Pansy who lives in the nearby village has had enough of the treachery and decides to seek Muten Rōshi for assistance. Can our heroes save the village and put a stop to the Gurumes Army?",
        poster_path: "/dZCWRFJnwyxYOhzAhf7Xyru4moB.jpg",
        cast: [
          { name: "Masako Nozawa", character: "Son Goku (voice)" },
          { name: "Hiromi Tsuru", character: "Buruma (voice)" },
        ],
        genres: [
          "Action",
          "Animation",
          "Adventure",
          "Comedy",
          "Fantasy",
          "Science Fiction",
        ],
      },
      {
        title: "Splatter: Naked Blood",
        release_date: "1996-02-20",
        overview:
          "A scientist taints his mother's scientific experiment with his own drug that transforms pain into a pleasurable experience. Unfortunately for the three women involved in the experiment, the drug works a little bit too well.",
        poster_path: "/yCLPovhiuoiKoN3JLUAlKQ7D5SL.jpg",
        cast: [
          { name: "Misa Aika", character: "Rika Mikami" },
          { name: "Yumika Hayashi", character: "Gluttonous Woman" },
        ],
        genres: ["Horror", "Science Fiction"],
      },
      {
        title: "Tiger, Blood in the Mouth",
        release_date: "2016-08-25",
        overview:
          "Ramón Alvia is a professional boxer who, although he has won several international championships, is old and is at the end of his career. He resists. In the gym, Ramon discovers among the young boxers Deborah, a beautiful girl.",
        poster_path: "/tMtWyyyJRHlh32d0VnXSIFImpsr.jpg",
        cast: [
          { name: "Leonardo Sbaraglia", character: "Ramón" },
          { name: "Eva De Dominici", character: "Débora" },
        ],
        genres: ["Drama"],
      },
      {
        title: "Vampire Hunter D: Bloodlust",
        release_date: "2000-08-25",
        overview:
          "D has been hired to track down Meier Link, a notoriously powerful vampire who has abducted a woman, Charlotte Elbourne. D's orders are strict - find Charlotte, at any cost. For the first time, D faces serious competition. The Markus Brothers, a family of Vampire Hunters, were hired for the same bounty. D Must intercept Meier and conquer hostile forces on all sides in a deadly race against time.",
        poster_path: "/4hJUWgdmoFsNpzyTN6QjoZcaivO.jpg",
        cast: [
          { name: "Hideyuki Tanaka", character: "D (voice)" },
          { name: "Ichiro Nagai", character: "D's Left Hand (voice)" },
        ],
        genres: ["Animation", "Fantasy", "Horror", "Action"],
      },
      {
        title: "Throne of Blood",
        release_date: "1957-01-15",
        overview:
          "Returning to their lord's castle, samurai warriors Washizu and Miki are waylaid by a spirit who predicts their futures. When the first part of the spirit's prophecy comes true, Washizu's scheming wife, Asaji, presses him to speed up the rest of the spirit's prophecy by murdering his lord and usurping his place. Director Akira Kurosawa's resetting of William Shakespeare's \"Macbeth\" in feudal Japan is one of his most acclaimed films.",
        poster_path: "/iDmEAMZd3eYxfcK9EXVOddtEb7e.jpg",
        cast: [
          { name: "Toshirō Mifune", character: "Taketori Washizu" },
          { name: "Isuzu Yamada", character: "Lady Asaji Washizu" },
        ],
        genres: ["Drama", "History"],
      },
      {
        title: "Blood and Black Lace",
        release_date: "1964-04-10",
        overview:
          "Isabella, a young model, is murdered by a mysterious masked figure at a fashion house in Rome. When her diary, which details the house employees many vices, disappears, the masked killer begins killing off all the models in and around the house to find it.",
        poster_path: "/siEti5iNAbN91Q3AR2XRPfJ1E6O.jpg",
        cast: [
          { name: "Cameron Mitchell", character: "Massimo Morlacchi" },
          { name: "Eva Bartok", character: "Contessa Cristiana Cuomo" },
        ],
        genres: ["Horror", "Mystery", "Thriller"],
      },
      {
        title: "Blood: The Last Vampire",
        release_date: "2000-11-18",
        overview:
          "In Japan, the vampire-hunter Saya, who is a powerful original, is sent by her liaison with the government, David, posed as a teenage student to the Yokota High School on the eve of Halloween to hunt down vampires. Saya asks David to give a new katana to her. Soon she saves the school nurse Makiho Amano from two vampires disguised of classmates and Makiho witnesses her fight against the powerful demon.",
        poster_path: "/2yysSRyqa4ubIDpQcQpG8SuYcl6.jpg",
        cast: [
          { name: "Youki Kudoh", character: "Saya (voice)" },
          {
            name: "Saemi Nakamura",
            character: "Nurse Makiho Caroline Amano (voice)",
          },
        ],
        genres: ["Animation", "Fantasy", "Horror"],
      },
      {
        title: "Tokyo Revengers 2 Part 1: Bloody Halloween - Destiny",
        release_date: "2023-04-21",
        overview:
          "Hinata is murdered again by the Tokyo Manjikai Gang in front of Takemichi. In order to save Hinata, Takemichi travels 10 years back in time again. Takemichi has to change a key case that can save Hinata. The key case involves a sad incident that occurred to 6 men, who later formed the Tokyo Manjikai Gang.",
        poster_path: "/hQNZBjUoLVW3WZhIvtK3fD15p4V.jpg",
        cast: [
          { name: "Takumi Kitamura", character: "Takemichi Hanagaki" },
          { name: "Ryo Yoshizawa", character: "Manjiro Sano" },
        ],
        genres: ["Action", "Crime", "Drama"],
      },
      {
        title: "Blood-C: The Last Dark",
        release_date: "2012-06-02",
        overview:
          'Tokyo, Winter. Despite the use of the Youth Ordinance Bill to enforce curfews for minors and regulate the use of the Internet, young people continue to fight for their own freedom through underground methods. One such group calls themselves Surat. They have decided to take on Fumito Nanahara, a man who has great influence on the political world, and basically controls Tokyo with an iron fist. While using the Internet as a weapon to discover more information about Fumito, they learn about "Tower", the secret organization behind Fumito which engages in human experimentation.',
        poster_path: "/sUlxd7SRFr6ou8d5MfL0sj7XpSv.jpg",
        cast: [
          { name: "Atsushi Abe", character: "Itsuki Tomofusa (voice)" },
          { name: "Masumi Asano", character: "Yuka Amino (voice)" },
        ],
        genres: ["Action", "Horror", "Science Fiction", "Animation"],
      },
      {
        title: "Lupin the Third: Goemon's Blood Spray",
        release_date: "2017-02-04",
        overview:
          "A yakuza boss hires Goemon Ishikawa, a modern day samurai, to protect him aboard his cruise ship casino. Everything goes sideways when the famous thief, Lupin the Third, tries to rob the vessel. Lupin's being hunted by a powerful and mysterious man: the so called “Ghost of Bermuda.” With Goemon's employer dead in the ensuing chaos, his honor is at stake, and the only way to preserve it is with blood. But this opponent is like no other, and to make things right, Goemon may need to sharpen not only his sword, but himself as well!",
        poster_path: "/AeF2oitbvWfsuyz2FUs9Ohlqx6N.jpg",
        cast: [
          { name: "Kanichi Kurita", character: "Arsène Lupin III (voice)" },
          { name: "Kiyoshi Kobayashi", character: "Daisuke Jigen (voice)" },
        ],
        genres: ["Animation", "Action", "Crime"],
      },
      {
        title: "A Bay of Blood",
        release_date: "1971-09-08",
        overview:
          "An elderly heiress is killed by her husband who wants control of her fortunes. What ensues is an all-out murder spree as relatives and friends attempt to reduce the inheritance playing field, complicated by some teenagers who decide to camp out in a dilapidated building on the estate.",
        poster_path: "/i0FKCvEypCO8ZUkIeHQhuUMvARN.jpg",
        cast: [
          { name: "Claudine Auger", character: "Renata Donati" },
          { name: "Luigi Pistilli", character: "Alberto / Albert" },
        ],
        genres: ["Horror", "Thriller"],
      },
      {
        title: "Bayonetta: Bloody Fate",
        release_date: "2013-11-23",
        overview:
          "Based on the 2009 video game, Bayonetta: Bloody Fate follows the story of the titular heroine, an ancient witch who awakens from a five hundred-year slumber with no memory of her life. Armed with a gun in each limb, Bayonetta embarks on a journey to rediscover her past, defeating all bloodthirsty angels that stand in her way.",
        poster_path: "/dfg7dqm0YX16D6QYDKDdh3Qi930.jpg",
        cast: [
          { name: "Atsuko Tanaka", character: "Bayonetta" },
          { name: "Mie Sonozaki", character: "Jeanne" },
        ],
        genres: ["Animation", "Action", "Fantasy"],
      },
      {
        title: "Blood and Ties",
        release_date: "2013-10-24",
        overview:
          "A young woman's happy life with her father takes a downward turn when she begins to suspect that he's a kidnapper.",
        poster_path: "/ujxoYzbIQ2CuSYtt1fJJv3NMhJG.jpg",
        cast: [
          { name: "Son Ye-jin", character: "Jeong Daeun" },
          { name: "Kim Kap-soo", character: "Jeong Sunman" },
        ],
        genres: ["Thriller", "Drama"],
      },
      {
        title: "TEKKEN: Blood Vengeance",
        release_date: "2011-07-26",
        overview:
          "Set in the rich Tekken universe, Tekken: Blood Vengeance 3D follows Xiaoyu Ling, seasoned martial artist and high school student, tasked by the G Corporation to infiltrate an international school in Kyoto to gather information on the mysterious student Shin Kamiya. Before she can make any progress in the investigation, Shin is kidnapped by an unknown assailant. Digging deeper into Shin’s background in an attempt to rescue him, Xiaoyu learns about the frightening underbelly of the Mishima Zaibatsu. Jin Kazama, Kazuya Mishima… and the late Heihachi Mishima’s conspiracy that’s stained with blood.",
        poster_path: "/nYfa9yK6LlbE9K4U7Ved815RgMM.jpg",
        cast: [
          { name: "Isshin Chiba", character: "Jin Kazama (voice)" },
          { name: "Unsho Ishizuka", character: "Heihachi Mishima (voice)" },
        ],
        genres: ["Action", "Animation", "Science Fiction"],
      },
      {
        title: "Blood Type O Watermelon Maid",
        release_date: "2021-01-08",
        overview:
          "Friends Cheol Min and Jae Hyuk meet and talk to each other after a long time. Jae Hyuk said that the domestic helper who recently came to work at his house is strange. He said he was worried because she couldn't do the housework. When Jae Hyuk said she seemed to be trying to seduce him, Cheol Min tells the innocent Jae Hyuk how to get around her. Can Jae Hyuk succeed in having sex with a beautiful housekeeper?",
        poster_path: "/1xdJWTn5Tuqy7yWTywC9WBPyicW.jpg",
        cast: [
          { name: "Chul Jin", character: "" },
          { name: "Kang Min-woo", character: "" },
        ],
        genres: ["Drama", "Romance"],
      },
    ],
  });

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    debouncedSearch(event.target.value);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        // [ ]: use dev tools to return an error
        setResult({ status: "loading" });

        try {
          const results = await searchMovies(query);

          setResult({ status: "success", data: results });
        } catch (error) {
          setResult({ status: "error", error: error as unknown as Error });
        }
      }, 500),
    []
  );

  return {
    value,
    result: result,
    search: handleOnChange,
  };
};

const useAddMovieToWatchlist = () => {
  const [result, setResult] = useState<
    | { status: "success" }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" }
  >({
    status: "idle",
  });

  const addMovieToWatchlist = async (payload: any) => {
    setResult({ status: "loading" });

    try {
      const response = await fetch(
        "https://hh2877m7a0.execute-api.ap-southeast-2.amazonaws.com/movies",
        {
          method: "POST",
          body: JSON.stringify({
            username: "trial-user",
            watchlistId: "8JWw9ZPsUtkD-14h0Fnzs",
            payload,
          }),
        }
      );

      // NB: Critically important to actually read the response body. If we don't
      // Node Fetch leaks connections: https://github.com/node-fetch/node-fetch/issues/499
      const body = await response.json();

      if (response.status !== 200 || !response.ok) {
        throw new Error(body.error);
      }

      setResult({ status: "success" });
    } catch (error) {
      setResult({ status: "error", error: error as unknown as Error });
    }
  };

  return {
    result: result,
    addMovieToWatchlist,
  };
};

export const UpdateWatchlistForm = ({}: UpdateWatchlistFormProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          type="text"
          value={value}
          onChange={search}
        />
      </div>
      <div>
        {match(result)
          .with({ status: "loading" }, () => <div>loading...</div>)
          .with({ status: "success" }, ({ data: movies }) => (
            <Movies movies={movies} />
          ))
          .with({ status: "error" }, ({ error }) => <div>{error.message}</div>)
          .otherwise(() => null)}
      </div>
    </div>
  );
};

const Movie = ({
  movie,
  movies,
}: {
  movie: BffListResponse[0];
  movies: BffListResponse;
}) => {
  const { result, addMovieToWatchlist } = useAddMovieToWatchlist();

  const handleOnClick = async (event: React.MouseEvent<HTMLElement>) => {
    const payload = movies.find(
      (movie) => movie.title === event.currentTarget.id
    );

    if (payload == null) {
      throw new Error(
        "Weirdly, the movie you clicked on is not in the list of movies."
      );
    }

    await addMovieToWatchlist(payload);
  };

  return (
    <>
      {match(result)
        .with({ status: "loading" }, () => <div>loading...</div>)
        .with({ status: "error" }, ({ error }) => (
          <div id={movie.title} className="p-6" onClick={handleOnClick}>
            <div>{error.message}</div>
            <div>{movie.title}</div>
            <div>{movie.release_date}</div>
            <div>{movie.overview}</div>
            {movie.cast.map((cast) => {
              return (
                <div>
                  <div>
                    {cast.name} as {cast.character}
                  </div>
                </div>
              );
            })}
          </div>
        ))
        .otherwise(() => (
          <div
            id={movie.title}
            className="p-6 flex flex-col bg-slate-50 gap-4 border rounded-lg hover:bg-slate-400 cursor-pointer"
            onClick={handleOnClick}
          >
            <h2>{movie.title}</h2>
            <h4>{movie.release_date}</h4>
            <p>{movie.overview}</p>
            <div className="flex flex-col py-10 gap-2">
              {movie.cast.map((cast) => {
                return (
                  <p>
                    <strong>{cast.name}</strong> as {cast.character}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
    </>
  );
};

const Movies = ({ movies }: { movies: BffListResponse }) => {
  return (
    <div className="flex flex-col gap-4 drop-shadow-md">
      {movies?.map((movie, index) => (
        <Movie key={`${movie.title}-${index}`} movie={movie} movies={movies} />
      ))}
    </div>
  );
};
