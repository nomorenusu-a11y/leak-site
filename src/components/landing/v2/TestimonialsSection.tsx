import { Container } from "@/components/ui/Container";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialsCarouselClient } from "./TestimonialsCarouselClient";
import { getTestimonials } from "@/lib/site-content";

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

export async function TestimonialsSection() {
  const TESTIMONIALS = await getTestimonials();
  const supabase = createSupabaseAnonClient();

  const photos: Partial<Record<Cat, string>> = {};
  for (const t of TESTIMONIALS) {
    if (photos[t.category as Cat]) continue;
    const { data } = await supabase
      .from("posts")
      .select("cover_image_url")
      .eq("published", true)
      .eq("category", t.category as string)
      .not("cover_image_url", "is", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.cover_image_url) photos[t.category as Cat] = data.cover_image_url;
  }

  const items = TESTIMONIALS.map((t) => ({
    author: t.author,
    region: t.region,
    category: t.category,
    ko: t.ko,
    body: t.body,
    photo: photos[t.category as Cat] ?? null,
  }));

  return (
    <section id="reviews" className="scroll-mt-20 bg-slate-50 py-8 md:py-12">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">
            REVIEWS
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            BEST 후기 모아보기
          </h2>
          <p className="mt-3 text-slate-600">
            실제 시공 후 받은 고객님들의 후기입니다
          </p>
        </Reveal>

        <Reveal variant="fade" delay={0.1} className="mt-10">
          <TestimonialsCarouselClient items={items} />
        </Reveal>

        <p className="mt-6 text-center text-xs text-slate-500">
          * 후기는 개인의 의견이며, 실제 결과는 현장 상황에 따라 다를 수 있습니다.
        </p>
      </Container>
    </section>
  );
}
