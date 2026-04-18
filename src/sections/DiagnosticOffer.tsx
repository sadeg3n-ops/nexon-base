import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Check, Loader2, RefreshCw } from 'lucide-react';

export function DiagnosticOffer() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    privacyAccepted: false,
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isPreparing, setIsPreparing] = useState(true);
  const [formToken, setFormToken] = useState('');
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('Ha ocurrido un error. Vuelve a intentarlo en unos segundos.');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      message: '',
      privacyAccepted: false,
      website: '',
    });
  };

  const resetTurnstile = () => {
    setTurnstileToken('');
    if (window.turnstile && turnstileWidgetIdRef.current !== null) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  };

  const prepareFormSession = async () => {
    setIsPreparing(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = (await response.json()) as {
        formToken?: string;
        challengeRequired?: boolean;
        error?: string;
      };

      if (!response.ok || !result.formToken) {
        throw new Error(result.error || 'El formulario no está disponible ahora mismo.');
      }

      setFormToken(result.formToken);
      setChallengeRequired(Boolean(result.challengeRequired));
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'El formulario no está disponible ahora mismo. Vuelve a intentarlo más tarde.'
      );
      setFormToken('');
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    void prepareFormSession();
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey) {
      return;
    }

    if (window.turnstile) {
      setTurnstileReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-script="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setTurnstileReady(true), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = 'true';
    script.addEventListener('load', () => setTurnstileReady(true), { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', () => setTurnstileReady(true));
    };
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileReady || !turnstileContainerRef.current || !window.turnstile) {
      return;
    }

    if (turnstileWidgetIdRef.current !== null) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      theme: 'dark',
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
    });
  }, [turnstileSiteKey, turnstileReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formToken) {
      setStatus('error');
      setErrorMessage('El formulario se está preparando. Espera unos segundos y vuelve a intentarlo.');
      return;
    }

    if (challengeRequired && !turnstileSiteKey) {
      setStatus('error');
      setErrorMessage('El formulario no está disponible ahora mismo. Vuelve a intentarlo más tarde.');
      return;
    }

    if (challengeRequired && !turnstileToken) {
      setStatus('error');
      setErrorMessage('Completa la verificación antispam antes de enviar la solicitud.');
      return;
    }

    setErrorMessage('Ha ocurrido un error. Vuelve a intentarlo en unos segundos.');
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formToken,
          turnstileToken,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || 'No se pudo enviar la solicitud.');
      }

      setStatus('success');
      resetForm();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      resetTurnstile();
      await prepareFormSession();
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section id="diagnostico" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 md:border-t-0">
      <span id="contacto" className="block scroll-mt-24" aria-hidden="true"></span>
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Solicita un diagnóstico gratuito
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Cuéntame cómo entra hoy un cliente y te diré por dónde empezaría.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-12 lg:gap-24 relative">
          
          {/* Left info block */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <motion.div 
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6 mb-12"
            >
              {[
                "Revisión rápida de tu sistema actual",
                "Detección de bloqueos",
                "Recomendación clara de por dónde empezar",
                "Sin presión comercial"
              ].map((text, i) => (
                <motion.div key={i} variants={itemVariants} className="flex items-center gap-4 text-gray-300">
                  <div className="p-1 rounded bg-white/5 shrink-0"><Check size={16} className="text-ai-purple" /></div>
                  {text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="border-t border-white/5 pt-8"
            >
              <ol className="relative border-s border-white/10 ml-3">
                {[
                  "Revisamos tu caso",
                  "Te decimos qué montaría primero",
                  "Tú decides si tiene sentido avanzar"
                ].map((step, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className={`ms-8 ${i === 2 ? '' : 'mb-8'}`}
                  >
                    <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -ms-[33px] bg-[#0a0a0b] border border-white/20 text-xs font-bold text-gray-400">{i + 1}</span>
                    <h3 className="font-semibold text-white mb-1 transition-colors hover:text-ai-purple cursor-default">{step}</h3>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>

          {/* Right form block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8, delay: 0.2 }}
            className="md:col-span-7"
          >
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl overflow-hidden relative min-h-[500px] flex items-center justify-center">
              
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center text-center py-12 px-6 w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                      <Check size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Solicitud recibida</h3>
                    <p className="text-gray-400 mb-8 max-w-sm">
                      Gracias. Revisaré tu caso y te responderé en un día laborable.
                    </p>
                    <Button onClick={() => setStatus('idle')} variant="secondary" className="flex gap-2 w-full sm:w-auto mt-4">
                      <RefreshCw size={18} /> Enviar otra solicitud
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6 w-full"
                  >
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-300">Nombre</label>
                        <input 
                          required
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Tu nombre" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                        <input 
                          required
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-gray-300">Empresa</label>
                      <input 
                        required
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nombre de tu empresa" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-gray-300">¿Qué está fallando ahora mismo en tu captación o seguimiento?</label>
                      <textarea 
                        required
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Cuéntame qué está fallando o dónde se está perdiendo tiempo" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors resize-none"
                      ></textarea>
                    </div>

                    <label className="group inline-flex max-w-full items-start gap-3 text-[0.82rem] leading-5 text-white/56">
                      <input
                        required
                        id="privacyAccepted"
                        name="privacyAccepted"
                        type="checkbox"
                        checked={formData.privacyAccepted}
                        onChange={handleCheckboxChange}
                        className="peer sr-only"
                      />
                      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[0.45rem] border border-white/14 bg-white/[0.03] text-transparent transition-all duration-200 peer-checked:border-white/30 peer-checked:bg-white/[0.08] peer-checked:text-white/88 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white/60 group-hover:border-white/22">
                        <Check size={11} strokeWidth={2.6} aria-hidden="true" />
                      </span>
                      <span>
                        He leído y acepto la{' '}
                        <a
                          href="/politica-privacidad/"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-white/72 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 rounded-sm"
                        >
                          Política de privacidad
                        </a>
                        .
                      </span>
                    </label>

                    {status === 'error' && (
                      <div className="p-4 rounded bg-red-500/10 text-red-400 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    {(challengeRequired || turnstileSiteKey) && (
                      <div className="space-y-3">
                        <div ref={turnstileContainerRef} className="min-h-[65px]" />
                        {challengeRequired && !turnstileSiteKey && (
                          <p className="text-sm text-red-400">
                            Falta configurar la protección antispam del formulario.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="pt-2 transition-transform active:scale-[0.98]">
                      <Button 
                        type="submit" 
                        disabled={
                          status === 'loading' ||
                          isPreparing ||
                          (challengeRequired && !turnstileToken) ||
                          (challengeRequired && !turnstileSiteKey)
                        }
                        className="w-full flex justify-center items-center"
                      >
                        {status === 'loading' || isPreparing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          'Solicitar diagnóstico gratuito'
                        )}
                      </Button>
                      <p className="text-center text-xs leading-5 text-gray-500 mt-4">
                        Nada de spam. Solo usaremos tus datos para responder a tu solicitud.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
