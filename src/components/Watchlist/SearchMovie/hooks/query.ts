import { useQuery } from "@tanstack/react-query";

import pDebounce from "p-debounce";
import { useState } from "react";
import { queryClient } from "../../query";

import type { BffListResponse } from "../../../../../packages/core/tmdb/types";

// [ ]: implement proper error handling
const searchMovies = async (query: string) => {
  const queryParams = new URLSearchParams({
    title: query,
  });

  const api = import.meta.env.PUBLIC_API_URL;

  const response = await fetch(`${api}/movies?` + queryParams, {
    method: "GET",
  });

  const data = await response.json();

  return data;
};

const debouncedSearchMovies = pDebounce(searchMovies, 500);

export const useSearchMovies = () => {
  const [value, setValue] = useState("");

  const { data, isLoading, isError, error } = useQuery(
    {
      queryKey: ["searchedMovies", value],
      // @ts-ignore: movie will always be defined because of the enabled flag.
      queryFn: () => debouncedSearchMovies(value),
      enabled: value !== "",
    },

    queryClient
  );

  let result:
    | { status: "success"; data: BffListResponse }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" } = { status: "idle" };

  if (isLoading) {
    result = { status: "loading" };
  } else if (isError) {
    result = { status: "error", error: error as Error };
  } else if (data) {
    result = { status: "success", data: data as BffListResponse };
  }

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return {
    value,
    result: result,
    search: handleOnChange,
  };
};
