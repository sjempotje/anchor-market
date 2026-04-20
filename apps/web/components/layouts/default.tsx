export default function DefaultContainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1350px] px-4 lg:px-6">{children}</div>
    </div>
  )
}
