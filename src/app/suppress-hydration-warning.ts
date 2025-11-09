// Suprimir warnings de hidratación causados por extensiones del navegador
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Hydration') || 
       args[0].includes('hydrated') ||
       args[0].includes('bis_skin_checked'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export {};
