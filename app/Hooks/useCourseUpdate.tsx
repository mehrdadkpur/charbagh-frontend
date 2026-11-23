import { useState } from "react"

export function useCourseUpdate(courseId: string) {
  const [loading, setLoading] = useState(false)

  const update = async (url: string, body: FormData) => {
    try {
      setLoading(true)

      const res = await fetch(url, {
        method: 'PUT',
        body,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      return await res.json()
    } finally {
      setLoading(false)
    }
  }

  return { update, loading }
}
