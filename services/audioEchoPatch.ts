/**
 * AudioContext-Patch: Verhindert Mikrofon-Echo in LiveSession.
 *
 * Problem: LiveSession.tsx (FROZEN) verbindet einen ScriptProcessor
 * mit inputCtx.destination (Zeile 814), was Mikrofon-Audio an die
 * Lautsprecher routet → User hört sich selbst + TTS doppelt.
 *
 * Fix: Für Input-Kontexte (sampleRate=16000) wird connect(destination)
 * auf einen stummen GainNode umgeleitet. Der ScriptProcessor feuert
 * weiterhin onaudioprocess-Events (für Deepgram), aber kein Audio
 * geht an die Lautsprecher.
 */
export function patchAudioContextForEchoCancel(): void {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return;

  const origCreate = Ctx.prototype.createScriptProcessor;

  Ctx.prototype.createScriptProcessor = function (
    this: AudioContext,
    bufferSize?: number,
    inputChannels?: number,
    outputChannels?: number,
  ): ScriptProcessorNode {
    const processor = origCreate.call(this, bufferSize, inputChannels, outputChannels);
    const ctx = this;

    // Nur Input-Kontexte patchen (16kHz = Deepgram-Aufnahme-Kontext)
    if (ctx.sampleRate <= 16000) {
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      silentGain.connect(ctx.destination);

      const origConnect = processor.connect.bind(processor);
      (processor as any).connect = function (dest: any, ...args: any[]) {
        if (dest === ctx.destination) {
          return origConnect(silentGain, ...args);
        }
        return origConnect(dest, ...args);
      };
    }

    return processor;
  };
}
