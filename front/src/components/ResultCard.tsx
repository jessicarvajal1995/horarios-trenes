import { CircleDot } from 'lucide-react';
import type { Trip } from '../types';

type ResultCardProps = {
  trip: Trip;
};

export function ResultCard({ trip }: ResultCardProps) {
  return (
    <article className="trip-card">
      <header className="trip-card__header">
        <span>Ramal</span>
        <strong>{trip.ramal}</strong>
      </header>
      <div className="trip-card__body">
        <div className="trip-card__meta">
          <span>Anden {trip.anden}</span>
          <span>
            {trip.tipoServicio}
            {trip.estado ? ` · ${trip.estado}` : ''}
          </span>
        </div>

        <div className="trip-card__times">
          <strong>{trip.horaSalida}</strong>
          <span className="trip-card__line">
            <CircleDot size={18} aria-hidden="true" />
          </span>
          <strong>{trip.horaLlegada !== '--:--' ? trip.horaLlegada : trip.duracion}</strong>
        </div>

        <div className="trip-card__stations">
          <div>
            <span>Origen</span>
            <strong>{trip.origen}</strong>
          </div>
          <div>
            <span>Destino</span>
            <strong>{trip.destino}</strong>
            <small>{trip.id}</small>
          </div>
        </div>
      </div>
    </article>
  );
}
