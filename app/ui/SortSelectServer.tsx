import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent } from "react";

const SortSelectServer = () => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  const handleSort = (e: ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);    
    params.set("sort", e.target.value);
    replace(`${pathName}?${params.toString()}`);
  };

  
  return (
    <select onChange={handleSort}>
      <option value="title">Title A to Z</option>
      <option value="-title">Title Z to A</option>
      <option value="created_at">Created (old to New)</option>
      <option value="-created_at">Created (New to Old)</option>
      <option value="updated_at">Updated (old to New)</option>
      <option value="-updated_at">Updated (New to Old)</option>
    </select>
  );
};

export default SortSelectServer;
