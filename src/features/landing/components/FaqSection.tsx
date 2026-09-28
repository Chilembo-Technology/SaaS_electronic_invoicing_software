import { Mail, MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../app/components/ui/accordion";
import { Button } from "../../../app/components/ui/button";
import { SectionHeading } from "../../../components/SectionHeading";
import { faqItems } from "../utils/faqData";

/** Secção de perguntas frequentes, construída sobre o `Accordion` (Radix) existente. */
export function FaqSection() {
  return (
    <section id="faq" className="landing-anchor bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Perguntas frequentes"
          subtitle="As dúvidas que recebemos mais vezes de empresas que estão a digitalizar a sua faturação."
        />

        <Accordion
          type="single"
          collapsible
          className="mt-12 rounded-2xl border border-border bg-card px-6 shadow-sm"
        >
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-border">
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA de apoio */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-brand-navy/15 bg-brand-navy/5 p-7 sm:flex-row sm:text-left">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm">
              <MessageCircle size={20} />
            </span>
            <div className="text-center sm:text-left">
              <p className="text-base font-bold text-foreground">Ainda tem dúvidas?</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Fale com a nossa equipa comercial: respondemos em menos de 1 dia útil.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-brand-navy/25 bg-white font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              <a href="mailto:comercial@faturamais.ao">
                <Mail size={16} />
                comercial@faturamais.ao
              </a>
            </Button>
            <Button
              asChild
              className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
            >
              <a href="https://wa.me/244923000000" target="_blank" rel="noreferrer">
                <MessageCircle size={16} />
                +244 923 000 000
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
