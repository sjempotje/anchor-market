export function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {title && (
        <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      )}
      {children}
    </div>
  )
}
