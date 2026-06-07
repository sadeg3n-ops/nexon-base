import { AnimatePresence, motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import { useLanguage, type Language } from '../lib/language';

function LanguageOption({
  language,
  label,
  code,
  accentClassName,
  glowClassName,
  onSelect,
}: {
  language: Language;
  label: string;
  code: string;
  accentClassName: string;
  glowClassName: string;
  onSelect: (language: Language) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(language)}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className="group relative min-h-[8.75rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-white/18 hover:bg-white/[0.055] hover:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 sm:min-h-[9.5rem] sm:px-5 sm:py-5"
    >
      <div className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r ${accentClassName} opacity-85`} />
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_48%)] opacity-70" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/46">
            {code}
          </div>
          <span
            aria-hidden="true"
            className={`mt-1 h-2 w-2 rounded-full bg-gradient-to-r ${accentClassName} opacity-75 blur-[1px] transition duration-150 group-hover:opacity-100`}
          />
        </div>

        <div className="relative">
          <div className="text-[1.05rem] font-semibold tracking-[-0.02em] text-white sm:text-[1.15rem]">
            {label}
          </div>
          <div className={`mt-4 h-px w-16 bg-gradient-to-r ${accentClassName} opacity-80`} />
        </div>

        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-4 right-3 h-14 w-14 rounded-full opacity-75 blur-2xl transition duration-150 group-hover:opacity-100 ${glowClassName}`}
        />
        <span className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/[0.03]" />
      </div>
    </motion.button>
  );
}

function NeonAccent() {
  return (
    <div className="pointer-events-none mt-5 flex w-full items-center justify-center sm:mt-6">
      <div className="relative h-6 w-[8.5rem] sm:w-[10rem]">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/14 to-transparent" />
        <motion.div
          initial={{ scaleX: 0.72, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: [0.7, 1, 0.78] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/2 h-px w-20 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-ai-purple/0 via-ai-purple/90 to-ai-blue/0 shadow-[0_0_18px_rgba(124,58,237,0.45)]"
        />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/78 shadow-[0_0_14px_rgba(255,255,255,0.6)]" />
      </div>
    </div>
  );
}

export function LanguageGate() {
  const { setLanguage, showSelector } = useLanguage();

  return (
    <AnimatePresence>
      {showSelector ? (
        <motion.div
          key="language-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(4,6,10,0.76)] px-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[25rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(10,10,14,0.88)] p-4 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.9)] sm:max-w-[28rem] sm:p-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.13),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.11),transparent_34%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/[0.03]" />

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.78rem] font-medium tracking-[0.04em] text-white/74 sm:mb-6">
                <Globe2 size={14} aria-hidden="true" />
                Nexo Base
              </div>

              <div className="w-full rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <LanguageOption
                    language="es"
                    label="Español"
                    code="ES"
                    accentClassName="from-ai-purple/0 via-ai-purple to-ai-purple/0"
                    glowClassName="bg-ai-purple/26"
                    onSelect={setLanguage}
                  />
                  <LanguageOption
                    language="en"
                    label="English"
                    code="EN"
                    accentClassName="from-ai-blue/0 via-ai-blue to-ai-blue/0"
                    glowClassName="bg-ai-blue/24"
                    onSelect={setLanguage}
                  />
                </div>
              </div>

              <NeonAccent />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
