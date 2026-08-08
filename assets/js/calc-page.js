/* ============================================================
   DecideCalc — Calculator page scaffolding
   Renders breadcrumb, related tools, FAQ, schema, and binds
   the shared header/footer. Each calc page sets:
     DC.page = { slug, breadcrumb: [...], faqs: [{q,a}], relatedTitle }
   then calls DC.initCalcPage().
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  DC.initCalcPage = function () {
    const page = DC.page || {};
    const tool = DC.tool(page.slug);
    if (!tool) return;
    const cat = DC.catName(tool.cat);

    // Ensure engagement tracker is loaded once per page
    if (!window.__dcEngagementLoaded && !document.querySelector('script[src*="engagement.js"]')) {
      window.__dcEngagementLoaded = true;
      const s = document.createElement('script');
      s.src = DC.base + 'assets/js/engagement.js';
      s.defer = true;
      document.head.appendChild(s);
    }

    // Set document cat color var on root for the whole page tint
    document.documentElement.style.setProperty('--cat-color', cat.color);

    // 1. Inject schema (JSON-LD) in head
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "description": tool.blurb
    };
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": (page.faqs || []).map(function (f) {
        return { "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } };
      })
    };
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.decidecalc.com/" },
        { "@type": "ListItem", "position": 2, "name": cat.name, "item": "https://www.decidecalc.com/categories/" + cat.id },
        { "@type": "ListItem", "position": 3, "name": tool.name }
      ]
    };
    [schema, faqSchema, breadcrumbSchema].forEach(function (s) {
      const sc = document.createElement('script');
      sc.type = 'application/ld+json';
      sc.textContent = JSON.stringify(s);
      document.head.appendChild(sc);
    });

    // 2. Render related tools
    const relWrap = document.getElementById('relatedTools');
    if (relWrap) {
      const rel = DC.related(tool.slug, 3);
      relWrap.innerHTML = rel.map(function (r) {
        const rc = DC.catName(r.cat);
        return '<a class="mini-card" href="' + r.slug + '" style="--cat-color:' + rc.color + '">' +
          '<span class="mic">' + DC.icon(r.icon) + '</span>' +
          '<span><h4>' + r.name + '</h4><span>' + rc.name + '</span></span>' +
        '</a>';
      }).join('');
    }

    // 2b. Render related blog articles (curated in tools.js, not random)
    let artWrap = document.getElementById('relatedArticles');
    if (!artWrap) {
      // Insert after the relatedTools section on pages that only have that block.
      const relatedSection = document.getElementById('relatedTools');
      if (relatedSection) {
        const holder = relatedSection.closest('section');
        if (holder && holder.parentElement) {
          artWrap = document.createElement('section');
          artWrap.id = 'relatedArticles';
          artWrap.className = 'mt-4 reveal';
          holder.parentElement.insertBefore(artWrap, holder.nextElementSibling);
        }
      }
    }
    const relatedArticles = (DC.relatedArticlesList ? DC.relatedArticlesList(tool.slug, 3) : []);
    if (artWrap && relatedArticles.length) {
      artWrap.innerHTML = '<h3 class="related-title" style="margin-bottom:14px">Keep reading</h3>' +
        '<div class="related-mini">' + relatedArticles.map(function (slug) {
          const meta = DC.blogMeta && DC.blogMeta[slug];
          if (!meta) return '';
          return '<a class="mini-card" href="/blog/' + slug + '" style="--cat-color:var(--accent)">' +
            '<span class="mic">' + DC.icon(meta.icon || 'trending') + '</span>' +
            '<span><h4>' + meta.title + '</h4><span>Blog guide</span></span>' +
          '</a>';
        }).join('') + '</div>';
    }

    // 3. Render FAQ
    const faqWrap = document.getElementById('faqList');
    if (faqWrap && page.faqs) {
      faqWrap.innerHTML = page.faqs.map(function (f, i) {
        const id = 'faq-' + tool.slug + '-' + i;
        return '<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false" aria-controls="' + id + '">' + f.q + '<span class="pm" aria-hidden="true">+</span></button><div class="faq-a" id="' + id + '" role="region" aria-hidden="true"><p>' + f.a + '</p></div></div>';
      }).join('');
    }

    // 4. Header/footer + re-init dynamic bits
    DC.renderLayout();
    // title already set in HTML; ensure meta description if missing
    setTimeout(function () {
      DC.initReveal();
      DC.initFAQ();
      DC.initRanges();
      DC.initCounters();
      DC._injectCalcAds();
      DC._ensureAdsLib();
    }, 0);
  };

  /* Auto-inject an in-content ad slot on legacy calculator pages.
     New calculator templates own their responsive content/sidebar ad layout. */
  DC._injectCalcAds = function () {
    if (document.querySelector('.calc-ad-layout, .ad-slot[data-slot="content"]')) return;
    const main = document.querySelector('main');
    const calcLayout = main && main.querySelector('.calc-layout');
    if (!calcLayout) return;

    const contentAd = document.createElement('div');
    contentAd.className = 'ad-slot';
    contentAd.setAttribute('data-slot', 'content');
    contentAd.style.marginTop = '26px';
    main.insertBefore(contentAd, calcLayout.nextElementSibling);

    if (DC.initAds) DC.initAds();
  };

  /* Load assets/js/ads.js exactly once if not already present on this page. */
  DC._ensureAdsLib = function () {
    if (document.querySelector('script[src$="ads.js"]')) { if (DC.initAds) DC.initAds(); return; }
    const s = document.createElement('script');
    s.src = DC.base + 'assets/js/ads.js';
    s.defer = true;
    document.body.appendChild(s);
  };
})();
