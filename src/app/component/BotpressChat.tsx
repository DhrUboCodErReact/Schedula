// app/component/BotpressChat.tsx
'use client'

import { useEffect } from 'react'

export default function BotpressChat() {
  useEffect(() => {
    const script1 = document.createElement('script')
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.2/inject.js'
    script1.defer = true
    document.body.appendChild(script1)

    const script2 = document.createElement('script')
    script2.src = 'https://files.bpcontent.cloud/2025/08/08/07/20250808073944-AH3HFMAV.js' // Your custom config
    script2.defer = true
    document.body.appendChild(script2)

    return () => {
      document.body.removeChild(script1)
      document.body.removeChild(script2)
    }
  }, [])

  return null
}
