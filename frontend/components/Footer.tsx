import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Split Duel. All rights reserved.
    </footer>
  )
}
