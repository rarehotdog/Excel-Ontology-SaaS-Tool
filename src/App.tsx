import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataSources } from './components/DataSources';
import { Pipeline } from './components/Pipeline';
import { OntologyView } from './components/OntologyView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExportsView } from './components/ExportsView';
import { SettlementView } from './components/SettlementView';
import { SmartTransformView } from './components/SmartTransformView';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'sources' | 'pipeline' | 'ontology' | 'analytics' | 'exports' | 'reconciliation' | 'smart'>('dashboard');
  // ... (existing state)

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-hidden">
        {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}
        {activeView === 'sources' && <DataSources />}
        {activeView === 'smart' && <SmartTransformView />}
        {activeView === 'reconciliation' && <SettlementView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'exports' && <ExportsView />}
      </main>
    </div>
  );
}