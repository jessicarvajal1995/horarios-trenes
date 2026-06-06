import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Station } from '../api';

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  value: Station | null;
  onChange: (station: Station | null) => void;
  onSearch: (query: string) => Promise<Station[]>;
};

export function SearchableSelect({ label, placeholder, value, onChange, onSearch }: SearchableSelectProps) {
  const [query, setQuery] = useState(value?.nombre ?? '');
  const [options, setOptions] = useState<Station[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const latestQuery = useRef('');

  useEffect(() => {
    setQuery(value?.nombre ?? '');
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();
    latestQuery.current = trimmed;

    if (value?.nombre === query || trimmed.length < 3) {
      setOptions([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = window.setTimeout(() => {
      onSearch(trimmed)
        .then((stations) => {
          if (latestQuery.current === trimmed) {
            setOptions(stations);
            setOpen(true);
            setError('');
          }
        })
        .catch(() => {
          if (latestQuery.current === trimmed) {
            setError('No pude buscar estaciones');
          }
        })
        .finally(() => {
          if (latestQuery.current === trimmed) {
            setLoading(false);
          }
        });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [onSearch, query, value?.nombre]);

  return (
    <label className="search-select">
      <span className="search-select__label">{label}</span>
      <span className="search-select__input-wrap">
        <MapPin size={19} aria-hidden="true" />
        <input
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(null);
          }}
          onFocus={() => setOpen(true)}
        />
        {value ? (
          <button
            type="button"
            className="search-select__clear"
            aria-label={`Limpiar ${label}`}
            onClick={() => {
              onChange(null);
              setQuery('');
              setOptions([]);
            }}
          >
            x
          </button>
        ) : null}
      </span>

      {open && (options.length > 0 || loading || error || query.trim().length > 0) ? (
        <span className="search-select__menu">
          {query.trim().length > 0 && query.trim().length < 3 ? (
            <span className="search-select__hint">Escribí al menos 3 letras</span>
          ) : null}
          {loading ? <span className="search-select__hint">Buscando...</span> : null}
          {error ? <span className="search-select__hint">{error}</span> : null}
          {!loading && !error && query.trim().length >= 3 && options.length === 0 ? (
            <span className="search-select__hint">Sin coincidencias</span>
          ) : null}
          {options.map((station) => (
            <button
              key={station.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(station);
                setQuery(station.nombre);
                setOpen(false);
              }}
            >
              {station.nombre}
            </button>
          ))}
        </span>
      ) : null}
    </label>
  );
}
