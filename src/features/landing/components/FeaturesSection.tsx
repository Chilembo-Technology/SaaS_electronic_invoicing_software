import { cn } from "../../../app/components/ui/utils";
import { SectionHeading } from "../../../components/SectionHeading";
import { documentFeatureGroups } from "../utils/featuresData";

const accentStyles = [
  "bg-brand-navy/10 text-brand-navy",
  "bg-brand-teal/15 text-brand-teal",
  "bg-brand-green/15 text-brand-green",
];

/**
 * Secção de funcionalidades: apresenta, por família de documentos,
 * tudo o que o Fatura Mais emite de acordo com as regras da AGT.
 */
export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="landing-anchor bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Funcionalidades"
          title="Todos os documentos que a AGT exige"
          subtitle="Do orçamento à nota de crédito: emita cada documento com numeração sequencial, IVA e retenção corretos, assinatura digital e comunicação automática à AGT."
        />

        <div className="mt-14 space-y-16">
          {documentFeatureGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon;
            const accent = accentStyles[groupIndex % accentStyles.length];

            return (
              <div key={group.id}>
                {/* Cabeçalho do grupo */}
                <div className="flex flex-col gap-4 border-l-4 border-brand-teal/60 pl-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        accent,
                      )}
                    >
                      {GroupIcon ? <GroupIcon size={20} /> : null}
                    </span>
                    <div>
                      <h3
                        className="text-xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {group.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documentos do grupo */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {group.items.map((item) => (
                    <article
                      key={item.title}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/40 hover:shadow-lg"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white">
                        <span className="text-xs font-bold">
                          {item.title.charAt(0)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
