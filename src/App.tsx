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

export type ViewType = 'dashboard' | 'sources' | 'pipeline' | 'ontology' | 'analytics' | 'exports' | 'settlement' | 'smart';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveView('analytics');
  };

  const handleNavigate = (view: string) => {
    setActiveView(view as ViewType);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-hidden">
        {activeView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {activeView === 'sources' && (
          <DataSources onAnalyzeComplete={handleAnalysisComplete} />
        )}
        {activeView === 'pipeline' && <SmartTransformView />}
        {activeView === 'smart' && <SmartTransformView />}
        {activeView === 'settlement' && <SettlementView />}
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
