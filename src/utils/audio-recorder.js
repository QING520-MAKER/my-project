// Audio Recorder Utility for capturing microphone input
export class AudioRecorder {
  constructor(sampleRate = 16000) {
    this.sampleRate = sampleRate
    this.mediaStream = null
    this.audioContext = null
    this.source = null
    this.processor = null
    this.onDataAvailable = null
    this.onError = null
  }

  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16
        }
      })

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      })

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
      
      // Create script processor for raw audio access
      // bufferSize: 4096 (must be power of 2)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

      this.processor.onaudioprocess = (e) => {
        if (!this.onDataAvailable) return

        const inputData = e.inputBuffer.getChannelData(0)
        // Convert float32 audio to int16
        const buffer = this.transAudioData(inputData)
        this.onDataAvailable(buffer)
      }

      this.source.connect(this.processor)
      this.processor.connect(this.audioContext.destination)

    } catch (e) {
      console.error('Failed to start recording:', e)
      if (this.onError) this.onError(e)
    }
  }

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }

    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  // Convert Float32Array to Int16Array (PCM 16-bit)
  transAudioData(inputData) {
    // Downsample if needed (not strictly necessary if context is 16k)
    // Here we just convert format
    let data = new Float32Array(inputData)
    let out = new Int16Array(data.length)
    
    for (let i = 0; i < data.length; i++) {
      let s = Math.max(-1, Math.min(1, data[i]))
      s = s < 0 ? s * 0x8000 : s * 0x7FFF
      out[i] = s
    }
    
    return out
  }
}
