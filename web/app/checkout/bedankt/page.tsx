"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";

// NOTE: for online payments the definitive paid/failed state is set by the Mollie
// webhook. For pay-at-pickup the order is reserved and paid in person.
export default function BedanktPage() {
  const clear = useCart((s) => s.clear);
  const [ref, setRef] = useState<string | null>(null);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRef(params.get("ref"));
    setReserved(params.get("type") === "reserved");
    clear();
  }, [clear]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 animate-pop items-center justify-center rounded-full bg-ice/10 text-2xl text-ice [animation-delay:150ms]">
        ✓
      </div>
      <h1 className="mt-5 animate-rise font-display text-3xl font-semibold [animation-delay:250ms]">
        {reserved ? "Je reservering is geplaatst!" : "Bedankt voor je bestelling!"}
      </h1>
      <p className="mt-3 max-w-md animate-rise text-base leading-relaxed text-fg-muted [animation-delay:330ms]">
        {reserved ? (
          <>
            We houden je bestelling
            {ref ? (
              <>
                {" "}
                (referentie <span className="font-mono text-fg">{ref}</span>)
              </>
            ) : null}{" "}
            voor je apart. Je betaalt bij het ophalen in Hilvarenbeek — we laten je weten wanneer
            je langs kunt komen.
          </>
        ) : (
          <>
            We hebben je bestelling ontvangen
            {ref ? (
              <>
                {" "}
                — referentie <span className="font-mono text-fg">{ref}</span>
              </>
            ) : null}
            . Je krijgt een bevestiging per e-mail zodra de betaling is verwerkt, en we laten je
            weten wanneer je bestelling klaarstaat om op te halen in Hilvarenbeek.
          </>
        )}
      </p>
      <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:410ms]">
        <Button href="/shop" variant="secondary">
          Verder winkelen
        </Button>
        <Button href="/">Naar home</Button>
      </div>
    </Container>
  );
}
