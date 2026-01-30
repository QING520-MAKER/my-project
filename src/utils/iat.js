import CryptoJS from 'crypto-js'

export class IatWebsocket {
  constructor(config) {
    this.appId = config.appId
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    // Use the specific realtime voice dictation URL provided by user
    this.url = 'wss://iat-api.xfyun.cn/v2/iat'
    this.socket = null
    this.status = 'init' // init, recording, finished
    this.onTextChange = null // callback(text, isLast)
    this.onError = null
    this.onClose = null
  }

  getAuthUrl() {
    const host = 'iat-api.xfyun.cn'
    const date = new Date().toUTCString()
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
    
    return `${this.url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`
  }

  connect() {
    try {
      const url = this.getAuthUrl()
      this.socket = new WebSocket(url)
      this.status = 'init'

      this.socket.onopen = () => {
        this.status = 'connected'
      }

      this.socket.onmessage = (e) => {
        this.handleMessage(e.data)
      }

      this.socket.onerror = (e) => {
        this.status = 'error'
        if (this.onError) this.onError(e)
      }

      this.socket.onclose = () => {
        this.status = 'closed'
        if (this.onClose) this.onClose()
      }
    } catch (e) {
      if (this.onError) this.onError(e)
    }
  }

  handleMessage(data) {
    try {
      const jsonData = JSON.parse(data)
      if (jsonData.code !== 0) {
        if (this.onError) this.onError(new Error(`IAT Error ${jsonData.code}: ${jsonData.message}`))
        this.socket.close()
        return
      }

      if (jsonData.data && jsonData.data.result) {
        let text = ''
        const ws = jsonData.data.result.ws
        ws.forEach(item => {
          item.cw.forEach(w => {
            text += w.w
          })
        })
        
        // Check if this is the last sentence
        const isLast = jsonData.data.status === 2
        
        if (this.onTextChange) {
          this.onTextChange(text, isLast)
        }
      }
    } catch (e) {
      console.error('Failed to parse IAT message:', e)
    }
  }

  sendAudio(audioData, status) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return

    // status: 0=first frame, 1=intermediate frame, 2=last frame
    
    const payload = {
      common: {
        app_id: this.appId
      },
      business: {
        language: 'zh_cn',
        domain: 'iat',
        accent: 'mandarin',
        vad_eos: 5000,
        dwa: 'wpgs' // dynamic correction
      },
      data: {
        status: status,
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: this.toBase64(audioData)
      }
    }

    this.socket.send(JSON.stringify(payload))
  }

  toBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer.buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  close() {
    if (this.socket) {
      this.socket.close()
    }
  }
}
