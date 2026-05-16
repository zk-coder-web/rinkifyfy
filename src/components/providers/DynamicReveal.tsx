'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const revealSelector = [
  '.animate-item',
  'main > section',
  'main > div',
  'section > div > div',
  'button',
  'a',
  '.glass',
  '.rankify-hero-card',
  '.rankify-hero-visual',
  '.rankify-flow-intro',
  '.rankify-flow-shell',
  '.rankify-practice-card',
  '.rankify-space-stage',
  '.stat-card',
  '.notif-card',
].join(',')

function isRevealable(element: Element) {
  if (!(element instanceof HTMLElement)) return false
  if (element.closest('.rankify-entry-splash')) return false
  if (element.closest('[data-rankify-no-reveal]')) return false

  const rect = element.getBoundingClientRect()
  return rect.width > 8 && rect.height > 8
}

export function DynamicReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const allItems = Array.from(document.querySelectorAll<HTMLElement>(revealSelector))
      .filter(isRevealable)
      .filter((item, index, list) => !list.some((other, otherIndex) => otherIndex !== index && other.contains(item) && other.matches('.animate-item')))

    allItems.forEach((item) => {
      item.classList.remove('visible')
      item.classList.add('rankify-reveal-item')
    })

    if (reduceMotion) {
      allItems.forEach((item) => item.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        visibleEntries.forEach((entry, index) => {
          const item = entry.target as HTMLElement
          item.style.setProperty('--rankify-reveal-delay', `${Math.min(index, 8) * 70}ms`)
          item.classList.add('visible')
          observer.unobserve(item)
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    allItems.forEach((item) => observer.observe(item))

    const firstScreenTimer = window.setTimeout(() => {
      allItems
        .filter((item) => item.getBoundingClientRect().top < window.innerHeight * 0.86)
        .forEach((item, index) => {
          item.style.setProperty('--rankify-reveal-delay', `${Math.min(index, 8) * 70}ms`)
          item.classList.add('visible')
          observer.unobserve(item)
        })
    }, 90)

    const failSafeTimer = window.setTimeout(() => {
      allItems.forEach((item) => {
        item.classList.add('visible')
        observer.unobserve(item)
      })
    }, 900)

    return () => {
      window.clearTimeout(firstScreenTimer)
      window.clearTimeout(failSafeTimer)
      observer.disconnect()
    }
  }, [pathname])

  return <>{children}</>
}
