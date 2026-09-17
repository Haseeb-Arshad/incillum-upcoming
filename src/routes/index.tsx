import { createFileRoute } from '@tanstack/react-router'
import { LaunchPage } from '#/components/launch-page.tsx'
import { seoTags } from '#/lib/seo.ts'

export const Route = createFileRoute('/')({
  head: () => ({ links: seoTags().links }),
  component: LaunchPage,
})
