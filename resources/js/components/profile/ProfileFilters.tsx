interface Filter {
  label: string;
  count: number;
  active: boolean;
}

interface ProfileFiltersProps {
  filters: Filter[];
  onFilter: (label: string) => void;
}

export default function ProfileFilters({ filters, onFilter }: ProfileFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {filters.map((filter) => (
        <button
          key={filter.label}
          className={`px-3 py-1 rounded-full border text-sm font-medium transition ${filter.active ? 'bg-blue-100 text-blue-600 border-blue-400' : 'bg-white text-gray-700 border-gray-200'}`}
          onClick={() => onFilter(filter.label)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
