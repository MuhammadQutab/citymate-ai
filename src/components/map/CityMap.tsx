"use client";

import { unnamedLabel } from "@/lib/places/normalize";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/geo/distance";
import { CATEGORY_GLYPHS, type CategoryId } from "@/lib/places/categories";
import type { PlaceWithDistance } from "@/lib/places/types";

/**
 * Standard OpenStreetMap tiles (no key; light prototype use per the OSMF tile
 * policy). Darkened via CSS (.cm-map .leaflet-tile-pane) for the night theme.
 */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type MapPadding = { topLeft: [number, number]; bottomRight: [number, number] };

type Props = {
  center: LatLng;
  zoom: number;
  places: PlaceWithDistance[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  user?: LatLng | null;
  padding?: MapPadding;
  /** Disable fitting to results (e.g. single-place details map). */
  fit?: boolean;
  className?: string;
};

const iconCache = new Map<string, L.DivIcon>();

function placeIcon(category: CategoryId, active: boolean, index: number) {
  const key = `${category}:${active}:${Math.min(index, 20)}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: "",
      html: `<div class="cm-pin${active ? " cm-pin--active" : ""}" style="--cm-delay:${Math.min(index, 20) * 35}ms"><span>${CATEGORY_GLYPHS[category]}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      tooltipAnchor: [0, -34],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

const userIcon = L.divIcon({
  className: "",
  html: '<div class="cm-user" aria-hidden="true"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Controller({ places, selectedId, user, padding, fit, center, zoom }: Props) {
  const map = useMap();

  // Fit to the result set whenever it changes.
  useEffect(() => {
    if (!fit) return;
    const pts: L.LatLngExpression[] = places.slice(0, 15).map((p) => [p.lat, p.lon]);
    if (user) pts.push([user.lat, user.lon]);
    if (pts.length === 0) {
      map.flyTo([center.lat, center.lon], zoom, { duration: 0.8 });
      return;
    }
    map.flyToBounds(L.latLngBounds(pts), {
      paddingTopLeft: padding?.topLeft ?? [40, 40],
      paddingBottomRight: padding?.bottomRight ?? [40, 40],
      maxZoom: 16,
      duration: 0.9,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when the data changes
  }, [places, user?.lat, user?.lon, center.lat, center.lon]);

  // Glide to the selected place.
  useEffect(() => {
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;
    const target = map.project([p.lat, p.lon], Math.max(map.getZoom(), 15));
    const [l, t] = padding?.topLeft ?? [0, 0];
    const [r, b] = padding?.bottomRight ?? [0, 0];
    const shifted = map.unproject(target.subtract([(l - r) / 2, (t - b) / 2]), Math.max(map.getZoom(), 15));
    map.flyTo(shifted, Math.max(map.getZoom(), 15), { duration: 0.7 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to selection only
  }, [selectedId]);

  return null;
}

export default function CityMap(props: Props) {
  const { center, zoom, places, selectedId, onSelect, user, className = "" } = props;
  const fit = props.fit ?? true;
  const markers = useMemo(
    () =>
      places.map((p, i) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lon]}
          icon={placeIcon(p.category, p.id === selectedId, i)}
          zIndexOffset={p.id === selectedId ? 1000 : 0}
          title={p.name ?? p.kind}
          keyboard
          eventHandlers={{ click: () => onSelect?.(p.id) }}
        >
          <Tooltip direction="top" className="cm-tooltip">
            {p.name ?? unnamedLabel(p.kind)}
          </Tooltip>
        </Marker>
      )),
    [places, selectedId, onSelect],
  );

  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={zoom}
      zoomControl={false}
      className={`cm-map h-full w-full ${className}`}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      {markers}
      {user && <Marker position={[user.lat, user.lon]} icon={userIcon} title="Your approximate location" keyboard={false} />}
      <Controller {...props} fit={fit} />
    </MapContainer>
  );
}
