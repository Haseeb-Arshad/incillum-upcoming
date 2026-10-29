import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  CirclePause,
  ClipboardList,
  Cpu,
  DoorOpen,
  DraftingCompass,
  FileLock,
  FilePenLine,
  FileStack,
  FileText,
  Hand,
  Handshake,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  MailCheck,
  MessageSquare,
  MessageSquareText,
  MousePointer2,
  Pause,
  PhoneCall,
  Play,
  Plug,
  ScanSearch,
  ScanText,
  ScrollText,
  Send,
  Sheet,
  ShieldCheck,
  Signature,
  TrendingDown,
  Users,
  Volume2,
  VolumeX,
  X,
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
export function Icon({
  icon: Glyph,
  className,
}: {
  icon: LucideIcon
  className?: string
}) {
  return (
    <Glyph aria-hidden="true" focusable="false" strokeWidth={1.5} className={className} />
  )
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

/** The showcase and the trust diagram: a source, a check, the pointer, a held line, the boundary and the way out. */
export const showcaseIcons = {
  source: Link2,
  check: Check,
  pointer: MousePointer2,
  held: Hand,
  falling: TrendingDown,
  lock: LockKeyhole,
  training: Cpu,
  never: X,
  people: Users,
  onward: ArrowRight,
} satisfies Record<string, LucideIcon>

/** The page's own furniture: the way back to the top. */
export const chromeIcons = {
  top: ArrowUp,
} satisfies Record<string, LucideIcon>

/** The questions: who it is for, what it sends, who it asks, what it holds, what it keeps, what it joins, how to start. */
export const questionIcons = {
  who: Users,
  sends: Send,
  suppliers: Handshake,
  held: CirclePause,
  training: ShieldCheck,
  systems: Plug,
  access: DoorOpen,
} satisfies Record<string, LucideIcon>

/** The film's own controls on the Charlie page. */
export const reelIcons = {
  play: Play,
  pause: Pause,
  soundOn: Volume2,
  soundOff: VolumeX,
} satisfies Record<string, LucideIcon>
