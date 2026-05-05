import React from 'react';

export default function Rules() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Usamos un iframe para renderizar el PDF que pusimos en la carpeta public */}
      <iframe
        src="/../public/King and Peasant rulebook.pdf"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="King and Peasant - Reglas del Juego"
      >
        <p>
          Tu navegador no soporta la visualización de PDFs. 
          Puedes descargar las reglas aquí: <a href="/packages/client/public/King and Peasant rulebook.pdf">Descargar PDF</a>.
        </p>
      </iframe>
    </div>
  );
}