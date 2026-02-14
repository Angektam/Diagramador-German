import { Component, signal, inject, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
import { ChatAssistantService } from '../../services/chat-assistant.service';
import { DiagramWizardComponent } from '../diagram-wizard/diagram-wizard.component';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, DiagramWizardComponent],
  template: `
    @if (isOpen()) {
      <div class="assistant-modal-overlay" (click)="onOverlayClick($event)">
        <div class="assistant-modal" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="assistant-header">
            <div class="header-content">
              <span class="icon">🧙‍♂️</span>
              <div class="header-text">
                <span class="title">Asistente de Diagramas</span>
                <span class="subtitle">Chat & Wizard</span>
              </div>
            </div>
            <button class="close-btn" (click)="close()">×</button>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button class="tab" [class.active]="activeTab() === 'chat'" (click)="activeTab.set('chat')">
              💬 Chat
            </button>
            <button class="tab" [class.active]="activeTab() === 'wizard'" (click)="activeTab.set('wizard'); wizard.open()">
              🎨 Wizard
            </button>
          </div>

          <!-- Chat Tab -->
          <div *ngIf="activeTab() === 'chat'" class="tab-content chat-content">
            <div class="messages-container" #messagesContainer>
              <div *ngFor="let msg of messages()" 
                   class="message" 
                   [class.user-message]="msg.sender === 'user'"
                   [class.assistant-message]="msg.sender === 'assistant'">
                <div class="message-content">
                  <div class="message-text">{{ msg.text }}</div>
                  <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                </div>
                
                <!-- Sugerencias rápidas -->
                <div class="suggestions" *ngIf="msg.suggestions && msg.suggestions.length > 0">
                  <button *ngFor="let suggestion of msg.suggestions" 
                          class="suggestion-btn"
                          (click)="handleSuggestion(suggestion)">
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="input-area">
              <input 
                type="text" 
                [(ngModel)]="userInput"
                (keyup.enter)="sendMessage()"
                (keydown.space)="$event.stopPropagation()"
                placeholder="Escribe tu mensaje o comando..."
                class="chat-input"
                autocomplete="off"
              />
              <button (click)="sendMessage()" class="send-btn" [disabled]="!userInput.trim()">
                Enviar
              </button>
            </div>
          </div>

          <!-- Wizard Tab -->
          <div *ngIf="activeTab() === 'wizard'" class="tab-content wizard-content">
            <app-diagram-wizard #wizard></app-diagram-wizard>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .assistant-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .assistant-modal {
      width: 700px;
      max-width: 90vw;
      height: 600px;
      max-height: 85vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .assistant-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .icon {
      font-size: 32px;
    }

    .title {
      font-weight: 600;
      font-size: 18px;
    }

    .subtitle {
      font-size: 12px;
      opacity: 0.9;
    }

    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .tabs {
      display: flex;
      border-bottom: 2px solid #e9ecef;
      background: #f8f9fa;
    }

    .tab {
      flex: 1;
      padding: 14px 20px;
      background: transparent;
      border: none;
      color: #6c757d;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 3px solid transparent;
    }

    .tab:hover {
      background: rgba(102, 126, 234, 0.05);
      color: #667eea;
    }

    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: white;
    }

    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-content {
      background: white;
    }

    .wizard-content {
      background: #f8f9fa;
      overflow-y: auto;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-message {
      align-items: flex-end;
    }

    .assistant-message {
      align-items: flex-start;
    }

    .message-content {
      max-width: 75%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message-text {
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 14px;
      white-space: pre-line;
      word-wrap: break-word;
    }

    .user-message .message-text {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .assistant-message .message-text {
      background: #f1f3f5;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      padding: 0 4px;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .suggestion-btn {
      background: white;
      border: 1px solid #667eea;
      color: #667eea;
      padding: 8px 14px;
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
    }

    .input-area {
      display: flex;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #e9ecef;
      background: white;
    }

    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: #667eea;
    }

    .send-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: #5568d3;
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .messages-container::-webkit-scrollbar,
    .wizard-content::-webkit-scrollbar {
      width: 8px;
    }

    .messages-container::-webkit-scrollbar-track,
    .wizard-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .messages-container::-webkit-scrollbar-thumb,
    .wizard-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover,
    .wizard-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class ChatAssistantComponent {
  private diagramService = inject(DiagramService);
  private assistantService = inject(ChatAssistantService);
  
  @ViewChild('wizard') wizard!: DiagramWizardComponent;
  
  messages = signal<ChatMessage[]>([]);
  userInput = '';
  isOpen = signal(false);
  activeTab = signal<'chat' | 'wizard'>('chat');

  constructor() {
    // Mensaje de bienvenida
    this.addAssistantMessage(
      '¡Hola! 🧙‍♂️ Soy tu asistente de diagramas. Puedo ayudarte mediante chat o con el wizard guiado.',
      ['Usar Wizard', 'Ver comandos', 'Ayuda']
    );
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('assistant-modal-overlay')) {
      this.close();
    }
  }

  sendMessage() {
    const text = this.userInput.trim();
    
    // Validación de mensaje vacío
    if (!text) {
      return;
    }

    // Validación de longitud máxima
    if (text.length > 1000) {
      this.addAssistantMessage('El mensaje es demasiado largo. Por favor, usa menos de 1000 caracteres.');
      return;
    }

    // Validación de caracteres peligrosos (XSS prevention)
    const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
    if (dangerousPattern.test(text)) {
      this.addAssistantMessage('El mensaje contiene contenido no permitido.');
      return;
    }

    // Agregar mensaje del usuario
    this.addUserMessage(text);
    this.userInput = '';

    // Procesar comando
    setTimeout(() => this.processCommand(text), 300);
  }

  handleSuggestion(suggestion: string) {
    // Si la sugerencia es "Usar Wizard", cambiar a tab wizard
    if (suggestion === 'Usar Wizard') {
      this.activeTab.set('wizard');
      setTimeout(() => {
        if (this.wizard) {
          this.wizard.open();
        }
      }, 100);
      return;
    }
    
    this.userInput = suggestion;
    this.sendMessage();
  }

  private addUserMessage(text: string) {
    this.messages.update(msgs => [...msgs, {
      id: this.generateId(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
    this.scrollToBottom();
  }

  private addAssistantMessage(text: string, suggestions?: string[]) {
    this.messages.update(msgs => [...msgs, {
      id: this.generateId(),
      text,
      sender: 'assistant',
      timestamp: new Date(),
      suggestions
    }]);
    this.scrollToBottom();
  }

  private processCommand(input: string) {
    const response = this.assistantService.processCommand(input);
    
    // Ejecutar acción si existe
    if (response.action) {
      response.action();
    }
    
    // Agregar respuesta del asistente
    this.addAssistantMessage(response.message, response.suggestions);
  }

  private generateId(): string {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
