import React, { useState } from 'react';
import { X, ChevronRight, Zap, HeartPulse, Activity, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import '../landing.css';
import coach2 from '../assets/coach-2.png';
import coachVideo from '../assets/lesmills-core.mp4';
import coachProVideo from '../assets/coach-pro.mp4';
import type { SignUpRequest } from '../utils/dataExport';

interface LandingPageProps {
  onSignUp: (data: Omit<SignUpRequest, 'id' | 'submittedAt' | 'status'>) => void;
}

export default function LandingPage({ onSignUp }: LandingPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', poid: '', taille: '',
    goal: 'weight_loss', subscriptionType: 'partner', paymentMethod: 'cash', message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.poid || !form.taille) {
      alert('Please fill in name, phone, weight, and height');
      return;
    }
    onSignUp(form);
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', poid: '', taille: '', goal: 'weight_loss', subscriptionType: 'partner', paymentMethod: 'cash', message: '' });
    alert('Request sent! We will contact you soon.');
  };

  return (
    <>
      <div className="olympysky-body">
        {/* Header */}
        <header className="site-header">
          <div className="header-inner">
            <div className="site-branding">
              <motion.h1 
                className="site-title"
                whileHover={{ scale: 1.02 }}
              >
                <span className="site-title-accent">COACH</span> AYMEN
              </motion.h1>
            </div>

            <nav className="site-navigation desktop-only">
              <ul className="menu">
                <li><a href="#about">About</a></li>
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#plans">Plans</a></li>
                <li><a href="#coach">Coach</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>

            <div className="site-navigation-toggle-holder">
              <motion.button 
                className="site-navigation-toggle"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
              >
                <span className="site-navigation-toggle-icon"></span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                className="site-navigation-dropdown"
                initial={{ maxHeight: 0, scaleY: 0 }}
                animate={{ maxHeight: '100vh', scaleY: 1 }}
                exit={{ maxHeight: 0, scaleY: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ul className="menu">
                  <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
                  <li><a href="#benefits" onClick={() => setMenuOpen(false)}>Benefits</a></li>
                  <li><a href="#plans" onClick={() => setMenuOpen(false)}>Plans</a></li>
                  <li><a href="#coach" onClick={() => setMenuOpen(false)}>Coach</a></li>
                  <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero */}
        <section className="os-hero">
          <div className="os-hero-bg">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="os-hero-video"
            >
              <source src={coachVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="os-container">
            <motion.div 
              className="os-hero-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="os-hero-headline"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                It Doesn't Get Easier.<br />
                <span className="os-hero-accent">You Get Better.</span>
              </motion.h1>
              <motion.button 
                className="os-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05, backgroundColor: '#993366' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
              >
                My Plans <ChevronRight className="w-5 h-5 ml-2" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="os-section os-section-alt">
          <div className="os-container">
            <div className="os-about-content">
              <motion.div 
                className="os-about-image"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <img src={coach2} alt="Coach Aymen training" />
              </motion.div>
              <div className="os-about-text">
                <motion.h2
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  This Is How I Made It
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  My Story. With years of experience and a passion for fitness, I transform lives at OlympySky, Tunis through personalized programs based on science and real results.
                </motion.p>
                <motion.a
                  href="#coach"
                  className="os-btn"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Read More
                </motion.a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="os-section">
          <div className="os-container">
            <motion.div 
              className="os-section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Benefits of Working Out</h2>
            </motion.div>
            <div className="os-benefits-grid">
              <motion.div 
                className="os-benefit-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="os-benefit-icon">
                  <Zap size={48} />
                </div>
                <h3>Build Confidence</h3>
                <p>Push your limits and watch your self-esteem soar as you achieve what you once thought impossible.</p>
              </motion.div>
              <motion.div 
                className="os-benefit-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="os-benefit-icon">
                  <HeartPulse size={48} />
                </div>
                <h3>Boost Your Mood</h3>
                <p>Experience the natural high of endorphins, leaving you feeling happier and more energized after every session.</p>
              </motion.div>
              <motion.div 
                className="os-benefit-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="os-benefit-icon">
                  <Activity size={48} />
                </div>
                <h3>Increase Energy Levels</h3>
                <p>Build stamina and endurance that will carry you through your day with vitality and strength.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="os-section os-section-alt">
          <div className="os-container">
            <motion.div 
              className="os-section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Choose Your Plan</h2>
              <p className="os-plans-subtitle">TRAIN WITH PURPOSE</p>
            </motion.div>
            <div className="os-plans-grid">
              <motion.div 
                className="os-plan-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <h3 className="os-plan-title">Partner Performance</h3>
                <div className="os-plan-price">
                  <span className="os-plan-amount">450</span>
                  <span className="os-plan-currency">TND</span>
                  <span className="os-plan-period">/ month</span>
                </div>
                <p className="os-plan-desc">Train together, push each other. Ideal for friends, couples, or workout buddies who want a shared fitness journey.</p>
                <ul className="os-plan-features">
                  <li>2:1 semi-private training with individual attention</li>
                  <li>Partner drills that boost motivation and fun</li>
                  <li>Personal goals for each trainee in one session</li>
                  <li>Shared accountability and progress check-ins</li>
                  <li>At-home partner workout plan to do between sessions</li>
                </ul>
                <motion.button 
                  className="os-btn"
                  whileHover={{ scale: 1.05, backgroundColor: '#993366' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                >
                  Join Now
                </motion.button>
              </motion.div>
              <motion.div 
                className="os-plan-card os-plan-popular"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="os-plan-popular-badge">Most Popular</div>
                <h3 className="os-plan-title">Small Squad Strength</h3>
                <div className="os-plan-price">
                  <span className="os-plan-amount">600</span>
                  <span className="os-plan-currency">TND</span>
                  <span className="os-plan-period">/ month</span>
                </div>
                <p className="os-plan-desc">A small, high-energy group for up to 3 trainees. Get the community vibe without losing the personal touch.</p>
                <ul className="os-plan-features">
                  <li>Small-group training (max. 3 people for focused coaching)</li>
                  <li>High-energy sessions for strength and stamina</li>
                  <li>Scalable exercises for all fitness levels</li>
                  <li>Monthly mini-challenge with squad rewards</li>
                  <li>Group chat for scheduling and support</li>
                </ul>
                <motion.button 
                  className="os-btn"
                  whileHover={{ scale: 1.05, backgroundColor: '#993366' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                >
                  Join Now
                </motion.button>
              </motion.div>
              <motion.div 
                className="os-plan-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <h3 className="os-plan-title">Personal Power</h3>
                <div className="os-plan-price">
                  <span className="os-plan-amount">800</span>
                  <span className="os-plan-currency">TND</span>
                  <span className="os-plan-period">/ month</span>
                </div>
                <p className="os-plan-desc">For trainees who want all eyes on them. A fully personalized program, built around your schedule, goals, and pace.</p>
                <ul className="os-plan-features">
                  <li>Fully customized 1:1 training sessions</li>
                  <li>Individual assessment and progress tracking</li>
                  <li>Tailored workout plan updated every 4 weeks</li>
                  <li>Form correction and injury-prevention focus</li>
                  <li>Direct WhatsApp support for questions between sessions</li>
                </ul>
                <motion.button 
                  className="os-btn"
                  whileHover={{ scale: 1.05, backgroundColor: '#993366' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                >
                  Join Now
                </motion.button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Meet the Coach */}
        <section id="coach" className="os-section os-coach-section">
          <div className="os-container">
            <motion.div 
              className="os-coach-content"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="os-coach-image-wrapper">
                <motion.video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="os-coach-video"
                  initial={{ scale: 0.95, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, type: "spring" }}
                >
                  <source src={coachProVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </motion.video>
              </div>
              <div className="os-coach-info">
                <motion.h2
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Your Coach
                </motion.h2>
                <motion.h3
                  className="os-coach-name"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Aymen Kouki
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Je suis un coach sportif à OlympySky Tunis, spécialisé dans la perte de poids, la prise de masse musculaire et l'amélioration des performances physiques.
                  <br /><br />
                  Instructeur Body Combat Professionnel Certifié, je vous accompagne avec un coaching personnalisé pour vous aider à atteindre vos objectifs et révéler votre meilleur potentiel.
                </motion.p>
                <motion.a
                  href="https://www.instagram.com/koukitc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="os-btn"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-5 h-5 ml-2" />
                  Follow on Instagram
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="os-section">
          <div className="os-container">
            <div className="os-contact-content">
              <motion.div 
                className="os-contact-info"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h2>Take the First Step on a Journey That Pushes You to the Limit</h2>
                <p>Contact Coach Aymen to start your journey at OlympySky, Tunis.</p>
              </motion.div>
              <motion.div 
                className="os-contact-form"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <form onSubmit={handleSubmit}>
                  <input 
                    className="os-input" 
                    type="text" 
                    placeholder="Full Name *" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                  <input 
                    className="os-input" 
                    type="tel" 
                    placeholder="Phone *" 
                    required 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                  />
                  <input 
                    className="os-input" 
                    type="email" 
                    placeholder="Email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                  />
                  <div className="os-form-grid">
                    <input 
                      className="os-input" 
                      type="number" 
                      placeholder="Weight (kg) *" 
                      required 
                      min="0" 
                      step="0.1" 
                      value={form.poid} 
                      onChange={e => setForm({ ...form, poid: e.target.value })} 
                    />
                    <input 
                      className="os-input" 
                      type="number" 
                      placeholder="Height (cm) *" 
                      required 
                      min="0" 
                      value={form.taille} 
                      onChange={e => setForm({ ...form, taille: e.target.value })} 
                    />
                  </div>
                  <select 
                    className="os-input" 
                    value={form.goal} 
                    onChange={e => setForm({ ...form, goal: e.target.value })}
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fitness">General Fitness</option>
                    <option value="strength">Strength</option>
                    <option value="other">Other</option>
                  </select>
                  <select 
                    className="os-input" 
                    value={form.subscriptionType} 
                    onChange={e => setForm({ ...form, subscriptionType: e.target.value })}
                  >
                    <option value="partner">Partner Performance</option>
                    <option value="squad">Small Squad Strength</option>
                    <option value="personal">Personal Power</option>
                  </select>
                  <textarea 
                    className="os-input os-textarea" 
                    placeholder="Your goals and experience" 
                    rows={4} 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })} 
                  />
                  <motion.button 
                    type="submit" 
                    className="os-btn"
                    whileHover={{ scale: 1.05, backgroundColor: '#993366' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join Now
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="site-branding">
              <p className="site-title">COACH AYMEN</p>
            </div>
            <div className="copyright">
              <p>
                <a 
                  href="https://www.instagram.com/koukitc/reels/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="os-footer-link"
                >
                  <Instagram className="w-4 h-4 inline mr-1" />
                  Instagram
                </a>
                {' · '}Tunis, Tunisia
                {' · '}© {new Date().getFullYear()} Aymen Kouki
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Sign-Up Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="lp-modal-backdrop" 
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="lp-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="lp-modal-header">
                <h2 className="lp-modal-title">Join Now</h2>
                <motion.button 
                  className="lp-modal-close" 
                  onClick={() => setShowModal(false)}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="lp-form-label">Full Name *</label>
                <input className="lp-form-input" type="text" placeholder="Your name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <label className="lp-form-label">Phone *</label>
                <input className="lp-form-input" type="tel" placeholder="+216 XX XXX XXX" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <label className="lp-form-label">Email</label>
                <input className="lp-form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <div className="lp-form-grid">
                  <div>
                    <label className="lp-form-label">Weight (kg) *</label>
                    <input className="lp-form-input" type="number" placeholder="70" required min="0" step="0.1" value={form.poid} onChange={e => setForm({ ...form, poid: e.target.value})} />
                  </div>
                  <div>
                    <label className="lp-form-label">Height (cm) *</label>
                    <input className="lp-form-input" type="number" placeholder="175" required min="0" value={form.taille} onChange={e => setForm({ ...form, taille: e.target.value })} />
                  </div>
                </div>
                <label className="lp-form-label">Goal</label>
                <select className="lp-form-select" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fitness">General Fitness</option>
                  <option value="strength">Strength</option>
                  <option value="other">Other</option>
                </select>
                <label className="lp-form-label">Plan</label>
                <select className="lp-form-select" value={form.subscriptionType} onChange={e => setForm({ ...form, subscriptionType: e.target.value })}>
                  <option value="partner">Partner Performance — 450 TND/month</option>
                  <option value="squad">Small Squad Strength — 600 TND/month</option>
                  <option value="personal">Personal Power — 800 TND/month</option>
                </select>
                <label className="lp-form-label">Payment</label>
                <select className="lp-form-select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <motion.button 
                    type="button" 
                    className="lp-btn" 
                    onClick={() => setShowModal(false)} 
                    style={{ background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-border)', fontSize: '1rem', padding: '14px 28px', flex: '1' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="lp-btn" 
                    style={{ flex: '2', fontSize: '1rem', padding: '14px 28px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



