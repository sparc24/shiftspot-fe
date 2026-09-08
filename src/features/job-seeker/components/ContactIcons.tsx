interface IconProps {
  className?: string
}

// Hand-written inline SVGs — no icon library dependency for two glyphs.
// aria-hidden + focusable="false" so they never enter the tab order or the
// accessible name; `fill="currentColor"` inherits the surrounding text color.
export function PhoneIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
    </svg>
  )
}

export function MailIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13zm2.2.5 6.3 5.25a.75.75 0 0 0 .96 0L18.8 6H5.2zM5 8.1V18h14V8.1l-6.34 5.28a2.25 2.25 0 0 1-2.87 0L5 8.1z" />
    </svg>
  )
}
