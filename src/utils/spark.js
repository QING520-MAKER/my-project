import CryptoJS from 'crypto-js'

export class SparkWebsocket {
  constructor(config) {
    this.appId = config.appId
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.url = config.url || 'wss://sparkcube-api.xf-yun.com/v1/customize'
    this.socket = null
    this.onMessage = null
    this.onError = null
    this.onClose = null
    this.onOpen = null
  }

  // Generate the signed URL
  getAuthUrl() {
    const host = new URL(this.url).host
    const path = new URL(this.url).pathname
    const date = new Date().toUTCString()
    
    const builder = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
    
    const signatureOrigin = builder
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
    
    return `${this.url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`
  }

  connect() {
    try {
      const url = this.getAuthUrl()
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        if (this.onOpen) this.onOpen()
      }

      this.socket.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          if (this.onMessage) this.onMessage(response)
        } catch (e) {
          console.error('Error parsing response:', e)
          if (this.onError) this.onError(e)
        }
      }

      this.socket.onerror = (error) => {
        if (this.onError) this.onError(error)
      }

      this.socket.onclose = () => {
        if (this.onClose) this.onClose()
      }
    } catch (e) {
      if (this.onError) this.onError(e)
    }
  }

  // Send a message
  send(messages, userId = 'user_001') {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open')
      return
    }

    const payload = {
      header: {
        app_id: this.appId,
        uid: userId
      },
      parameter: {
        chat: {
          domain: 'general', // You might need to change this based on the specific customization
          temperature: 0.5,
          max_tokens: 2048
        }
      },
      payload: {
        message: {
          text: messages
        }
      }
    }

    this.socket.send(JSON.stringify(payload))
  }

  close() {
    if (this.socket) {
      this.socket.close()
    }
  }
}
