import React from "react";

interface SearchInputProps {
  value: string;
  search: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({ value, search }: SearchInputProps) => {
  return (
    <input
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      type="text"
      value={value}
      onChange={search}
    />
  );
};
