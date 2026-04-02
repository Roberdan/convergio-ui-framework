'use client';

import {
  MnChart, MnGauge, MnSpeedometer, MnFunnel, MnHbar,
  MnGantt, MnKanbanBoard, MnMap,
  MnManettino, MnCruiseLever, MnToggleLever, MnSteppedRotary,
} from '@/components/maranello';
import {
  chartSeries, chartLabels, funnelData, hbarItems,
  ganttTasks, kanbanColumns, kanbanCards, mapMarkers,
} from './components-data';

function Card({ name, desc, children, wide }: { name: string; desc: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 space-y-3 ${wide ? 'md:col-span-2' : ''}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SectionCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-chart" desc="Multi-type chart: bar, area, sparkline, donut, radar, bubble">
        <div className="h-64">
          <MnChart type="bar" series={chartSeries} labels={chartLabels} showLegend animate />
        </div>
      </Card>

      <Card name="mn-gauge" desc="Analogue gauge with ticks, needle, and arc bar">
        <div className="flex justify-center">
          <MnGauge value={73} min={0} max={100} unit="%" label="CPU Load" size="md" animate />
        </div>
      </Card>

      <Card name="mn-speedometer" desc="Canvas-rendered speedometer with animated needle">
        <div className="flex justify-center">
          <MnSpeedometer value={6200} max={9000} unit="RPM" ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000]} animate />
        </div>
      </Card>

      <Card name="mn-funnel" desc="Sales/conversion funnel visualization">
        <MnFunnel data={funnelData} showConversion animate size="full" />
      </Card>

      <Card name="mn-hbar" desc="Horizontal bar chart with labels and values">
        <MnHbar bars={hbarItems} title="Tasks by Model" unit="tasks" showValues animate size="full" />
      </Card>

      <Card name="mn-gantt" desc="Gantt chart timeline with task dependencies" wide>
        <div className="overflow-auto">
          <MnGantt tasks={ganttTasks} showToday />
        </div>
      </Card>

      <Card name="mn-kanban-board" desc="Drag-and-drop kanban board" wide>
        <div className="overflow-x-auto">
          <MnKanbanBoard columns={kanbanColumns} cards={kanbanCards} />
        </div>
      </Card>

      <Card name="mn-map" desc="Canvas world map with interactive markers">
        <div className="h-64">
          <MnMap markers={mapMarkers} zoom={2} center={[46, 8]} enableZoom enablePan />
        </div>
      </Card>

      <Card name="mn-ferrari-control" desc="Manettino, cruise lever, toggle lever, stepped rotary">
        <div className="flex flex-wrap items-end gap-8">
          <MnManettino label="Mode" size="md" />
          <MnCruiseLever label="Speed" size="md" />
          <MnToggleLever label="Brake Bias" size="md" />
          <MnSteppedRotary label="Diff" size="md" />
        </div>
      </Card>
    </div>
  );
}
