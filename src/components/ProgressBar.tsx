interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
  overdueCount?: number;
}

export default function ProgressBar({ completedCount, totalCount, overdueCount = 0 }: ProgressBarProps) {
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        height: '8px',
        marginBottom: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: overdueCount > 0 ? '#FEF2F2' : 'white',
          height: '100%',
          width: `${progressPercentage}%`,
          transition: 'width 0.3s ease',
          position: 'relative'
        }}>
          {overdueCount > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: '4px',
              backgroundColor: '#EF4444',
              animation: 'pulse 2s infinite'
            }} />
          )}
        </div>
      </div>

      <div style={{
        color: 'white',
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        {completedCount} of {totalCount} tasks completed ({Math.round(progressPercentage)}%)
        {overdueCount > 0 && (
          <span style={{ color: '#FEE2E2', marginLeft: '8px' }}>
            • {overdueCount} overdue
          </span>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}
