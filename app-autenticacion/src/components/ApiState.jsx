// Reutilizable: spinner de carga y pantalla de error para todas las páginas
export function LoadingState({ message = "Cargando información..." }) {
  return (
    <div className="api-state">
      <div className="api-spinner" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="api-state api-error">
      <span className="api-error-icon">⚠</span>
      <p>{message}</p>
      {onRetry && (
        <button className="btn-outline" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}