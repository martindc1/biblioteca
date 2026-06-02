import { Search } from "@/components/Icons";

export function SearchBox({ placeholder = "Buscar" }: { placeholder?: string }) {
  return (
    <label className="searchBox">
      <Search size={23} />
      <input placeholder={placeholder} />
    </label>
  );
}
