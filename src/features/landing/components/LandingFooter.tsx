import { Link } from "react-router";

import {
  contactInfo,
  footerColumns,
  footerCopyright,
  footerTagline,
  socialLinks,
} from "../utils/footerData";
import { demoNoticeText, shouldShowDemoNotice } from "../utils/demoNotice";

/** Footer público da Landing: links úteis, contactos e informação legal. */
export function LandingFooter() {
  return (
    <footer id="contacto" className="landing-anchor landing-navy-band text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Marca */}
          <div className="lg:col-span-3">
            <span className="inline-flex rounded-xl bg-white px-3 py-2">
              <img
                src="/logo_with_name.png"
                alt="Fatura Mais"
                className="h-9 w-auto object-contain"
              />
            </span>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {footerTagline}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links úteis */}
          <nav className="lg:col-span-6" aria-label="Links úteis">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                    {column.title}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith("/") ? (
                          <Link
                            to={link.href}
                            className="text-sm text-white/80 transition-colors hover:text-white"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-sm text-white/80 transition-colors hover:text-white"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Contactos */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
              Contactos
            </p>
            <ul className="mt-4 space-y-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-2.5">
                    <Icon size={16} className="mt-0.5 shrink-0 text-brand-green" />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 rounded-xl bg-white/10 p-3 text-[11px] leading-relaxed text-white/70">
              Software de faturação eletrónica em conformidade com as regras da AGT
              (Administração Geral Tributária de Angola).
            </p>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/70">{footerCopyright}</p>
          {shouldShowDemoNotice ? (
            <p className="text-[11px] text-white/45">{demoNoticeText}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
