'use client';

import NavBar from '../slicings/navbar';
import BottomNav from '@/app/components/mobile/bottom-nav';
import Hero from '../slicings/section'; 
// 1. IMPORT KOMPONEN BLOG BARU
// import BlogSection from '../slicings/blog-section';
import Footer from '../slicings/footer';

const Start = () => {
  return (
    <div>
      <NavBar />
      <Hero />
      
      {/* Komponen yang Anda sembunyikan sebelumnya */}
      {/* <Feature /> */}
      {/* <Fitur /> */}
      
      {/* 2. EKSEKUSI PENAMPILAN BLOG SECTION */}
      {/* <BlogSection /> */}
      <div className="md:hidden block">
        <BottomNav />
      </div>

      <Footer />
    </div>
  );
};

export default Start;