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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ice/10 text-2xl text-ice">
        ✓
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold">
        {reserved ? "Je reservering is geplaatst!" : "Bedankt voor je bestelling!"}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
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
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="secondary">
          Verder winkelen
        </Button>
        <Button href="/">Naar home</Button>
      </div>
    </Container>
  );
}
