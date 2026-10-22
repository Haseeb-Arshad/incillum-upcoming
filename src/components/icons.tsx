import {
  BadgeCheck,
  BookOpen,
  Building2,
  ClipboardList,
  DraftingCompass,
  FileLock,
  FilePenLine,
  FileStack,
  FileText,
  KeyRound,
  Link2,
  Mail,
  MailCheck,
  MessageSquare,
  MessageSquareText,
  Pause,
  PhoneCall,
  Play,
  ScanSearch,
  ScanText,
  ScrollText,
  Send,
  Sheet,
  Signature,
  Volume2,
  VolumeX,
} from 'lucide-react'

import type { CharlieGlyph, GlassSource, TrustGlyph } from '#/content/site.ts'
import type { LucideIcon } from 'lucide-react'

/**
 * The site's icons: Lucide, the set Studio itself draws with
 * (`@incillum/icons`), at the same release, so an icon here is the icon in the
 * product. Each is imported by name, so only these reach the bundle; one
 * stroke for all of them, and the colour is `currentColor`, so the tile or the
 * line they sit in sets it.
 */
export function Icon({ icon: Glyph, className }: { icon: LucideIcon; className?: string }) {
  return <Glyph aria-hidden="true" focusable="false" strokeWidth={1.5} className={className} />
}

/** The data-and-trust cards. */
export const trustIcons: Record<TrustGlyph, LucideIcon> = {
  training: FileLock,
  sending: MailCheck,
  approval: Signature,
  record: ScrollText,
  source: Link2,
  separate: Building2,
  key: KeyRound,
  test: ScanSearch,
}

/** Charlie's abilities. */
export const abilityIcons: Record<CharlieGlyph, LucideIcon> = {
  read: ScanText,
  cite: Link2,
  make: FileStack,
  tell: MessageSquareText,
  ask: Send,
  call: PhoneCall,
  approve: BadgeCheck,
}

/** The six documents a quotation is assembled from. */
export const sourceIcons: Record<GlassSource, LucideIcon> = {
  request: Mail,
  supplier: Mail,
  drawing: DraftingCompass,
  catalogue: BookOpen,
  prices: Sheet,
  agreement: FilePenLine,
}

/** The contact memo's three steps: a quotation, a call, a case. */
export const stepIcons = {
  quotation: FileText,
  call: MessageSquare,
  case: ClipboardList,
} satisfies Record<string, LucideIcon>

/** The film's own controls on the Charlie page. */
export const reelIcons = {
  play: Play,
  pause: Pause,
  soundOn: Volume2,
  soundOff: VolumeX,
} satisfies Record<string, LucideIcon>
