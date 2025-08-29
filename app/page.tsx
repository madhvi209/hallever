import HeroSection from "../components/home/hero-section";
import AboutSection from "../components/home/about-section";
import ProductSection from "../components/home/product-section";
import BlogsSection from "../components/home/blogs-section";
import ProductCategories from "../components/home/product-categories";
import ContactUs from "../components/home/contactUs-section";
import TestimonialsSection from "@/components/home/testimonial-section";
import TeamMembers from "@/components/home/team-section";
import OffersPage from "@/components/home/offersBanner-section";
import CertificateSection from "@/components/home/certificate-section";

export default function Home() {
  return (
    <div>
     
      <HeroSection />
      <OffersPage/>
      <AboutSection />
      <ProductSection />
      <ProductCategories />
      <BlogsSection />
      <TeamMembers/>
      <TestimonialsSection />
      <CertificateSection />
      <ContactUs />
    </div>
  );
}
