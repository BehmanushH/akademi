'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle2 } from 'lucide-react'

export default function QuickCapture({ userId }: { userId: string }) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function capture(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    await supabase.from('ideas').insert({ user_id: userId, content: text.trim() })
    setText('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section>
      <h2 className="section-title mb-3">Quick Capture</h2>
      <form onSubmit={capture} className="card flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="input-base flex-1"
          placeholder="Capture a thought..."
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary flex items-center gap-1.5 shrink-0"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Capture'}
        </button>
      </form>
    </section>
  )
}
