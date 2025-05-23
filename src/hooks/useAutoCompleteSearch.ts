import { api } from "@/utils/api";

const useAutoCompleteSearch = (query?: string) => {
  const results = api.search.ytAutoComplete.useQuery(
    { searchQuery: query as string },
    { enabled: !!query && query.length >= 3 }
  );
  return results;
};

export default useAutoCompleteSearch;
