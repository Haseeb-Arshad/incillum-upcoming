import { people } from '#/content/site.ts'
import { cn } from '#/lib/cn.ts'

import type { PersonKey } from '#/content/site.ts'

/**
 * A person in the example quotation, as a portrait.
 *
 * The portraits are `public/people` (`people` in `content/site.ts` says whose
 * they are and where they came from): illustrated line drawings in the site's
 * ink, on the sunken paper. They are decorative to a screen reader, because
 * the name is always set beside them, and they are the one kind of image the
 * product scenes draw. Whatever image a person's `portrait` points at is
 * shown as given, so a photograph can replace one without touching a scene.
 */
export function Avatar({ person, className }: { person: PersonKey; className?: string }) {
  return (
    <img
      src={people[person].portrait}
      alt=""
      width={96}
      height={96}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn('avatar', className)}
    />
  )
}
