const width = 500;
const height = 750;

interface MoviePosterProps {
  imageUrl: string;
}

export const MoviePoster = ({ imageUrl }: MoviePosterProps) => {
  return (
    <figure className="rounded-xl p-2 bg-gray-900/2.5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
      <img
        className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
        src={imageUrl}
        alt="A movie poster of <INSERT_MOVIE_NAME>"
        width={width}
        height={height}
      />
    </figure>
  );
};
