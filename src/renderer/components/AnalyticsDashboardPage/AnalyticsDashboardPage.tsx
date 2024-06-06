import { Download } from 'lucide-react';
import { Button } from '../ui/button';

interface AnalyticsDashboardPageProps {}
const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({}) => {
  const onExportLinkedinAnalytics = () => {
    window.electron.ipcRenderer.sendMessage('exportLinkedinAnalytics');
  };
  const onExportTwitterAnalytics = () => {
    window.electron.ipcRenderer.sendMessage('exportTwitterAnalytics');
  };
  return (
    <div>
      <div className="mt-4">
        <Button onClick={onExportLinkedinAnalytics} variant="outline">
          <Download className="mr-2" />
          <span>Export Linkedin Analytics</span>
        </Button>
        <Button onClick={onExportTwitterAnalytics} variant="outline">
          <Download className="mr-2" />
          <span>Export Twitter Analytics</span>
        </Button>
      </div>
    </div>
  );
};
export default AnalyticsDashboardPage;
