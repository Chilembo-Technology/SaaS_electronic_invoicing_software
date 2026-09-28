import { Quote, Star } from "lucide-react";

import { SectionHeading } from "../../../components/SectionHeading";
import { testimonials } from "../utils/testimonialsData";

/** Secção de testemunhos de clientes (avaliações fictícias de demonstração). */
export function TestimonialsSection() {
  return (
    <section id="testemunhos" className="landing-anchor bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testemunhos"
          title="Empresas angolanas que já faturam com o Fatura Mais"
          subtitle="Contabilidade, logística, retalho e serviços — veja o que dizem as equipas que emitem documentos connosco todos os dias."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex gap-1"
                  aria-label={`Avaliação de ${testimonial.rating} em 5 estrelas`}
                >
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className="fill-brand-green text-brand-green"
                    />
                  ))}
                </div>
                <Quote size={30} className="shrink-0 text-brand-teal/30" />
              </div>

              {testimonial.highlight ? (
                <span className="mt-4 inline-flex w-fit rounded-full bg-brand-navy/8 px-3 py-1 text-[11px] font-bold text-brand-navy">
                  {testimonial.highlight}
                </span>
              ) : null}

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                “{testimonial.quote}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  {testimonial.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Testemunhos fictícios, apresentados para demonstração do produto.
        </p>
      </div>
    </section>
  );
}
