import React, { useState } from 'react';
import { Stars, Maximize2, Minimize2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VisualizationArea({ chartUrl }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    // Force re-render by appending timestamp
    const img = document.querySelector('.chart-image');
    if (img) {
      img.src = chartUrl + '?t=' + Date.now();
    }
  };

  // No chart available - show placeholder
  if (!chartUrl) {
    return (
      <div className="hidden lg:flex w-80 xl:w-96 bg-slate-900/30 backdrop-blur-sm border-l border-purple-400/20 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-400/20">
          <div className="flex items-center gap-2">
            <Stars className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-200 font-semibold">Birth Chart</h3>
          </div>
        </div>
        
        {/* Placeholder content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 rounded-full bg-purple-500/10 border border-purple-400/20 flex items-center justify-center mb-4">
            <Stars className="w-12 h-12 text-purple-400/50" />
          </div>
          <h4 className="text-purple-200 font-medium mb-2">Your Birth Chart</h4>
          <p className="text-purple-300/50 text-sm max-w-xs">
            Send a message to MIRA and your personalized astrology chart will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Expanded overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10 z-10"
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
            <object
              data={chartUrl}
              type="image/svg+xml"
              className="w-[80vw] h-[75vh] max-w-4xl"
            >
              <img
                src={chartUrl}
                alt="Astrology Birth Chart"
                className="w-full h-full object-contain"
              />
            </object>
          </div>
        </div>
      )}

      {/* Chart panel */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-slate-900/30 backdrop-blur-sm border-l border-purple-400/20 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-200 font-semibold">Birth Chart</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
              onClick={() => setIsExpanded(true)}
              title="Expand chart"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
              onClick={() => window.open(chartUrl, '_blank')}
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Chart content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="relative bg-white/5 rounded-lg border border-purple-400/20 overflow-hidden">
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <span className="text-purple-300 text-sm">Loading chart...</span>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 z-10">
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <Stars className="w-8 h-8 text-purple-400/50" />
                  <p className="text-purple-300 text-sm">Failed to load chart</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-300 hover:text-purple-200"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            {/* Chart image */}
            <img
              src={chartUrl}
              alt="Astrology Birth Chart"
              className={cn(
                "chart-image w-full h-auto cursor-pointer transition-opacity",
                isLoading && "opacity-0",
                hasError && "opacity-30"
              )}
              onClick={() => setIsExpanded(true)}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
          
          {/* Chart info */}
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-400/20">
            <p className="text-purple-200 text-sm font-medium mb-1">Your Natal Chart</p>
            <p className="text-purple-300/60 text-xs">
              This chart shows the positions of celestial bodies at the moment of your birth.
              Click the chart to view it in full size.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
