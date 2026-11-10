import { ProductCarousel } from "@/components/catalog/ProductCarousel";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { PopularAuthors } from "@/components/home/PopularAuthors";
import { SellSteps } from "@/components/home/SellSteps";
import { getNewestListings, getTrendingListings } from "@/lib/listings/query";

// Početna strana po Figmi (Homepage, 412:5089). Blog i newsletter iz dizajna dolaze posle MVP-a.
export default async function HomePage() {
  const [trending, newest] = await Promise.all([getTrendingListings(30), getNewestListings(30)]);
  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductCarousel title="Trenutno u trendu" href="/knjige" listings={trending} />
      <PopularAuthors />
      <SellSteps />
      <ProductCarousel title="Novo u ponudi" href="/knjige?sort=najnovije" listings={newest} />
    </>
  );
}
