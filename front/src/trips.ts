import type { ArrivalResult } from './api';
import type { Trip } from './types';

const formatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function formatTime(value?: string): string {
  if (!value) {
    return '--:--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return formatter.format(date);
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 0) {
    return '';
  }

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function mapArrivalToTrip(result: ArrivalResult): Trip {
  const departure = result.arribo.salida?.programada ?? result.arribo.salida?.estimada;
  const arrival = result.arribo.llegada?.estimada ?? result.arribo.llegada?.programada;

  return {
    id: result.servicio.numero,
    ramal: result.servicio.ramal?.nombre ?? 'Sin ramal',
    anden: result.arribo.anden?.nombre ?? '-',
    tipoServicio: result.servicio.tipo?.nombre ?? 'Servicio',
    estado: result.servicio.estado?.nombre ?? 'Confirmado',
    horaSalida: formatTime(departure),
    horaLlegada: formatTime(arrival),
    duracion: formatDuration(result.arribo.segundos),
    origen: result.servicio.desde?.estacion?.nombre ?? result.arribo.nombre ?? 'Origen',
    destino: result.servicio.hasta?.estacion?.nombre ?? 'Destino'
  };
}

export function groupTripsByBranch(trips: Trip[]) {
  return trips.reduce<Record<string, Trip[]>>((groups, trip) => {
    groups[trip.ramal] ??= [];
    groups[trip.ramal].push(trip);
    return groups;
  }, {});
}
