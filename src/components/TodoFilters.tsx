import { Filter, SortBy, CATEGORIES } from '../types/todo';

interface TodoFiltersProps {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
}

export default function TodoFilters({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy
}: TodoFiltersProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '16px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #E5E7EB'
        }}
      >
        <option value="date">Sort by Date</option>
        <option value="status">Sort by Status</option>
        <option value="alphabetical">Sort Alphabetically</option>
      </select>
    </div>
  );
}
