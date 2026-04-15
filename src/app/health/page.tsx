export const dynamic = 'force-static';

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">System Healthy</h1>
        <p className="text-muted-foreground">All services are operational</p>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Status: <span className="text-green-400 font-medium">OK</span></p>
          <p className="mt-1">Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}
