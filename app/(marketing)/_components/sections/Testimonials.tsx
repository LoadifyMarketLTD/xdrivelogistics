'use client'

import { useRef } from 'react'
import Section from '../ui/Section'

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    {
      quote: 'De când folosesc XDrive Logistics, veniturile mele au crescut cu 40%. Platforma este foarte intuitivă și găsesc încărcături zilnic pe ruta mea preferată.',
      name: 'Marian Popescu',
      role: 'Șofer Independent',
      initials: 'MP',
    },
    {
      quote: 'Am redus timpul de căutare a șoferilor de la zile la ore. Toți șoferii sunt verificați și profesioniști. Recomand cu încredere!',
      name: 'Sarah Johnson',
      role: 'Manager Transport, FastDelivery UK',
      initials: 'SJ',
    },
    {
      quote: 'Am 5 camioane în flotă și XDrive ne-a ajutat să optimizăm rutele și să reducem costurile cu 25%. Suportul tehnic este excelent.',
      name: 'Ion Dumitrescu',
      role: 'Proprietar Flotă',
      initials: 'ID',
    },
    {
      quote: 'Platforma ne-a transformat modul în care gestionăm transportul. Tracking în timp real și facturare automată ne salvează ore întregi.',
      name: 'Emma Williams',
      role: 'Director Operațiuni, LogiCorp',
      initials: 'EW',
    },
  ]

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <Section id="testimonials">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '0.75rem',
        }}>
          Testimoniale
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Ce Spun Clienții Noștri
        </p>
      </div>

      {/* Carousel Container */}
      <div style={{ position: 'relative' }}>
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingBottom: '1rem',
            WebkitOverflowScrolling: 'touch',
          }}
          className="hide-scrollbar"
        >
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              style={{
                minWidth: '300px',
                maxWidth: '400px',
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p style={{
                fontSize: '0.9375rem',
                color: 'var(--text)',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontStyle: 'italic',
              }}>
                "{testimonial.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '1rem',
                }}>
                  {testimonial.initials}
                </div>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: 'var(--text)',
                    fontSize: '0.9375rem',
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'var(--muted)',
                  }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          aria-label="Previous testimonial"
          style={{
            position: 'absolute',
            left: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 10,
          }}
        >
          ←
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Next testimonial"
          style={{
            position: 'absolute',
            right: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 10,
          }}
        >
          →
        </button>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        marginTop: '3rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem' }}>Trustpilot</div>
          <div style={{ color: 'var(--brand)', fontWeight: '700' }}>4.8/5 Rating</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem' }}>Google</div>
          <div style={{ color: 'var(--brand)', fontWeight: '700' }}>4.9/5 Reviews</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem' }}>Transport UK</div>
          <div style={{ color: 'var(--brand)', fontWeight: '700' }}>Certified Partner</div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Section>
  )
}
