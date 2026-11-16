import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";

export const metadata = { title: "Pagina niet gevonden" };

// Also where a sold item's old link lands once it's switched off in the admin.
export default function NotFound() {
  return (
    <Container className="flex min-h-[60dvh] flex-col justify-center py-20">
      <SectionIntro
        as="h1"
        enter="load"
        eyebrow="404"
        title="Deze pagina bestaat niet (meer)"
        lead="Zocht je een artikel uit de shop? Van (bijna) alles hebben we er maar één, dus de kans is groot dat het inmiddels verkocht is. Kijk wat er nu op voorraad is, of boek een beurt voor je eigen ski's of board."
      />
      <div className="mt-8 flex animate-rise flex-wrap gap-3.5 [animation-delay:240ms]">
        <Button href="/shop">Naar de shop</Button>
        <Button href="/" variant="secondary">
          Naar de homepage
        </Button>
      </div>
    </Container>
  );
}
