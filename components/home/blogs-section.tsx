'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { AppDispatch } from '@/lib/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, selectIsLoading, selectBlogs, } from '@/lib/redux/slice/blogSlice';
import Link from 'next/link';

const BlogsPreview = () => {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { t } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    const loading = useSelector(selectIsLoading);
    const blogs = useSelector(selectBlogs);

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    if (loading) {
        return <div className="text-white text-center py-20">Loading blogs...</div>;
    }

    return (
        <section id="blogs" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        {t('blogs.heading1')}{' '}
                        <span className="text-[var(--primary-red)]">
                            {t('blogs.heading2')}
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('blogs.subheading')}
                    </p>
                </motion.div>

                {/* Blog Cards */}
                <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch">
                    {(isHome ? blogs.slice(0, 2) : blogs).map((blog, index) => (
                        <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="w-full lg:w-[60%] group rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300"
                        >
                            <div className="relative h-[55vh]">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${blog.image})` }}
                                />
                            </div>

                            <div className="bg-black p-6 flex flex-col justify-between h-full">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-4 line-clamp-2">
                                        {blog.summary}
                                    </p>
                                    <Link href={`/blogs/${encodeURIComponent(blog.title.trim())}`}>
                                        <Button
                                            variant="outline"
                                            className="text-sm font-semibold px-6 py-2 border-border hover:bg-gray-300 hover:text-accent-foreground transition-all"
                                        >
                                            {t('button.readMore')} →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Conditionally Rendered More Blogs Button */}
                {isHome && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Button
                            size="lg"
                            className="bg-[var(--primary-red)] hover:bg-[var(--primary-red)]/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-hover transition-all duration-300 hover:scale-105"
                        >
                            {t('button.allBlogs')}
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default BlogsPreview;
