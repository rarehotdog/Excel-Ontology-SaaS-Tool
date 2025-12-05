import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

// URL path와 ViewType 매핑
const pathToView: Record<string, ViewType> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/sources': 'sources',
  '/smart': 'smart',
  '/pipeline': 'pipeline',
  '/settlement': 'settlement',
  '/analytics': 'analytics',
  '/exports': 'exports',
};

const viewToPath: Record<ViewType, string> = {
  'dashboard': '/dashboard',
  'sources': '/sources',
  'smart': '/smart',
  'pipeline': '/pipeline',
  'ontology': '/ontology',
  'settlement': '/settlement',
  'analytics': '/analytics',
  'exports': '/exports',
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<any>(null);

  // URL에서 현재 view 결정
  const activeView: ViewType = pathToView[location.pathname] || 'dashboard';

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    navigate('/analytics');
  };

  const handleNavigate = (view: string) => {
    navigate(viewToPath[view as ViewType] || '/dashboard');
  };

  const handleViewChange = (view: ViewType) => {
    navigate(viewToPath[view]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard onNavigate={handleNavigate} />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
          <Route path="/sources" element={<DataSources onAnalyzeComplete={handleAnalysisComplete} />} />
          <Route path="/smart" element={<SmartTransformView />} />
          <Route path="/pipeline" element={<SmartTransformView />} />
          <Route path="/settlement" element={<SettlementView />} />
          <Route path="/analytics" element={
            <AnalyticsView 
              insights={analysisData?.insights} 
              trendData={analysisData?.trend_data}
              kpiMetrics={analysisData?.kpi_metrics}
              chartMetadata={analysisData?.chart_metadata}
              transform_suggestions={analysisData?.transform_suggestions}
              future_predictions={analysisData?.future_predictions}
              ai_focus_points={analysisData?.ai_focus_points}
            />
          } />
          <Route path="/exports" element={<ExportsView />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
