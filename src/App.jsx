import { useEffect, useState } from 'react'
import './App.css'
import glenPhoto from './assets/glen-monteiro.jpg'

function App() {
  function handleBook() {
    alert('Thanks — we will contact you to book your appointment.')
  }

  const [formSubmitted, setFormSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setFormSubmitted(true)
    // In a real app, send form data to the server here
  }

  useEffect(() => {
    const header = document.querySelector('.site-header')
    if (!header) return

    function onScroll() {
      if (window.scrollY > 40) header.classList.add('header-scrolled')
      else header.classList.remove('header-scrolled')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page-root">
      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="#">Empower Recovery</a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">What We Offer</a>
            <a href="#team">Our Team</a>
            <button className="nav-cta" onClick={handleBook}>Book An Appointment</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" aria-label="Hero">
        <div className="hero-overlay"></div>
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Healing Individuals.<br />
              <span className="hero-accent">Restoring Families.</span>
            </h1>
            <p className="hero-copy">
              Empower Recovery offers compassionate, evidence-based addiction medicine — integrating medical care, therapy, and long-term support for lasting change.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={handleBook} aria-label="Book a Consultation">
                <span>Book a Consultation</span>
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <a className="btn btn-ghost" href="#about" aria-label="Learn About Us">Learn About Us</a>
            </div>
          </div>

          <div className="hero-stats-card" aria-label="Empower Recovery service statistics">
            <div className="stats-grid">
              <div className="stat-item">
                <p className="stat-value">TBD</p>
                <p className="stat-label">Patients served</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">18 yrs</p>
                <p className="stat-label">Combined expertise</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">TBD</p>
                <p className="stat-label">Confidential consultations</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">TBD</p>
                <p className="stat-label">Supportive care</p>
              </div>
            </div>
          </div>
        </div>
      </section>
        
        <section id="about" className="about container">
          <div className="about-inner card-block">
            <div className="about-visual" aria-hidden="true">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c0?w=800&h=1066&fit=crop&auto=format" alt="Calm nature scene" />
            </div>

            <div className="about-text">
              <p className="about-eyebrow">About Us</p>
              <h2 className="about-headline">Medicine, compassion, and community — all in one place.</h2>

              <p className="about-body">At <strong>Empower Recovery</strong>, we believe that every person deserves the opportunity to reclaim their life with dignity, respect, and expert medical care. Addiction is not a reflection of character or willpower—it is a complex medical condition that responds best to compassionate, evidence-based treatment.</p>

              <p className="about-body">Founded by a team of physicians and nurse practitioners dedicated to addiction medicine since <strong>2025</strong>, our practice was created to make high-quality, personalized care accessible to individuals and families seeking lasting recovery. Our clinical experience has shown us that successful treatment is built on more than medication alone—it requires trust, understanding, and a strong support system.</p>

              <p className="about-body">Our approach brings together the science of modern addiction medicine with genuine human connection. Every treatment plan is tailored to the individual, recognizing that no two recovery journeys are the same. We work alongside our patients, celebrating progress, navigating setbacks, and providing the guidance needed to build a healthier future.</p>

              <p className="about-body">At Empower Recovery, we focus on treating the whole person. We address the physical, emotional, and social aspects of addiction through an integrated model of care that supports long-term wellness rather than short-term solutions.</p>

              <h4 className="about-subhead">What Sets Us Apart</h4>
              <ul className="features">
                <li>Physician- and nurse practitioner-led addiction treatment</li>
                <li>Evidence-based care grounded in the latest medical research</li>
                <li>Compassionate, respectful, and judgment-free environment</li>
                <li>Personalized treatment plans designed around each individual's goals</li>
                <li>Integrated medical care with behavioral health support</li>
                <li>Care for both individuals and the families who support them</li>
                <li>Flexible appointment options, including telehealth and in-person visits</li>
                <li>Acceptance of most major insurance plans</li>
              </ul>

              <p className="about-body">Recovery is not simply about overcoming addiction—it's about rebuilding confidence, restoring relationships, and creating a life filled with purpose. Whether you're seeking help for yourself or someone you love, our team is committed to walking beside you every step of the journey.</p>

              <p className="about-closing">Medicine. Compassion. Community. Together, they create the foundation for lasting recovery.</p>
            </div>
          </div>
        </section>

        <section id="services" className="services-offer">
          <div className="container offer-inner">
            <p className="offer-eyebrow">What We Offer</p>
            <h2 className="offer-headline">Every recovery journey is different. <span className="muted">So is our care.</span></h2>

            <div className="offer-cards" role="list">
              <article className="offer-card" role="listitem">
                <svg className="offer-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a7 7 0 0 0-14.8 0"></path>
                </svg>
                <h3 className="offer-title">Medication-Assisted Treatment</h3>
                <p className="offer-body">Evidence-based pharmacotherapy for opioid and alcohol use disorders.</p>
              </article>

              <article className="offer-card" role="listitem">
                <svg className="offer-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <h3 className="offer-title">Integrated Mental Health Care</h3>
                <p className="offer-body">Comprehensive care addressing co-occurring conditions alongside addiction treatment.</p>
              </article>

              <article className="offer-card" role="listitem">
                <svg className="offer-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h3 className="offer-title">Individual & Group Therapy</h3>
                <p className="offer-body">CBT, motivational interviewing, and facilitated group sessions led by licensed clinicians.</p>
              </article>

              <article className="offer-card" role="listitem">
                <svg className="offer-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2v6"></path>
                  <path d="M12 16v6"></path>
                  <path d="M4.9 4.9l4.2 4.2"></path>
                  <path d="M14.9 14.9l4.2 4.2"></path>
                </svg>
                <h3 className="offer-title">Ongoing Recovery Support</h3>
                <p className="offer-body">Long-term follow-up, relapse prevention, peer coaching, and community connections for sustained wellness.</p>
              </article>
            </div>
          </div>
        </section>
        
        <section id="team" className="team-section">
          <div className="container team-inner">
            <div className="team-photo" aria-hidden>
              <img src={glenPhoto} alt="Dr. Glen Monteiro" />
            </div>

            <div className="team-bio">
              <p className="team-eyebrow">Our Team</p>
              <h2 className="team-name">Meet Dr. Glen Monteiro,<br /><span className="team-credentials">MD, MPH</span></h2>



              <p className="team-text">Dr. Glen Monteiro is a <strong>board-certified physician</strong> specializing in <strong>Addiction Medicine</strong>, <strong>Family Medicine</strong>, and <strong>Preventive Medicine &amp; Public Health</strong>. With over <strong>15 years</strong> of clinical experience, he has dedicated his career to helping individuals overcome substance use disorders through compassionate, evidence-based care.</p>

              <p className="team-text">Dr. Monteiro believes that addiction is a treatable medical condition that requires individualized treatment, respect, and long-term support. His philosophy centers on meeting patients where they are, building trusting relationships, and developing personalized treatment plans that promote lasting recovery and improved quality of life.</p>

              <p className="team-text">Throughout his career, Dr. Monteiro has cared for patients in a wide variety of healthcare settings, including <strong>federally qualified health centers</strong>, <strong>residential treatment programs</strong>, <strong>opioid treatment programs</strong>, correctional healthcare facilities, hospitals, and academic medical institutions. He has served as Medical Director for multiple <strong>Medication-Assisted Treatment (MAT)</strong> programs, helping expand access to life-saving treatment for individuals living with opioid and alcohol use disorders.</p>

              <p className="team-text">In addition to direct patient care, Dr. Monteiro has held leadership roles overseeing multidisciplinary healthcare teams, mentoring physicians, nurse practitioners, physician assistants, and medical residents, and leading initiatives focused on quality improvement and patient safety. His dedication to clinical excellence and medical education earned him recognition as <strong>Best Attending Physician</strong> at the Roseburg Family Medicine Residency Program.</p>

              <p className="team-text">Dr. Monteiro earned his medical degree from <strong>Government Medical College, Maharashtra, India</strong>, followed by a <strong>Master of Public Health in Quantitative Methods</strong> from the <strong>University of Medicine &amp; Dentistry of New Jersey</strong>. He completed residency training in <strong>Family Medicine</strong> at <strong>Virginia Commonwealth University</strong> and <strong>Preventive Medicine</strong> at the <strong>University of Medicine &amp; Dentistry of New Jersey</strong>. He subsequently completed a Clinical Hospital Medicine Fellowship at the <strong>University of Texas Health Science Center at San Antonio</strong>.</p>

              <p className="team-text">He is board certified by the <strong>American Board of Preventive Medicine</strong> in Addiction Medicine and General Preventive Medicine &amp; Public Health, as well as by the <strong>American Board of Family Medicine</strong>. He is licensed to practice medicine in <strong>Texas</strong>, <strong>Oregon</strong>, and <strong>Virginia</strong>.</p>

              <p className="team-text">Beyond clinical practice, Dr. Monteiro has contributed to medical research, published peer-reviewed articles, presented at national conferences, and participated in humanitarian medical missions and community service initiatives.</p>

              <p className="team-closing">At Empower Recovery, Dr. Monteiro's mission is to provide every patient with expert medical care delivered with compassion, dignity, and hope, empowering individuals and families to achieve lasting recovery and healthier lives.</p>
            </div>
          </div>
        </section>
        <section id="booking" className="booking-section">
          <div className="container booking-inner">
            <div className="booking-left" aria-hidden>
              <p className="booking-eyebrow">Book An Appointment</p>
              <h2 className="booking-headline">Your first step starts here.</h2>
              <p className="booking-copy">Reaching out takes courage. Our intake team responds within 24 hours to schedule your confidential consultation. All calls and messages are private.</p>
            </div>

            <div className="booking-right">
              <div className="booking-card">
                {/** Form or confirmation goes here */}
                {formSubmitted ? (
                  <div className="booking-confirm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b87333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"></path>
                    </svg>
                    <h3 className="confirm-title">Thanks — request sent</h3>
                    <p className="confirm-copy">We'll contact you shortly to confirm your appointment.</p>
                  </div>
                ) : (
                  <form className="booking-form" onSubmit={handleSubmit}>
                    <label className="field">
                      <span className="sr-only">Full Name</span>
                      <input name="name" type="text" placeholder="Full Name" required className="form-input" />
                    </label>

                    <label className="field">
                      <span className="sr-only">Email Address</span>
                      <input name="email" type="email" placeholder="Email Address" required className="form-input" />
                    </label>

                    <label className="field">
                      <span className="sr-only">Phone Number</span>
                      <input name="phone" type="tel" placeholder="Phone Number" required className="form-input" />
                    </label>

                    <label className="field">
                      <span className="sr-only">Preferred Date</span>
                      <input name="date" type="date" className="form-input" />
                    </label>

                    <label className="field">
                      <span className="sr-only">Reason for Visit</span>
                      <select name="reason" className="form-input" required>
                        <option value="">Reason for visit</option>
                        <option>New patient intake</option>
                        <option>Medication-assisted treatment</option>
                        <option>Mental health consultation</option>
                        <option>Follow-up / Prescription refill</option>
                        <option>Family support consultation</option>
                        <option>Other</option>
                      </select>
                    </label>

                    <button type="submit" className="btn-submit">
                      <span>Request Appointment</span>
                      <svg className="chev" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
