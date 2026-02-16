import '@/styles/public.css';
import ContactForm from './ContactForm';
import ClientScripts from './ClientScripts';

export const metadata = {
  title: 'XDrive Logistics LTD 2021 - 2026 — Courier & Transport Services',
  description: 'XDrive Logistics provides UK courier transport: same-day, next-day, pallets, multi-drop and dedicated van services. Fast quotes and reliable delivery.',
};

export default function Home() {
  return (
    <>
      <ClientScripts />
      
      <header className="blur">
        <div className="container">
          <div className="nav">
            <a className="brand" href="#top" aria-label="XDrive Logistics Home">
              <div className="logoBox">
                <img src="/logo.png" alt="XDrive Logistics Logo" />
              </div>
              <div>
                <strong>XDrive Logistics</strong>
                <small>Courier & Transport</small>
              </div>
            </a>

            <nav aria-label="Primary">
              <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="#fleet">Fleet</a></li>
                <li><a href="#coverage">Coverage</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/dashboard/">Login</a></li>
              </ul>
            </nav>

            <div className="actions">
              <a className="btn" href="#contact">Call / WhatsApp</a>
              <a className="btn primary" href="#quote">Get a Quote</a>
              <button className="btn menuBtn" id="menuBtn" aria-label="Open menu">Menu</button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobileMenu" className="container" style={{ display: 'none', padding: '10px 0 0' }}>
        <div className="card blur" style={{ padding: '12px' }}>
          <div className="chips" style={{ gap: '8px' }}>
            <a className="chip" href="#services">Services</a>
            <a className="chip" href="#fleet">Fleet</a>
            <a className="chip" href="#coverage">Coverage</a>
            <a className="chip" href="#faq">FAQ</a>
            <a className="chip" href="#contact">Contact</a>
          </div>
        </div>
      </div>

      <main id="top">
        {/* HERO with VAN photo background */}
        <div className="heroWrap">
          <div className="heroPhoto" aria-hidden="true"></div>
          <div className="heroGlow" aria-hidden="true"></div>

          <div className="container heroInner">
            <div className="heroGrid">
              <div className="heroCard blur">
                <div className="heroLeft">
                  <span className="kicker"><span className="dot"></span> UK Transport • Reliable • Fast</span>
                  <h1>Premium courier transport that keeps your business moving.</h1>
                  <p className="lead">
                    Dedicated vans, multi-drop, pallets and urgent collections — with clear pricing, live updates and professional drivers.
                    Built for brokers, dispatchers and direct clients who need speed and trust.
                  </p>

                  <div className="heroCtas">
                    <a className="btn primary" href="#quote">Instant Quote</a>
                    <a className="btn" href="#services">Explore Services</a>
                  </div>

                  <div className="heroStats">
                    <div className="stat">
                      <strong>Same-day</strong>
                      <span>Urgent collections & deliveries</span>
                    </div>
                    <div className="stat">
                      <strong>Next-day</strong>
                      <span>Reliable scheduled transport</span>
                    </div>
                    <div className="stat">
                      <strong>Dedicated</strong>
                      <span>Van only for your load</span>
                    </div>
                  </div>

                  <div className="trustRow">
                    <span className="pill"><i>✓</i> Insured transport</span>
                    <span className="pill"><i>✓</i> POD on delivery</span>
                    <span className="pill"><i>✓</i> Transparent communication</span>
                  </div>
                </div>
              </div>

              {/* QUOTE */}
              <div className="heroCard blur" id="quote">
                <div className="quote">
                  <div className="quoteHead">
                    <div>
                      <h3>Request a quote</h3>
                      <p>Fill in the details — we&apos;ll reply fast with price & availability.</p>
                    </div>
                    <div className="badge">Fast Response</div>
                  </div>

                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <section id="services">
          <div className="container">
            <div className="sectionTitle">
              <div>
                <h2>Services</h2>
                <p>Flexible courier transport for urgent, scheduled and dedicated jobs across the UK.</p>
              </div>
            </div>

            <div className="grid3">
              <div className="card blur">
                <div className="icon">SD</div>
                <h3>Same-Day Courier</h3>
                <p>Urgent collections with direct delivery — fastest option when time matters.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Direct route</li>
                  <li><span className="check">✓</span>Live updates</li>
                  <li><span className="check">✓</span>POD included</li>
                </ul>
              </div>

              <div className="card blur">
                <div className="icon">ND</div>
                <h3>Next-Day Delivery</h3>
                <p>Reliable scheduled transport for regular routes and planned shipments.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Planned collection slots</li>
                  <li><span className="check">✓</span>Clear pricing</li>
                  <li><span className="check">✓</span>Professional handling</li>
                </ul>
              </div>

              <div className="card blur">
                <div className="icon">DV</div>
                <h3>Dedicated Van</h3>
                <p>Van assigned only to your load — ideal for high-value or fragile goods.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Exclusive capacity</li>
                  <li><span className="check">✓</span>Fast dispatch</li>
                  <li><span className="check">✓</span>Insurance options</li>
                </ul>
              </div>

              <div className="card blur">
                <div className="icon">PL</div>
                <h3>Pallet Transport</h3>
                <p>From single pallets to multiple — tail-lift options on request.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Business freight</li>
                  <li><span className="check">✓</span>Timed deliveries</li>
                  <li><span className="check">✓</span>Careful securing</li>
                </ul>
              </div>

              <div className="card blur">
                <div className="icon">MD</div>
                <h3>Multi-Drop Routes</h3>
                <p>Optimised routes for multiple stops — reduce cost per drop.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Route planning</li>
                  <li><span className="check">✓</span>Stop-by-stop POD</li>
                  <li><span className="check">✓</span>Daily/weekly options</li>
                </ul>
              </div>

              <div className="card blur">
                <div className="icon">EU</div>
                <h3>UK Transport</h3>
                <p>Cross-border movements with clear paperwork guidance and tracking.</p>
                <ul className="list">
                  <li><span className="check">✓</span>Dedicated runs</li>
                  <li><span className="check">✓</span>Documentation support</li>
                  <li><span className="check">✓</span>Transparent comms</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHY US + FLEET */}
        <section id="fleet">
          <div className="container">
            <div className="sectionTitle">
              <div>
                <h2>Why XDrive + Fleet</h2>
                <p>Professional drivers, clean communication, and delivery proof — the basics done exceptionally well.</p>
              </div>
            </div>

            <div className="grid2">
              <div className="card blur">
                <h3>What you get</h3>
                <ul className="list">
                  <li><span className="check">✓</span><strong>Fast quoting</strong> & availability checks</li>
                  <li><span className="check">✓</span><strong>Updates</strong> from collection to delivery</li>
                  <li><span className="check">✓</span><strong>POD</strong> (Proof of Delivery) after completion</li>
                  <li><span className="check">✓</span><strong>Careful handling</strong> & secured loads</li>
                  <li><span className="check">✓</span><strong>Invoice-ready</strong> documentation</li>
                </ul>
              </div>

              <div className="card blur">
                <h3>Fleet options</h3>
                <p>We match the right vehicle to your job — size, access, and load type.</p>
                <div className="chips" style={{ marginTop: '12px' }}>
                  <span className="chip">Small Van</span>
                  <span className="chip">Medium Van</span>
                  <span className="chip">Large Van</span>
                  <span className="chip">Luton Van</span>
                  <span className="chip">Tail-lift (on request)</span>
                  <span className="chip">Straps & blankets</span>
                </div>
                <div style={{ marginTop: '12px', color: 'var(--muted)', fontSize: '13px', lineHeight: '1.55' }}>
                  Tip: for pallets/heavy items, mention loading method (forklift/tail-lift/manual) in the quote form.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COVERAGE */}
        <section id="coverage">
          <div className="container">
            <div className="sectionTitle">
              <div>
                <h2>Coverage</h2>
                <p>UK nationwide coverage with EU routes available on request.</p>
              </div>
            </div>

            <div className="card blur">
              <h3>Typical lanes</h3>
              <div className="coverage">
                <span className="tag">North West</span>
                <span className="tag">Midlands</span>
                <span className="tag">London & South East</span>
                <span className="tag">Scotland</span>
                <span className="tag">Wales</span>
                <span className="tag">UK Dedicated Runs</span>
              </div>
              <p style={{ marginTop: '12px' }}>Send pickup/drop-off postcodes and load details — we&apos;ll confirm price and timing.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="container">
            <div className="sectionTitle">
              <div>
                <h2>FAQ</h2>
                <p>Quick answers to the most common questions.</p>
              </div>
            </div>

            <details className="blur">
              <summary>How fast do you respond to quote requests?</summary>
              <p>Usually fast during business hours. For urgent jobs, use WhatsApp/phone and include pickup/drop-off plus load details.</p>
            </details>
            <details className="blur">
              <summary>Do you provide proof of delivery?</summary>
              <p>Yes — POD (signature/photo depending on the job and location).</p>
            </details>
            <details className="blur">
              <summary>Can you handle pallets and heavy items?</summary>
              <p>Yes. Please mention weight, dimensions, number of pallets, and whether loading is forklift/tail-lift/manual.</p>
            </details>
            <details className="blur">
              <summary>Do you cover Europe?</summary>
              <p>UK dedicated runs are available on request. Share route, dates, and cargo details for a tailored quote.</p>
            </details>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="container">
            <div className="sectionTitle">
              <div>
                <h2>Contact</h2>
                <p>Fastest: WhatsApp or phone. For planned jobs, email works great.</p>
              </div>
            </div>

            <div className="grid3">
              <div className="card blur">
                <div className="icon">WA</div>
                <h3>WhatsApp</h3>
                <p><a id="waLink" href="#" className="btn primary" style={{ display: 'inline-flex', marginTop: '12px' }}>Open WhatsApp</a></p>
                <p style={{ marginTop: '10px' }}>Send route + date + load details.</p>
              </div>

              <div className="card blur">
                <div className="icon">PH</div>
                <h3>Phone</h3>
                <p style={{ marginTop: '12px' }}>
                  <a id="phoneLink" className="btn" href="#">Call now</a>
                </p>
                <p style={{ marginTop: '10px' }}>Best for immediate dispatch.</p>
              </div>

              <div className="card blur">
                <div className="icon">EM</div>
                <h3>Email</h3>
                <p style={{ marginTop: '12px' }}>
                  <a id="emailLink" className="btn" href="#">Send email</a>
                </p>
                <p style={{ marginTop: '10px' }}>Quotes & paperwork.</p>
              </div>
            </div>

            <div className="card blur" style={{ marginTop: '14px' }}>
              <h3>Our details</h3>
              <ul className="list">
                <li><span className="check">✓</span><span><strong>WhatsApp:</strong> <span style={{ color: 'rgba(255,255,255,.86)' }} id="waText"></span></span></li>
                <li><span className="check">✓</span><span><strong>Phone:</strong> <span style={{ color: 'rgba(255,255,255,.86)' }} id="phoneText"></span></span></li>
                <li><span className="check">✓</span><span><strong>Email:</strong> <span style={{ color: 'rgba(255,255,255,.86)' }} id="emailText"></span></span></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/447423272138?text=Hi%20XDrive%20Logistics%2C%20I%E2%80%99d%20like%20a%20quote." 
         className="whatsapp-float" 
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Contact us on WhatsApp">
        <svg viewBox="0 0 32 32">
          <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.957 0-7.51 6.11-13.62 13.62-13.62s13.62 6.11 13.62 13.62c0 7.51-6.11 13.62-13.62 13.62zM21.305 19.26c-0.346-0.174-2.049-1.007-2.366-1.123-0.316-0.116-0.547-0.174-0.776 0.174s-0.893 1.123-1.094 1.347c-0.201 0.231-0.401 0.26-0.747 0.087s-1.453-0.537-2.766-1.713c-1.024-0.919-1.714-2.049-1.916-2.396s-0.022-0.536 0.152-0.709c0.156-0.156 0.347-0.401 0.52-0.603s0.231-0.347 0.347-0.576c0.116-0.231 0.058-0.431-0.029-0.603s-0.776-1.87-1.063-2.565c-0.28-0.672-0.56-0.58-0.776-0.591-0.201-0.010-0.431-0.012-0.661-0.012s-0.603 0.087-0.919 0.431c-0.316 0.347-1.206 1.181-1.206 2.878s1.235 3.338 1.406 3.566c0.174 0.231 2.396 3.715 5.81 5.21 0.813 0.351 1.448 0.562 1.944 0.719 0.817 0.262 1.559 0.225 2.145 0.137 0.654-0.098 2.049-0.835 2.337-1.642s0.289-1.496 0.202-1.642c-0.087-0.145-0.318-0.231-0.664-0.405z"/>
        </svg>
      </a>

      <footer className="blur">
        <div className="container">
          <div className="footerGrid">
            <div>
              <div className="brand" style={{ gap: '10px' }}>
                <div className="logoBox" style={{ width: '46px', height: '46px', borderRadius: '16px' }}>
                  <img src="/logo.png" alt="XDrive Logistics Logo" />
                </div>
                <div>
                  <strong>XDrive Logistics</strong>
                  <div className="footSmall">Courier & Transport • UK </div>
                </div>
              </div>
              <p className="footSmall" style={{ marginTop: '10px' }}>
                © <span id="year"></span> XDrive Logistics. All rights reserved.
              </p>
            </div>

            <div className="footLinks">
              <a href="#quote">Quote</a>
              <a href="#services">Services</a>
              <a href="#contact">Contact</a>
              <a href="#top">Back to top</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="toast" id="toast"></div>
    </>
  );
}
