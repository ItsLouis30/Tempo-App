'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import styles from './shape-overlay.module.css'

interface ShapeOverlayProps {
  onComplete?: () => void
}

const ShapeOverlay = ({ onComplete }: ShapeOverlayProps) => {
  const overlayRef = useRef<SVGSVGElement | null>(null)
  const pathsRef = useRef<(SVGPathElement | null)[]>([])
  const [isOpened, setIsOpened] = useState(false)

  const numPoints = 10
  const numPaths = 2
  const delayPointsMax = 0.3
  const delayPerPath = 0.25

  const pointsDelay = useRef<number[]>([])
  const allPoints = useRef<number[][]>([])
  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    tl.current = gsap.timeline({
      onUpdate: render,
    })

    // Animación de las formas
    for (let i = 0; i < numPaths; i++) {
      const points: number[] = []
      allPoints.current.push(points)
      for (let j = 0; j < numPoints; j++) {
        points.push(100)
      }
    }

    const overlay = overlayRef.current
    if (!overlay) return

    toggle()

    tl.current.to(overlay, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.3,
      onComplete: () => {
        if (onComplete) onComplete()
      }
    })

  }, [])


  const onClick = () => {
    if (!tl.current?.isActive()) {
      setIsOpened(prev => !prev)
    }
  }

  const toggle = () => {
    if (!tl.current) return

    tl.current.progress(0).clear()

    for (let i = 0; i < numPoints; i++) {
      pointsDelay.current[i] = Math.random() * delayPointsMax
    }

    for (let i = 0; i < numPaths; i++) {
      const points = allPoints.current[i]
      const pathDelay = delayPerPath * (isOpened ? i : numPaths - i - 1)

      for (let j = 0; j < numPoints; j++) {
        const delay = pointsDelay.current[j]
        tl.current.to(
          points,
          { [j]: 0 },
          delay + pathDelay
        )
      }
    }
  }

  const render = () => {
    for (let i = 0; i < numPaths; i++) {
      const path = pathsRef.current[i]
      if (!path) continue

      const points = allPoints.current[i]
      let d = ''

      d += isOpened
        ? `M 0 0 V ${points[0]} C`
        : `M 0 ${points[0]} C`

      for (let j = 0; j < numPoints - 1; j++) {
        const p = ((j + 1) / (numPoints - 1)) * 100
        const cp = p - ((1 / (numPoints - 1)) * 100) / 2
        d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`
      }

      d += isOpened ? ` V 100 H 0` : ` V 0 H 0`
      path.setAttribute('d', d)
    }
  }

  useEffect(() => {
    if (tl.current) {
      toggle()
    }
  }, [isOpened])

  return (
    <svg
      ref={overlayRef}
      className={styles.shapeOverlays}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d"/>
          <stop offset="100%" stopColor="#2f3f58" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#567ebb" />
          <stop offset="100%" stopColor="#536e96" />
        </linearGradient>
      </defs>

      <path
        ref={el => { pathsRef.current[0] = el }}
        fill="url(#gradient2)"
      />
      <path
        ref={el => { pathsRef.current[1] = el }}
        fill="url(#gradient1)"
      />
    </svg>
  )
}

export default ShapeOverlay
