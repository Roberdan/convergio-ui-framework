'use client';

import { useState } from 'react';
import {
  MnMeshNetwork,
  MnHubSpoke,
  MnDeploymentTable,
  MnAuditLog,
  MnActiveMissions,
  MnNightJobs,
  MnMap,
  MnGeoMap,
  MnGeoMarker,
  MnGeoMarkerContent,
  MnGeoMarkerPopup,
  MnGeoControls,
  MnMeshNetworkCanvas,
  MnMeshNetworkCard,
  MnMeshNetworkToolbar,
  MnSystemStatus,
} from '@/components/maranello';
import type { GeoMapStyleOption } from '@/components/maranello';
import type { MeshNode, Service, Incident } from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import {
  meshNodes,
  meshEdges,
  hubSpokeHub,
  hubSpokeSpokes,
  deployments,
  auditEntries,
  missions,
  nightJobs,
} from './showcase-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/**
 * OpenStreetMap raster tile style — used here only for the showcase demo.
 * Consumers of the framework should supply their own tile provider; OSM's
 * Tile Usage Policy disallows heavy production traffic on tile.openstreetmap.org.
 * Attribution is rendered automatically by MapLibre's attributionControl.
 */
const OSM_LIGHT_STYLE: GeoMapStyleOption = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

const OSM_DARK_STYLE: GeoMapStyleOption = {
  version: 8,
  sources: {
    osmDark: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '© OpenStreetMap contributors · © CARTO',
    },
  },
  layers: [{ id: 'osm-dark', type: 'raster', source: 'osmDark' }],
};

const geoCities = [
  { id: 'ny', lon: -74.006, lat: 40.7128, label: 'New York', tone: 'active' },
  { id: 'ld', lon: -0.1278, lat: 51.5074, label: 'London', tone: 'active' },
  { id: 'tk', lon: 139.6503, lat: 35.6762, label: 'Tokyo', tone: 'warning' },
  { id: 'sg', lon: 103.8198, lat: 1.3521, label: 'Singapore', tone: 'danger' },
] as const;

const mapMarkers = [
  { id: 1, lat: 40.7128, lon: -74.006, label: 'New York', detail: 'US-East-1 · 3 nodes', color: 'active' as const },
  { id: 2, lat: 51.5074, lon: -0.1278, label: 'London', detail: 'EU-West-2 · 2 nodes', color: 'active' as const },
  { id: 3, lat: 35.6762, lon: 139.6503, label: 'Tokyo', detail: 'AP-NE-1 · 2 nodes', color: 'warning' as const },
  { id: 4, lat: -33.8688, lon: 151.2093, label: 'Sydney', detail: 'AP-SE-2 · 1 node', color: 'active' as const },
  { id: 5, lat: 1.3521, lon: 103.8198, label: 'Singapore', detail: 'AP-SE-1 · Offline', color: 'danger' as const },
];

const sampleNode: MeshNode = meshNodes[0];

const systemServices: Service[] = [
  { id: 'api', name: 'API Gateway', status: 'operational', uptime: 99.98, latencyMs: 42 },
  { id: 'mesh', name: 'Mesh Orchestrator', status: 'degraded', uptime: 99.2, latencyMs: 180 },
  { id: 'db', name: 'Primary Database', status: 'operational', uptime: 99.99, latencyMs: 8 },
  { id: 'cache', name: 'Redis Cache', status: 'operational', uptime: 100, latencyMs: 2 },
  { id: 'queue', name: 'Message Queue', status: 'operational', uptime: 99.95, latencyMs: 12 },
];

const systemIncidents: Incident[] = [
  { id: 'inc-1', title: 'Mesh node EU-W2 high latency', date: '2025-07-14', severity: 'degraded', resolved: true },
  { id: 'inc-2', title: 'API rate limit misconfiguration', date: '2025-07-12', severity: 'outage', resolved: true },
];

/** Section: W3 Network & Infrastructure components. */
export function ShowcaseNetwork() {
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);

  return (
    <section aria-labelledby="section-network">
      <h2 id="section-network" className="text-lg font-semibold mb-4">
        W3 — Network & Infrastructure
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-map')} example={`<MnMap markers={markers} />`}>
            <div className="h-80">
              <MnMap markers={mapMarkers} className="h-full rounded-lg" />
            </div>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-geo-map')}
            example={`<MnGeoMap styles={{ light, dark }} viewport={{ center: [0, 30], zoom: 1.5 }}>\n  {/* children: MnGeoControls, MnGeoMarker, MnGeoPopup */}\n</MnGeoMap>`}
          >
            <div className="h-96">
              <MnGeoMap
                styles={{ light: OSM_LIGHT_STYLE, dark: OSM_DARK_STYLE }}
                viewport={{ center: [10, 30], zoom: 1.5 }}
                className="h-full"
              >
                <MnGeoControls showZoom showCompass />
                {geoCities.map((city) => (
                  <MnGeoMarker
                    key={city.id}
                    longitude={city.lon}
                    latitude={city.lat}
                  >
                    <MnGeoMarkerContent ariaLabel={city.label} />
                    <MnGeoMarkerPopup closeButton>
                      <div className="font-semibold">{city.label}</div>
                      <div
                        className="text-xs"
                        style={{ color: 'var(--mn-text-muted)' }}
                      >
                        {city.tone === 'danger'
                          ? 'Offline'
                          : city.tone === 'warning'
                            ? 'Degraded'
                            : 'Operational'}
                      </div>
                    </MnGeoMarkerPopup>
                  </MnGeoMarker>
                ))}
              </MnGeoMap>
            </div>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-geo-marker')}
            example={`<MnGeoMarker longitude={-74} latitude={40.71} onClick={…}>\n  <MnGeoMarkerContent ariaLabel="New York" />\n  <MnGeoMarkerLabel>NYC</MnGeoMarkerLabel>\n</MnGeoMarker>`}
          >
            <p className="text-sm" style={{ color: 'var(--mn-text-muted)' }}>
              Rendered inside the MnGeoMap demo above. Use
              <code> MnGeoMarkerContent</code>, <code>MnGeoMarkerLabel</code>,
              <code> MnGeoMarkerPopup</code>, and <code>MnGeoMarkerTooltip</code>
              as children to customize the marker DOM, label, popup, and hover
              tooltip respectively.
            </p>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-geo-popup')}
            example={`<MnGeoPopup longitude={-74} latitude={40.71} closeButton onClose={…}>\n  Pop-up body\n</MnGeoPopup>`}
          >
            <p className="text-sm" style={{ color: 'var(--mn-text-muted)' }}>
              Standalone coordinate-anchored popup; for a marker-attached popup
              see <code>MnGeoMarkerPopup</code> (demoed inside MnGeoMap above).
            </p>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-geo-controls')}
            example={`<MnGeoControls showZoom showCompass showLocate showFullscreen position="top-right" />`}
          >
            <p className="text-sm" style={{ color: 'var(--mn-text-muted)' }}>
              Keyboard-accessible overlay controls. The <code>showZoom</code>
              and <code>showCompass</code> variants are active in the MnGeoMap
              demo above; toggle additional flags to enable locate and
              fullscreen.
            </p>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-mesh-network')} example={`<MnMeshNetwork nodes={nodes} edges={edges} />`}>
            <MnMeshNetwork nodes={meshNodes} edges={meshEdges} ariaLabel="Convergio mesh topology" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-mesh-network-canvas')} example={`<MnMeshNetworkCanvas nodes={nodes} edges={edges} />`}>
            <div className="h-64">
              <MnMeshNetworkCanvas
                nodes={meshNodes}
                edges={meshEdges}
                selected={selectedNode?.id ?? null}
                onNodeClick={setSelectedNode}
                ariaLabel="Canvas mesh topology"
                maxParticles={20}
                className="h-full"
              />
            </div>
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-mesh-network-toolbar')} example={`<MnMeshNetworkToolbar onlineCount={4} totalCount={6} />`}>
            <MnMeshNetworkToolbar
              onlineCount={meshNodes.filter(n => n.status === 'online').length}
              totalCount={meshNodes.length}
            />
          </ComponentDoc>
        </div>

        <ComponentDoc entry={entry('mn-mesh-network-card')} example={`<MnMeshNetworkCard node={node} onSelect={setSelected} />`}>
          <MnMeshNetworkCard
            node={sampleNode}
            selected={selectedNode?.id === sampleNode.id}
            onSelect={setSelectedNode}
          />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-system-status')} example={`<MnSystemStatus services={svcs} incidents={incs} />`}>
          <MnSystemStatus
            services={systemServices}
            incidents={systemIncidents}
            version="v20.8.0"
            environment="production"
          />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-hub-spoke')} example={`<MnHubSpoke hub={hub} spokes={spokes} />`}>
          <MnHubSpoke hub={hubSpokeHub} spokes={hubSpokeSpokes} ariaLabel="Coordinator hub topology" />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-deployment-table')} example={`<MnDeploymentTable deployments={deps} />`}>
            <MnDeploymentTable deployments={deployments} ariaLabel="Node deployment status" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-audit-log')} example={`<MnAuditLog entries={entries} />`}>
            <MnAuditLog entries={auditEntries} ariaLabel="Platform audit trail" />
          </ComponentDoc>
        </div>

        <ComponentDoc entry={entry('mn-active-missions')} example={`<MnActiveMissions missions={missions} />`}>
          <MnActiveMissions missions={missions} ariaLabel="Current mission status" />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-night-jobs')} example={`<MnNightJobs jobs={jobs} />`}>
          <MnNightJobs jobs={nightJobs} ariaLabel="Scheduled batch operations" />
        </ComponentDoc>
      </div>
    </section>
  );
}
