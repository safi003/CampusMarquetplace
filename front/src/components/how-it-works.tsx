"use client";

import Stepper, { Step } from "@/components/ui/stepper";
import { ShieldCheck, CreditCard, Package, Star } from "lucide-react";

export default function HowItWorks() {
  return (
    <section>
      <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
        Comment ça marche ?
      </h2>
      <Stepper
        initialStep={1}
        onFinalStepCompleted={() => {}}
        backButtonText="Retour"
        nextButtonText="Suivant"
      >
        <Step>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA3A2]/10">
              <Package className="h-7 w-7 text-[#4AA3A2]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Déposez votre annonce</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Prenez plusieurs photos claires de votre article sous différents angles.
              Ajoutez une description détaillée et un prix juste pour attirer les acheteurs.
            </p>
          </div>
        </Step>
        <Step>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA3A2]/10">
              <CreditCard className="h-7 w-7 text-[#4AA3A2]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Paiement sécurisé</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              L&apos;acheteur peut payer en ligne par carte bancaire. Nous conservons l&apos;argent
              et ne le versemos au vendeur que si l&apos;acheteur confirme que tout est conforme,
              que ce soit en livraison ou en remise en main propre.
            </p>
          </div>
        </Step>
        <Step>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA3A2]/10">
              <ShieldCheck className="h-7 w-7 text-[#4AA3A2]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Protection acheteur</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Si votre commande est abîmée, perdue ou non conforme à l&apos;annonce, notre
              service client vous accompagne et peut vous rembourser. Le remboursement est
              possible tant que vous n&apos;avez pas validé la conformité de l&apos;article.
            </p>
          </div>
        </Step>
        <Step>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA3A2]/10">
              <Star className="h-7 w-7 text-[#4AA3A2]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Laissez un avis</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              À la fin de votre achat, acheteur et vendeur peuvent déposer un avis.
              Cela permet aux autres membres de la communauté de bénéficier de votre
              expérience et de faire confiance aux vendeurs.
            </p>
          </div>
        </Step>
      </Stepper>
    </section>
  );
}
