import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  const heights: Record<string, number> = { sm: 50, md: 48, lg: 56 }
  const h = heights[size]
  const w = h * 2.28

  return (
    <Link href="/" className="flex items-center shrink-0" style={{ height: h }} aria-label="Rankify">
      <div
        style={{
          width: w,
          height: h,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Image
          src="/assets/logo-rankify.png"
          alt="Rankify"
          fill
          sizes={`${Math.round(w)}px`}
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
          }}
          priority
        />
      </div>
    </Link>
  )
}
