export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type Station = {
  id: string;
  nombre: string;
  ramales: number[];
  latitud?: string;
  longitud?: string;
};

type StationResponse = {
  id_estacion: string;
  nombre: string;
  latitud?: string;
  longitud?: string;
  incluida_en_ramales?: number[];
  operativa_en_ramales?: number[];
};

export type ArrivalResponse = {
  results?: ArrivalResult[];
};

export type ArrivalResult = {
  arribo: {
    anden?: { nombre?: string };
    llegada?: { programada?: string; estimada?: string };
    salida?: { programada?: string; estimada?: string };
    segundos?: number;
    idElemento?: number;
    nombre?: string;
  };
  servicio: {
    numero: number;
    ramal?: { id?: number; nombre?: string };
    tipo?: { nombre?: string };
    estado?: { nombre?: string };
    desde?: { estacion?: { nombre?: string; idElemento?: number } };
    hasta?: { estacion?: { nombre?: string; idElemento?: number } };
  };
};

function getDepartureDate(result: ArrivalResult): Date | null {
  const departure = result.arribo.salida?.estimada ?? result.arribo.salida?.programada;
  if (!departure) {
    return null;
  }

  const date = new Date(departure);
  return Number.isNaN(date.getTime()) ? null : date;
}

function filterFromDateTime(results: ArrivalResult[], fecha: string, hora: string): ArrivalResult[] {
  const selectedDate = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return results;
  }

  return results.filter((result) => {
    const departure = getDepartureDate(result);
    return !departure || departure >= selectedDate;
  });
}

export async function searchStations(query: string): Promise<Station[]> {
  if (query.trim().length < 3) {
    return [];
  }

  const url = `${API_BASE_URL}/infraestructura/estaciones?nombre=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudieron buscar estaciones');
  }

  const data = (await response.json()) as StationResponse[];

  return data.map((station) => ({
    id: station.id_estacion,
    nombre: station.nombre,
    latitud: station.latitud,
    longitud: station.longitud,
    ramales: station.operativa_en_ramales ?? station.incluida_en_ramales ?? []
  }));
}

export async function fetchArrivals(params: {
  origenId: string;
  destinoId?: string;
  fecha: string;
  hora: string;
}): Promise<ArrivalResult[]> {
  const buildUrl = (includeTime: boolean) => {
    const url = new URL(`${API_BASE_URL}/arribos/estacion/${params.origenId}`);
    if (params.destinoId) {
      url.searchParams.set('hasta', params.destinoId);
    }
    url.searchParams.set('fecha', params.fecha);
    if (includeTime && params.hora) {
      url.searchParams.set('hora', params.hora);
    }
    url.searchParams.set('cantidad', '8');
    return url;
  };

  const url = buildUrl(Boolean(params.hora));
  let response = await fetch(url.toString());

  if (!response.ok && params.hora) {
    response = await fetch(buildUrl(false).toString());
    if (response.ok) {
      const data = (await response.json()) as ArrivalResponse;
      return filterFromDateTime(data.results ?? [], params.fecha, params.hora);
    }
  }

  if (!response.ok) {
    throw new Error('No se pudieron cargar los viajes');
  }

  const data = (await response.json()) as ArrivalResponse;
  return data.results ?? [];
}
