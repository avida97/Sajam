import { ProductCarousel } from "@/components/catalog/ProductCarousel";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { PopularAuthors } from "@/components/home/PopularAuthors";
import { SellSteps } from "@/components/home/SellSteps";
import { FIGMA_AUTHORS } from "@/lib/authors";
import { getPopularAuthorsFromDb } from "@/lib/listings/popularity";
import { getNewestListings, getTrendingListings } from "@/lib/listings/query";

// Početna strana po Figmi (Homepage, 412:5089). Blog i newsletter iz dizajna dolaze posle MVP-a.
export default async function HomePage() {
  const [trending, newest, dbAuthors] = await Promise.all([
    getTrendingListings(30),
    getNewestListings(30),
    getPopularAuthorsFromDb(16),
  ]);
  const authors = dbAuthors.length >= 8 ? dbAuthors : FIGMA_AUTHORS;
  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductCarousel title="Trenutno u trendu" href="/knjige" listings={trending} />
      <PopularAuthors authors={authors} />
      <SellSteps />
      <ProductCarousel title="Novo u ponudi" href="/knjige?sort=najnovije" listings={newest} />
    </>
  );
}
