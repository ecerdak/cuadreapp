// Captura puntual de ubicación para R10. Sin señal GPS no se bloquea
// nada: el dominio emite SIN_GPS (informativa) y la vida sigue.

export interface PosicionCapturada {
  lat: number;
  lng: number;
  precision: number;
}

export function capturarGps(tiempoMaximoMs = 5_000): Promise<PosicionCapturada | null> {
  return new Promise((resolver) => {
    if (!("geolocation" in navigator)) return resolver(null);
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        resolver({
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
          precision: posicion.coords.accuracy,
        }),
      () => resolver(null),
      { enableHighAccuracy: true, timeout: tiempoMaximoMs, maximumAge: 60_000 },
    );
  });
}
