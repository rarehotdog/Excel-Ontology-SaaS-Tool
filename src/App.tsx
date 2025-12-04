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
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveView('analytics');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-hidden">
        {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}
        {activeView === 'sources' && (
          <DataSources onAnalyzeComplete={handleAnalysisComplete} />
        )}
        {activeView === 'smart' && <SmartTransformView />}
        {activeView === 'reconciliation' && <SettlementView />}
        {activeView === 'analytics' && (
          <AnalyticsView 
            insights={analysisData?.insights} 
            trendData={analysisData?.trend_data}
            kpiMetrics={analysisData?.kpi_metrics}
            chartMetadata={analysisData?.chart_metadata}
          />
        )}
        {activeView === 'exports' && <ExportsView />}
      </main>
    </div>
  );
}