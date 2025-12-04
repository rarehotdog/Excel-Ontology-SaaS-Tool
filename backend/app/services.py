from app.core.processor import DataProcessor
from app.core.agent import LLMAgent
from app.core.etl_pipeline import ETLPipeline
from app.core.anomaly import AnomalyDetector
from app.core.reconciliation import Reconciler
from app.core.smart_transformer import SmartTransformer
from app.core.analytics_engine import AnalyticsEngine
from app.core.lineage import LineageTracker
from app.core.dictionary import DataDictionary
from app.core.settlement import FranchiseSettlement, BizSettlement
from app.core.ontology import OntologyEngine

# Global State / Singletons
processor = DataProcessor()
agent = LLMAgent()
etl = ETLPipeline()
anomaly_detector = AnomalyDetector()
reconciler = Reconciler()
smart_transformer = SmartTransformer()
analytics_engine = AnalyticsEngine()
lineage_tracker = LineageTracker()
data_dictionary = DataDictionary()
franchise_settlement = FranchiseSettlement()
biz_settlement = BizSettlement()
ontology_engine = OntologyEngine()
