import { useEffect, useState } from 'react'
import './App.css'
import glenPhoto from './assets/glen-monteiro.jpg'
import telehealth from './assets/telehealth.jpg'

function App() {

  const [showSplash, setShowSplash] = useState(true)


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

  if (showSplash) {
    return (
      <div className="splash" role="dialog" aria-label="Welcome">
        <div className="splash-inner container">
          <img className="splash-logo" src="/empower-logo.png" alt="Empower Recovery" />
          <button className="btn btn-primary splash-button" onClick={() => setShowSplash(false)}>Click here</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="/">
            <img src="/empower-logo.png" alt="Empower Recovery" />
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">What We Offer</a>
            <a href="#team">Our Team</a>
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
              Empower Recovery offers compassionate, personalized, evidence-based addiction treatment that combines medical care, therapy, and ongoing support for lasting recovery.
            </p>

            <div className="hero-actions">
              <div className="btn btn-primary" aria-label="Practice information coming soon">
                <span>Information about our upcoming practice will be available shortly.</span>
              </div>
            </div>
          </div>

          <div className="hero-stats-card" aria-label="Empower Recovery service statistics">
            <div className="stats-grid">
              <div className="stat-item">
                <p className="stat-top">15+ Years</p>
                <p className="stat-label">Clinical Experience</p>
              </div>
              <div className="stat-item">
                <p className="stat-top">Expert Team</p>
                <p className="stat-label">Board Certified Addiction Medicine Physician &amp; Experienced Nurse Practitioner</p>
              </div>
              <div className="stat-item">
                <p className="stat-top">Virtual Care</p>
                <p className="stat-label">Available Across Texas</p>
              </div>
              <div className="stat-item">
                <p className="stat-top">Personalized Treatment</p>
                <p className="stat-label">Individualized Recovery Plans</p>
              </div>
            </div>
          </div>
        </div>
      </section>
        
        <section id="about" className="about container">
          <div className="about-inner card-block">
            <div className="about-visual" aria-hidden="true">
              <img src={telehealth} alt="Telehealth visit" />
            </div>

            <div className="about-text">
              <p className="about-eyebrow">About Us</p>
              <h2 className="about-headline">Medicine, compassion, and community — all in one place.</h2>

              <p className="about-body">At <strong>Empower Recovery</strong>, we believe everyone deserves access to compassionate, expert addiction treatment—wherever they are in Texas. Through secure, virtual visits, we make high-quality, evidence-based care convenient, private, and accessible from the comfort of home.</p>

              <p className="about-body">Addiction is not a reflection of character or willpower. It is a complex medical condition that responds best to personalized, evidence-based treatment delivered with compassion and respect.</p>

              <p className="about-body">Founded by a physician and nurse practitioner dedicated to addiction medicine, <strong>Empower Recovery</strong> was created to remove barriers to care and make recovery more accessible. Our experience has shown that lasting recovery is built on more than medication alone—it requires trust, understanding, ongoing support, and a treatment plan tailored to each individual's needs.</p>

              <p className="about-body">Our virtual care model combines the science of modern addiction medicine with meaningful human connection. Every patient receives an individualized treatment plan designed around their goals, lifestyle, and stage of recovery. We partner with our patients through every step of the journey—celebrating progress, navigating challenges, and providing the guidance needed to build a healthier future.</p>

              <p className="about-body">We focus on treating the whole person by addressing the medical, emotional, and behavioral aspects of addiction. Through secure telehealth visits, we provide convenient, confidential care without the need to travel, helping patients stay connected to treatment wherever life takes them.</p>

              <h4 className="about-subhead">What Sets Us Apart</h4>
              <ul className="features">
                <li>Physician- and nurse practitioner-led addiction treatment</li>
                <li>100% secure virtual care across Texas</li>
                <li>Evidence-based treatment grounded in the latest medical research</li>
                <li>Compassionate, respectful, and judgment-free care</li>
                <li>Personalized treatment plans designed around your recovery goals</li>
                <li>Medication-Assisted Treatment (MAT), when clinically appropriate</li>
                <li>Flexible scheduling that fits your life</li>
                <li>Convenient care from the privacy of your home</li>
                <li>Acceptance of most major insurance plans</li>
              </ul>

              <p className="about-body">Recovery is about more than overcoming addiction—it's about rebuilding health, restoring relationships, and creating a life filled with purpose. Whether you're seeking help for yourself or someone you love, we're committed to providing expert, compassionate care that supports lasting recovery—one virtual visit at a time.</p>
            </div>
          </div>
        </section>

        <section id="services" className="services-offer">
          <div className="container offer-inner">
            <p className="offer-eyebrow">Why Choose Empower Recovery</p>
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
              <img className="aspect-[3/4] rounded-2xl object-cover object-top max-w-md" src={glenPhoto} alt="Dr. Glen Monteiro" />
            </div>

            <div className="team-bio">
              <p className="team-label">Our Team</p>
              <h2 className="team-heading">
                <span className="team-heading-line">Meet Dr. Glen Monteiro,</span>
                <span className="team-heading-line team-heading-accent">MD, MPH</span>
              </h2>
              <p className="team-subtitle">Founder &amp; Medical Director</p>
              <p className="team-text">Dr. Glen Monteiro is a board-certified physician specializing in Addiction Medicine, Family Medicine, and Preventive Medicine &amp; Public Health. With over 15 years of clinical experience, he is dedicated to helping individuals overcome substance use disorders through compassionate, evidence-based care.</p>

              <p className="team-text">He believes addiction is a treatable medical condition and partners with each patient to develop a personalized treatment plan that supports long-term recovery. His approach emphasizes respect, trust, and meeting patients where they are.</p>

              <p className="team-text">Dr. Monteiro has cared for patients across a wide range of healthcare settings, including outpatient clinics, residential treatment programs, opioid treatment programs, hospitals, correctional facilities, and academic medical centers. He has served as Medical Director for multiple Medication-Assisted Treatment (MAT) programs, expanding access to effective treatment for opioid and alcohol use disorders.</p>

              <p className="team-text">In addition to patient care, Dr. Monteiro has led multidisciplinary healthcare teams, mentored physicians and advanced practice providers, and championed quality improvement initiatives. His commitment to clinical excellence earned him recognition as Best Attending Physician at the Roseburg Family Medicine Residency Program.</p>

              <p className="team-text">He completed residency training in Family Medicine (Virginia Commonwealth University) and Preventive Medicine (University of Medicine &amp; Dentistry of New Jersey), followed by a Clinical Hospital Medicine Fellowship at UT Health San Antonio. He also earned a Master of Public Health from the University of Medicine &amp; Dentistry of New Jersey.</p>

              <p className="team-text">Dr. Monteiro is board certified by the American Board of Preventive Medicine in Addiction Medicine and Preventive Medicine &amp; Public Health, and by the American Board of Family Medicine. He is licensed to practice medicine in Texas, Oregon, and Virginia.</p>

              <p className="team-text">At Empower Recovery, Dr. Monteiro's mission is to provide expert, compassionate care that empowers individuals and families to achieve lasting recovery.</p>
            </div>
          </div>
        </section>
        <section id="booking" className="booking-section">
          <div className="container booking-inner">
            <div className="booking-left" aria-hidden>
              <p className="booking-eyebrow">Practice information</p>
              <h2 className="booking-headline">Coming soon.</h2>
              <p className="booking-copy">Information about our upcoming practice will be available shortly.</p>
            </div>

          </div>
        </section>

      </main>
    </div>
  )
}

export default App
