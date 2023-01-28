import { trpc } from "@/utils/trpc";

const useAutoCompleteSearch = (query?: string) => {
  const results = trpc.search.ytAutoComplete.useQuery(
    { searchQuery: query as string },
    { enabled: !!query && query.length > 1 }
  );
  return results;
};

export default useAutoCompleteSearch;
