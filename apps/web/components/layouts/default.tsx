export default function DefaultContainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col pt-4 md:pt-6">
      <div className="mx-auto flex w-full max-w-[1350px] flex-1 flex-col px-4 lg:px-6">
        {children}
      </div>
    </div>
  )
}
