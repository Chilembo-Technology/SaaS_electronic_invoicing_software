import { trustItems } from "../utils/featuresData";

/**
 * Faixa de confiança e segurança apresentada imediatamente sob o Hero.
 * Os selos vêm de `utils/featuresData.ts`.
 */
export function TrustBar() {
  return (
    <section aria-label="Confiança e segurança" className="landing-navy-band">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/20">
                  {Icon ? <Icon size={20} /> : null}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-white/70">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
