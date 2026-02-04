// Importación del módulo para inicializar la aplicación Angular de forma standalone
import { bootstrapApplication } from '@angular/platform-browser';
// Importación de la configuración general de la aplicación
import { appConfig } from './app/app.config';
// Importación del componente raíz de la aplicación
import { AppComponent } from './app/app.component';

// Inicialización de la aplicación Angular con el componente principal y su configuración
bootstrapApplication(AppComponent, appConfig)
  // Captura y muestra en consola cualquier error que ocurra durante el arranque de la aplicación
  .catch((err) => console.error(err));