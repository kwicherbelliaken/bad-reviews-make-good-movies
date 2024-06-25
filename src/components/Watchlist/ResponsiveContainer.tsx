import { useEffect, useState } from "react";
import { SearchMovies } from "./SearchMovies";
import { WatchlistMovies } from "./WatchlistMovies";

enum TabType {
  Search = "search",
  Watchlist = "watchlist",
}

const tabs = [
  { name: "Search", type: TabType.Search },
  { name: "Watchlist", type: TabType.Watchlist },
];

interface ResponsiveContainerProps {}

export const ResponsiveContainer = ({}: ResponsiveContainerProps) => {
  const [tab, setTab] = useState<TabType>(TabType.Search);

  //! I think this leaves a lot to be desired. I need this component to pick up to changes in the url (see the anchor elements used in the tabs).
  //! And the only way I could figure out how to do this was to subscribe to the popstate event. But I'm not sure if this is the best way to do this.
  useEffect(() => {
    window.addEventListener("popstate", handleTabChange);
    return () => window.removeEventListener("popstate", handleTabChange);
  }, []);

  const handleTabChange = () => {
    const currentTab =
      tabs.find((tab) => tab.type === window.location.hash.slice(1))?.type ||
      TabType.Search;

    setTab(currentTab);
  };

  // Resolve the user agent string to determine the device. An example:
  //    Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36
  const userAgentString = navigator.userAgent;
  if (userAgentString.toLowerCase().includes("mobile")) {
    return <MobileLayout currentTab={tab} />;
  }

  return <DesktopLayout />;
};

const getCurrentTab = (tabType: TabType) => {
  switch (tabType) {
    case TabType.Search:
      return <SearchMovies />;
    case TabType.Watchlist:
      return <WatchlistMovies />;
  }
};

const DesktopLayout = () => {
  return (
    <div className="grid grid-cols-5 h-[100vh] p-2 overflow-auto w-full">
      <SearchMovies />
      <WatchlistMovies />
    </div>
  );
};

const MobileLayout: React.FunctionComponent<{ currentTab: TabType }> = ({
  currentTab,
}) => {
  return (
    <>
      <div className="py-4 px-2">
        <div className="flex space-x-2" role="tablist" aria-label="Tabs">
          {tabs.map((tab) => {
            const currentTabClassName =
              currentTab === tab.type
                ? "border-black font-bold text-brand-600 bg-gray-300 focus:bg-gray-300"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

            return (
              <a
                key={tab.name}
                className={`bg-white hover:bg-gray-100 text-[#ED7AC8] font-semibold py-1 px-2 border border-[#ED7AC8] rounded-full shadow ${currentTabClassName}`}
                href={`#${tab.type}`}
              >
                {tab.name}
              </a>
            );
          })}
        </div>
      </div>
      {getCurrentTab(currentTab)}
    </>
  );
};
