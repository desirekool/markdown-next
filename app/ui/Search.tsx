import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent } from "react";
import { useDebouncedCallback } from "use-debounce";

const Search = () => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);
      const term = e.target.value;
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }

      replace(`${pathName}?${params.toString()}`);
    },
    300
  );

  return <input type="text" placeholder="Search" onChange={handleSearch} />;
};

export default Search;