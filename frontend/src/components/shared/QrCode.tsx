import React, { useMemo } from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  showCenterLogo?: boolean;
}

/**
 * Deterministic, vector-crisp QR code simulation/generator with high-contrast finder patterns
 * and central NexoCaja branding icon, matching Banco Pichincha and Produbanco receipt style.
 */
export const QrCode: React.FC<QrCodeProps> = ({
  value,
  size = 140,
  className = '',
  showCenterLogo = true,
}) => {
  const matrix = useMemo(() => {
    // 25x25 matrix
    const N = 25;
    const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // Standard QR Finder patterns (7x7 at top-left, top-right, bottom-left)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0); // Top-left
    drawFinder(N - 7, 0); // Top-right
    drawFinder(0, N - 7); // Bottom-left

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Deterministic pseudo-random payload pattern based on hash of string
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }

    const isReserved = (r: number, c: number) => {
      if (r < 8 && c < 8) return true; // Top-left finder + separator
      if (r < 8 && c >= N - 8) return true; // Top-right finder + separator
      if (r >= N - 8 && c < 8) return true; // Bottom-left finder + separator
      if (r === 6 || c === 6) return true; // Timing lines
      if (showCenterLogo && r >= 10 && r <= 14 && c >= 10 && c <= 14) return true; // Center icon zone
      return false;
    };

    let seed = hash;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!isReserved(r, c)) {
          seed = (seed * 1103515245 + 12345) >>> 0;
          grid[r][c] = (seed % 100) < 45; // ~45% module density
        }
      }
    }

    return grid;
  }, [value, showCenterLogo]);

  const N = matrix.length;
  const cellSize = size / N;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-xs border border-slate-100 ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges"
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0F172A"
              />
            );
          }),
        )}
      </svg>

      {showCenterLogo && (
        <div
          className="absolute inset-0 m-auto flex items-center justify-center rounded-md bg-white p-1 shadow-sm border border-slate-200"
          style={{ width: size * 0.22, height: size * 0.22 }}
        >
          <div className="w-full h-full rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
            <span>NC</span>
          </div>
        </div>
      )}
    </div>
  );
};
