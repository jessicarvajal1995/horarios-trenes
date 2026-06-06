import { useCallback, useMemo, useState } from 'react';
import { ArrowDownUp, CalendarDays, Clock, Heart, Map, MoveLeft } from 'lucide-react';
import { fetchArrivals, searchStations, type Station } from './api';
import { FilterAccordion } from './components/FilterAccordion';
import { ResultCard } from './components/ResultCard';
import { SearchableSelect } from './components/SearchableSelect';
import { groupTripsByBranch, mapArrivalToTrip } from './trips';
import type { Trip } from './types';

const today = new Date();
const todayValue = today.toISOString().slice(0, 10);
const nowValue = today.toTimeString().slice(0, 5);

const defaultOrigin: Station = {
  id: '306',
  nombre: 'Pilar',
  ramales: [31, 59, 65, 131]
};

const defaultDestination: Station = {
  id: '463',
  nombre: 'Retiro (LSM)',
  ramales: [31, 65, 131]
};

function unique(values: string[]) {
  return [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

export default function App() {
  const [origen, setOrigen] = useState<Station | null>(defaultOrigin);
  const [destino, setDestino] = useState<Station | null>(defaultDestination);
  const [fecha, setFecha] = useState(todayValue);
  const [hora, setHora] = useState(nowValue);
  const [resultados, setResultados] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleSearchStations = useCallback((query: string) => searchStations(query), []);

  const branchOptions = useMemo(() => unique(resultados.map((trip) => trip.ramal)), [resultados]);
  const typeOptions = useMemo(() => unique(resultados.map((trip) => trip.tipoServicio)), [resultados]);

  const filteredTrips = useMemo(() => {
    return resultados.filter((trip) => {
      const branchMatch = selectedBranches.length === 0 || selectedBranches.includes(trip.ramal);
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(trip.tipoServicio);
      return branchMatch && typeMatch;
    });
  }, [resultados, selectedBranches, selectedTypes]);

  const groupedTrips = useMemo(() => groupTripsByBranch(filteredTrips), [filteredTrips]);

  const searchTrips = async () => {
    if (!origen) {
      setError('Elegí una estación de origen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const arrivals = await fetchArrivals({
        origenId: origen.id,
        destinoId: destino?.id,
        fecha,
        hora
      });
      setResultados(arrivals.map(mapArrivalToTrip));
      setSelectedBranches([]);
      setSelectedTypes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los viajes');
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const swapStations = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__nav">
          <button type="button" aria-label="Volver">
            <MoveLeft size={30} />
          </button>
          <button type="button" aria-label="Ver mapa">
            <Map size={30} />
          </button>
        </div>

        <form
          className="search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            void searchTrips();
          }}
        >
          <div className="route-rail" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <div className="search-panel__fields">
            <SearchableSelect
              label="Origen"
              placeholder="Escribi estacion..."
              value={origen}
              onChange={setOrigen}
              onSearch={handleSearchStations}
            />
            <SearchableSelect
              label="Destino"
              placeholder="Escribi estacion..."
              value={destino}
              onChange={setDestino}
              onSearch={handleSearchStations}
            />
          </div>

          <div className="search-panel__actions">
            <button type="button" className="icon-button favorite" aria-label="Guardar viaje">
              <Heart size={28} />
            </button>
            <button type="button" className="icon-button swap" aria-label="Invertir estaciones" onClick={swapStations}>
              <ArrowDownUp size={28} />
            </button>
          </div>

          <label className="date-pill">
            <CalendarDays size={22} />
            <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          </label>
          <label className="date-pill">
            <Clock size={22} />
            <input type="time" value={hora} onChange={(event) => setHora(event.target.value)} />
          </label>
          <button type="submit" className="go-button" disabled={loading}>
            {loading ? '...' : 'Ir'}
          </button>
        </form>
      </section>

      <section className="filters" aria-label="Filtros">
        <FilterAccordion
          title="Ramal"
          options={branchOptions}
          selected={selectedBranches}
          onChange={setSelectedBranches}
        />
        <FilterAccordion
          title="Tipo de servicio"
          options={typeOptions}
          selected={selectedTypes}
          onChange={setSelectedTypes}
        />
      </section>

      <section className="results" aria-live="polite">
        {error ? <div className="state state--error">{error}</div> : null}
        {loading ? <div className="state">Buscando viajes...</div> : null}
        {!loading && !error && resultados.length === 0 ? (
          <div className="state">Elegí origen, destino y tocá Ir.</div>
        ) : null}
        {!loading && !error && resultados.length > 0 && filteredTrips.length === 0 ? (
          <div className="state">No hay viajes para esos filtros.</div>
        ) : null}

        {Object.entries(groupedTrips).map(([branch, trips]) => (
          <div key={branch} className="result-group">
            {trips.map((trip) => (
              <ResultCard key={`${trip.id}-${trip.horaSalida}-${trip.horaLlegada}`} trip={trip} />
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
