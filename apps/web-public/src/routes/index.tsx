import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-foreground">Welcome</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Minimal TanStack Start + React landing page template. Replace this with your content.
      </p>
      <a
        href="/sign-in"
        className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Get started
      </a>
    </main>
  )
}
