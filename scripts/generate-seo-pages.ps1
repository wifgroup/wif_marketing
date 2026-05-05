$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$site = "https://wifmarketing.co"
$lastmod = "2026-05-03"

function RelPrefix([string]$Path) {
  if ($Path -like "*/*") { return "../" }
  return ""
}

function HtmlList($Items) {
  return (($Items | ForEach-Object { "            <li>$_</li>" }) -join "`n")
}

function Cards($Items) {
  return (($Items | ForEach-Object {
@"
        <article class="service-panel reveal">
          <span>$($_.Label)</span>
          <h3>$($_.Title)</h3>
          <p>$($_.Text)</p>
        </article>
"@
  }) -join "`n")
}

function FaqItems($Items) {
  return (($Items | ForEach-Object {
@"
          <article class="faq-item reveal">
            <button type="button" aria-expanded="false">$($_.Question)</button>
            <div class="faq-answer"><p>$($_.Answer)</p></div>
          </article>
"@
  }) -join "`n")
}

function ResolveHref([string]$Prefix, [string]$Href) {
  if ($Href -match "^(https?:|mailto:|tel:|#|/|\.\./)") { return $Href }
  return "$Prefix$Href"
}

function RenderPage($Page) {
  $prefix = RelPrefix $Page.Path
  $canonical = "$site/$($Page.Path)"
  $cards = Cards $Page.Cards
  $faq = FaqItems $Page.Faq
  $proof = HtmlList $Page.Proof
  $process = HtmlList $Page.Process
  $related = (($Page.Related | ForEach-Object {
    $href = ResolveHref $prefix $_.Href
    "          <a href=""$href"">$($_.Text)</a>"
  }) -join "`n")
  $imageBlock = ""
  if ($Page.Image) {
    $imageBlock = @"
          <img src="$prefix$($Page.Image)" alt="$($Page.ImageAlt)" loading="lazy" width="$($Page.ImageWidth)" height="$($Page.ImageHeight)">
"@
  }

@"
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$($Page.Title)</title>
  <meta name="description" content="$($Page.Description)">
  <meta name="geo.region" content="IN-GJ">
  <meta name="geo.placename" content="Surat, Gujarat">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="$canonical">
  <link rel="icon" href="${prefix}assets/favicon/favicon.ico" type="image/x-icon">
  <link rel="manifest" href="${prefix}assets/favicon/site.webmanifest">
  <meta property="og:title" content="$($Page.OgTitle)">
  <meta property="og:description" content="$($Page.Description)">
  <meta property="og:type" content="website">
  <meta property="og:url" content="$canonical">
  <meta property="og:image" content="$site/assets/image/wif_marketing.png">
  <link rel="stylesheet" href="${prefix}styles/site.css">
  <script src="${prefix}scripts/site.js" defer></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "$canonical#webpage",
        "url": "$canonical",
        "name": "$($Page.Title)",
        "description": "$($Page.Description)",
        "isPartOf": { "@id": "$site/#website" },
        "about": { "@id": "$site/#organization" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "$canonical#breadcrumbs",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "$site/" },
          { "@type": "ListItem", "position": 2, "name": "$($Page.Breadcrumb)", "item": "$canonical" }
        ]
      },
      {
        "@type": "ProfessionalService",
        "@id": "$site/#service",
        "name": "WIF Marketing",
        "url": "$site/",
        "email": "business@wifmarketing.co",
        "telephone": "+91-9537192471",
        "areaServed": ["Surat", "Gujarat", "India", "United States", "United Kingdom", "Canada", "Australia"],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Surat",
          "addressRegion": "Gujarat",
          "addressCountry": "IN"
        }
      }
    ]
  }
  </script>
</head>

<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header" data-header>
    <div class="shell header-shell">
      <a href="${prefix}index.html" class="brand" aria-label="WIF Marketing home"><img src="${prefix}assets/image/wif_marketing.png" alt="WIF Marketing" width="148" height="48"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle><span></span><span></span><span></span></button>
      <nav class="site-nav" id="site-menu" data-site-menu aria-label="Primary navigation">
        <a href="${prefix}services.html">Services</a>
        <a href="${prefix}case-studies.html">Case Studies</a>
        <a href="${prefix}about.html">About</a>
        <a href="${prefix}contact.html">Contact</a>
        <a class="nav-cta" href="https://cal.com/wifmarketing/free-audit" target="_blank" rel="noopener noreferrer">Book Free Audit</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="page-hero seo-landing-hero">
      <div class="shell page-hero-grid">
        <div class="reveal">
          <p class="eyebrow">$($Page.Eyebrow)</p>
          <h1>$($Page.H1)</h1>
          <p class="page-lede">$($Page.Lede)</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${prefix}contact.html#audit">Book Free Audit</a>
            <a class="btn btn-secondary" href="${prefix}case-studies.html">View proof</a>
          </div>
        </div>
        <aside class="service-snapshot reveal">
          <span>$($Page.SnapshotLabel)</span>
          <strong>$($Page.SnapshotStrong)</strong>
          <p>$($Page.SnapshotText)</p>
          <dl>
            <div><dt>Market</dt><dd>$($Page.Market)</dd></div>
            <div><dt>Best fit</dt><dd>$($Page.BestFit)</dd></div>
            <div><dt>Output</dt><dd>$($Page.Output)</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section seo-detail-section">
      <div class="shell split-heading">
        <div class="reveal">
          <p class="eyebrow">$($Page.SectionEyebrow)</p>
          <h2>$($Page.SectionTitle)</h2>
        </div>
        <p class="section-intro reveal">$($Page.SectionIntro)</p>
      </div>
      <div class="shell service-matrix">
$cards
      </div>
    </section>

    <section class="section blueprint-section">
      <div class="shell process-grid">
        <div class="process-intro reveal">
          <p class="eyebrow">$($Page.ProcessEyebrow)</p>
          <h2>$($Page.ProcessTitle)</h2>
          <p>$($Page.ProcessIntro)</p>
        </div>
        <div class="contact-panel reveal">
          <ul>
$process
          </ul>
        </div>
      </div>
    </section>

    <section class="section proof-section">
      <div class="shell case-card case-card-feature reveal">
        <div class="case-card-media">
$imageBlock
          <span>$($Page.ProofLabel)</span>
          <strong>$($Page.ProofStat)</strong>
        </div>
        <div class="case-card-content">
          <p class="case-label">$($Page.ProofEyebrow)</p>
          <h2>$($Page.ProofTitle)</h2>
          <p>$($Page.ProofIntro)</p>
          <ul class="case-bullets">
$proof
          </ul>
          <div class="seo-related-links">
$related
          </div>
        </div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="shell faq-grid">
        <div class="reveal">
          <p class="eyebrow">FAQ</p>
          <h2>$($Page.FaqTitle)</h2>
        </div>
        <div class="faq-list" data-accordion>
$faq
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="shell cta-grid">
        <div class="reveal"><p class="eyebrow">Free growth audit</p><h2>$($Page.Cta)</h2></div>
        <div class="cta-actions reveal"><a class="btn btn-primary" href="${prefix}contact.html#audit">Book Free Audit</a><a class="btn btn-secondary" href="${prefix}services.html">Explore services</a></div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-grid">
      <div><a href="${prefix}index.html" class="footer-brand"><img src="${prefix}assets/image/wif_marketing.png" alt="WIF Marketing" width="140" height="45" loading="lazy"></a><p>Performance marketing agency for paid ads, SEO growth pages, tracking, automation and revenue-focused reporting.</p></div>
      <div><h2>Services</h2><a href="${prefix}services/google-ads-agency-surat.html">Google Ads</a><a href="${prefix}services/seo-agency-surat.html">SEO</a><a href="${prefix}services/linkedin-ads-agency-india.html">LinkedIn Ads</a></div>
      <div><h2>Markets</h2><a href="${prefix}digital-marketing-agency-surat.html">Surat</a><a href="${prefix}performance-marketing-agency-surat.html">Performance Marketing</a><a href="${prefix}industries/ev-marketing-agency-india.html">EV Marketing</a></div>
      <div><h2>Contact</h2><a href="mailto:business@wifmarketing.co">business@wifmarketing.co</a><a href="tel:+919537192471">+91 95371 92471</a><span>Surat, Gujarat, India</span></div>
    </div>
    <div class="shell footer-bottom"><span>&copy; <span data-year></span> WIF Marketing.</span><span>Built for search, speed and conversion.</span></div>
  </footer>
</body>

</html>
"@
}

function FlattenArgs([object[]]$Items) {
  $flat = @()
  foreach ($item in $Items) {
    if ($item -is [System.Array]) {
      foreach ($subItem in $item) {
        $flat += $subItem
      }
    } else {
      $flat += $item
    }
  }
  return $flat
}

function NewCard {
  param(
    [string]$Label,
    [string]$Title,
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$Rest
  )

  $Rest = FlattenArgs $Rest
  $items = @()
  $i = 0
  $textParts = @()
  while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewCard") {
    $textParts += [string]$Rest[$i]
    $i++
  }
  $items += @{ Label = $Label; Title = $Title; Text = ($textParts -join " ") }

  while ($i -lt $Rest.Count) {
    if ([string]$Rest[$i] -eq "NewCard") { $i++ }
    if ($i + 2 -ge $Rest.Count) { break }
    $nextLabel = [string]$Rest[$i]
    $nextTitle = [string]$Rest[$i + 1]
    $i += 2
    $nextTextParts = @()
    while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewCard") {
      $nextTextParts += [string]$Rest[$i]
      $i++
    }
    $items += @{ Label = $nextLabel; Title = $nextTitle; Text = ($nextTextParts -join " ") }
  }

  return $items
}

function NewFaq {
  param(
    [string]$Question,
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$Rest
  )

  $Rest = FlattenArgs $Rest
  $items = @()
  $i = 0
  $answerParts = @()
  while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewFaq") {
    $answerParts += [string]$Rest[$i]
    $i++
  }
  $items += @{ Question = $Question; Answer = ($answerParts -join " ") }

  while ($i -lt $Rest.Count) {
    if ([string]$Rest[$i] -eq "NewFaq") { $i++ }
    if ($i + 1 -ge $Rest.Count) { break }
    $nextQuestion = [string]$Rest[$i]
    $i++
    $nextAnswerParts = @()
    while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewFaq") {
      $nextAnswerParts += [string]$Rest[$i]
      $i++
    }
    $items += @{ Question = $nextQuestion; Answer = ($nextAnswerParts -join " ") }
  }

  return $items
}

function NewLink {
  param(
    [string]$Href,
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$Rest
  )

  $Rest = FlattenArgs $Rest
  $items = @()
  $i = 0
  $textParts = @()
  while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewLink") {
    $textParts += [string]$Rest[$i]
    $i++
  }
  $items += @{ Href = $Href; Text = ($textParts -join " ") }

  while ($i -lt $Rest.Count) {
    if ([string]$Rest[$i] -eq "NewLink") { $i++ }
    if ($i + 1 -ge $Rest.Count) { break }
    $nextHref = [string]$Rest[$i]
    $i++
    $nextTextParts = @()
    while ($i -lt $Rest.Count -and [string]$Rest[$i] -ne "NewLink") {
      $nextTextParts += [string]$Rest[$i]
      $i++
    }
    $items += @{ Href = $nextHref; Text = ($nextTextParts -join " ") }
  }

  return $items
}

$defaultRelated = @(
  NewLink "services/google-ads-agency-surat.html" "Google Ads agency Surat",
  NewLink "services/seo-agency-surat.html" "SEO agency Surat",
  NewLink "case-studies.html" "Case studies"
)

$pages = @(
  @{
    Path = "digital-marketing-agency-surat.html"
    Title = "Digital Marketing Agency in Surat | WIF Marketing"
    Description = "WIF Marketing is a Surat-based digital marketing agency for Google Ads, SEO growth pages, Meta Ads, LinkedIn Ads, tracking and lead-generation systems."
    OgTitle = "Digital Marketing Agency in Surat"
    Breadcrumb = "Digital Marketing Agency Surat"
    Eyebrow = "Surat digital marketing agency"
    H1 = "Digital marketing agency in Surat for leads, sales and measurable growth."
    Lede = "WIF Marketing helps Surat and Gujarat businesses turn traffic into qualified leads with paid media, SEO pages, tracking, landing-page improvements and follow-up workflows."
    SnapshotLabel = "Local growth system"
    SnapshotStrong = "Surat demand to revenue"
    SnapshotText = "Built for local businesses, showrooms, D2C brands, B2B teams and service companies that need accountable marketing."
    Market = "Surat, Gujarat, India"
    BestFit = "Local and growth-stage brands"
    Output = "Audit, campaigns, pages, tracking"
    SectionEyebrow = "What WIF builds"
    SectionTitle = "A digital marketing system, not disconnected channel work."
    SectionIntro = "The priority is to connect the buyer journey from search and paid traffic to conversion, follow-up and reporting."
    Cards = @(
      NewCard "Paid media" "Google, Meta, LinkedIn and YouTube campaigns" "Campaigns are planned around buyer intent, channel role, creative testing and weekly budget movement.",
      NewCard "Organic growth" "SEO pages for Surat and Gujarat searches" "Service pages, location pages and content assets are structured for search demand and lead conversion.",
      NewCard "Conversion" "Landing page and tracking cleanup" "Forms, CTAs, proof, events and UTM discipline are reviewed before scale decisions."
    )
    ProcessEyebrow = "Local SEO and lead generation"
    ProcessTitle = "How WIF approaches Surat market growth."
    ProcessIntro = "The first step is understanding the current funnel and whether the problem is traffic, page conversion, tracking or follow-up."
    Process = @("Audit the website, offer, current channels and local search visibility.", "Build or improve service pages around high-intent Surat and Gujarat keywords.", "Launch controlled paid campaigns with tracking and conversion feedback.", "Review lead quality and follow-up speed before increasing spend.")
    ProofLabel = "Reported proof"
    ProofStat = "500+ campaigns"
    ProofEyebrow = "Why buyers should trust the system"
    ProofTitle = "Current site data reports 500+ campaigns and 98% client retention."
    ProofIntro = "The proof base should keep expanding, but WIF already has reported outcomes across EV, D2C, B2B and automation work."
    Proof = @("Bajaj Chetak: 800+ EV leads and Rs. 5 Cr+ reported revenue in 90 days.", "Revolt Motors: Rs. 20L+ reported first-month showroom revenue.", "Evanta International: global B2B lead-generation presence.")
    Related = $defaultRelated
    FaqTitle = "Questions Surat businesses ask before hiring a digital marketing agency."
    Faq = @(NewFaq "Does WIF only serve Surat businesses?" "No. WIF is based in Surat and supports Gujarat, India and international campaigns.", NewFaq "Which channels should a local business start with?" "It depends on buyer intent. WIF usually reviews Google Search, Meta, local SEO pages and follow-up speed first.", NewFaq "Can WIF improve an existing campaign?" "Yes. The audit reviews account structure, tracking, landing pages, lead quality and wasted spend.")
    Cta = "Show WIF the current funnel and get a sharper local growth plan."
    Image = "assets/image/casestudy/Revolt Showroom Launch.png"; ImageAlt = "Revolt showroom launch campaign visual"; ImageWidth = "1535"; ImageHeight = "1024"
  },
  @{
    Path = "performance-marketing-agency-surat.html"
    Title = "Performance Marketing Agency in Surat | WIF Marketing"
    Description = "Hire WIF Marketing for performance marketing in Surat: Google Ads, SEO growth pages, paid social, tracking, lead response and revenue reporting."
    OgTitle = "Performance Marketing Agency in Surat"
    Breadcrumb = "Performance Marketing Agency Surat"
    Eyebrow = "Performance marketing Surat"
    H1 = "Performance marketing agency in Surat built for measurable pipeline."
    Lede = "WIF Marketing connects acquisition, landing pages, tracking and follow-up so campaigns are judged by useful business movement, not surface metrics."
    SnapshotLabel = "Performance system"
    SnapshotStrong = "Traffic to qualified action"
    SnapshotText = "For brands that want controlled growth across paid ads, SEO demand, conversion pages and CRM handoff."
    Market = "Surat, Gujarat, India"
    BestFit = "EV, D2C, B2B, local launches"
    Output = "30-day operating plan"
    SectionEyebrow = "Operating model"
    SectionTitle = "A channel is only useful when the funnel can prove what it produced."
    SectionIntro = "WIF uses performance marketing as a full-funnel operating system, not only media buying."
    Cards = @(
      NewCard "Demand" "Capture search and paid demand" "Google, LinkedIn, Meta and YouTube campaigns are organized around buyer stage and offer clarity.",
      NewCard "Conversion" "Improve the page after the click" "Landing pages and SEO pages are reviewed for proof, form friction and message match.",
      NewCard "Reporting" "Move spend with evidence" "Weekly reporting separates traffic, leads, qualified leads and revenue signals."
    )
    ProcessEyebrow = "Cadence"
    ProcessTitle = "The first month is built to find waste before scale."
    ProcessIntro = "WIF starts with current account reality and builds a practical plan before pushing budgets higher."
    Process = @("Audit spend, search terms, audiences, creative and conversion events.", "Map the offer and page sections each campaign needs.", "Launch controlled tests with weekly review points.", "Move budget toward campaigns showing quality and pipeline movement.")
    ProofLabel = "Reported impact"; ProofStat = "5x ROI"; ProofEyebrow = "Current site data"; ProofTitle = "WIF reports an average 5x ROI on paid ads in current site data."; ProofIntro = "Results are not guarantees, but they help show the type of commercial movement WIF is built around."
    Proof = @("500+ campaigns delivered according to current site data.", "98% client retention reported in current site data.", "EV and showroom case studies provide category-specific proof.")
    Related = $defaultRelated
    FaqTitle = "Performance marketing questions."
    Faq = @(NewFaq "What makes performance marketing different?" "It focuses on measurable movement such as qualified leads, pipeline, bookings and revenue, not only impressions or clicks.", NewFaq "Do you guarantee ROI?" "No agency should guarantee exact ROI. WIF builds tracking, testing and reporting to improve the odds of profitable decisions.", NewFaq "How quickly can campaigns launch?" "Most campaigns need audit, access, tracking and offer clarity before launch. The exact timeline depends on readiness.")
    Cta = "Get a performance audit before adding more budget."
    Image = "assets/image/casestudy/Bajaj Chetak Revenue Scale.png"; ImageAlt = "Bajaj Chetak revenue scale campaign visual"; ImageWidth = "1537"; ImageHeight = "1023"
  },
  @{
    Path = "services/google-ads-agency-surat.html"
    Title = "Google Ads Agency in Surat | WIF Marketing"
    Description = "Google Ads agency in Surat for search, YouTube, Performance Max, landing-page conversion, tracking and lead-generation campaigns."
    OgTitle = "Google Ads Agency in Surat"
    Breadcrumb = "Google Ads Agency Surat"
    Eyebrow = "Google Ads agency Surat"
    H1 = "Google Ads agency in Surat for high-intent lead generation."
    Lede = "WIF Marketing manages Google Ads campaigns for businesses that need search intent, landing pages and conversion tracking connected to revenue decisions."
    SnapshotLabel = "Search intent"
    SnapshotStrong = "Google Ads with tracking"
    SnapshotText = "Built for showrooms, local services, B2B teams, D2C brands and companies with commercial search demand."
    Market = "Surat, Gujarat, India"
    BestFit = "Search-led lead generation"
    Output = "Campaign rebuild + tracking map"
    SectionEyebrow = "Google Ads system"
    SectionTitle = "Search campaigns should capture demand without wasting budget."
    SectionIntro = "WIF reviews search terms, structure, landing pages and conversion events before scaling spend."
    Cards = @(
      NewCard "Structure" "Campaign architecture and intent groups" "Campaigns are organized by buyer intent, location, offer and conversion goal.",
      NewCard "Efficiency" "Keyword and search term control" "Negative keywords, match types and search term reviews protect budget from low-fit clicks.",
      NewCard "Measurement" "Conversion and lead quality feedback" "Google Ads decisions are connected to forms, calls, qualified leads and revenue signals."
    )
    ProcessEyebrow = "Campaign workflow"; ProcessTitle = "What WIF checks before scaling Google Ads."; ProcessIntro = "The goal is to reduce wasted spend before asking the account to grow."
    Process = @("Audit current search terms, spend, conversions and landing pages.", "Rebuild campaigns around intent and geography.", "Validate conversion tracking and UTM structure.", "Move budget toward segments with useful cost and lead quality.")
    ProofLabel = "EV lead generation"; ProofStat = "800+ leads"; ProofEyebrow = "Related proof"; ProofTitle = "Bajaj Chetak reported 800+ EV leads at 18.75% conversion."; ProofIntro = "The case shows why search demand, page conversion and follow-up must work together."
    Proof = @("Use Google Ads when buyers are actively searching for a product or service.", "Protect spend with search term discipline.", "Review lead quality before increasing budget.")
    Related = @(NewLink "../case-studies/bajaj-chetak-ev-lead-generation.html" "Bajaj Chetak lead-generation case", NewLink "services/seo-agency-surat.html" "SEO agency Surat", NewLink "../digital-marketing-agency-surat.html" "Digital marketing agency Surat")
    FaqTitle = "Google Ads questions."
    Faq = @(NewFaq "Can WIF manage existing Google Ads accounts?" "Yes. WIF can audit and rebuild existing accounts when tracking, structure or lead quality needs improvement.", NewFaq "Does Google Ads work for local Surat businesses?" "It can, especially when people already search for the service or product. The landing page and follow-up system still matter.", NewFaq "Do you manage YouTube or Performance Max?" "Yes, where those campaign types fit the funnel and tracking is clear.")
    Cta = "Audit the Google Ads account before increasing spend."
    Image = "assets/image/casestudy/Bajaj Chetak Lead Generation.png"; ImageAlt = "Bajaj Chetak lead-generation campaign visual"; ImageWidth = "1586"; ImageHeight = "992"
  },
  @{
    Path = "services/seo-agency-surat.html"
    Title = "SEO Agency in Surat | WIF Marketing"
    Description = "SEO agency in Surat for service pages, local SEO, landing pages, keyword mapping and conversion-focused organic growth."
    OgTitle = "SEO Agency in Surat"
    Breadcrumb = "SEO Agency Surat"
    Eyebrow = "SEO agency Surat"
    H1 = "SEO agency in Surat for service pages that convert search demand."
    Lede = "WIF Marketing builds SEO growth pages for businesses that need local visibility, commercial search traffic and clearer conversion paths."
    SnapshotLabel = "Organic growth"
    SnapshotStrong = "Search pages with intent"
    SnapshotText = "For Surat, Gujarat and India brands that need more qualified search visibility without relying only on ads."
    Market = "Surat, Gujarat, India"
    BestFit = "Service, location and industry pages"
    Output = "Keyword map + page plan"
    SectionEyebrow = "SEO page system"; SectionTitle = "SEO needs topic depth, not one generic service page."; SectionIntro = "WIF maps keywords to dedicated pages so Google and buyers can understand each service and market."
    Cards = @(
      NewCard "Keyword map" "Service and location targeting" "Pages are planned around searches such as SEO agency Surat, digital marketing agency Surat and Google Ads agency Surat.",
      NewCard "Content depth" "Helpful, buyer-first sections" "Each page explains who it is for, what WIF does, proof, process, FAQs and next steps.",
      NewCard "Conversion" "Organic traffic with a CTA path" "SEO pages are shaped to generate audit calls, not only visits."
    )
    ProcessEyebrow = "SEO workflow"; ProcessTitle = "How WIF builds search pages."; ProcessIntro = "The work starts by separating parent, service, city, industry and resource intent."
    Process = @("Map primary and secondary keywords to unique URLs.", "Create page structures with FAQs, proof and internal links.", "Add schema, titles, descriptions and sitemap entries.", "Monitor Search Console and improve pages with impressions.")
    ProofLabel = "SEO expansion"; ProofStat = "35+ pages"; ProofEyebrow = "Implementation direction"; ProofTitle = "The site now has dedicated SEO landing pages to build topical authority."; ProofIntro = "This page is part of a wider service/location/industry architecture designed from the audit."
    Proof = @("Dedicated pages help avoid one broad services page targeting every keyword.", "Local pages support Surat and Gujarat search relevance.", "Resource pages create useful internal linking and topical support.")
    Related = @(NewLink "../digital-marketing-agency-surat.html" "Digital marketing agency Surat", NewLink "services/google-ads-agency-surat.html" "Google Ads agency Surat", NewLink "../resources/local-seo-checklist-surat-businesses.html" "Local SEO checklist")
    FaqTitle = "SEO questions."
    Faq = @(NewFaq "Can WIF help local SEO in Surat?" "Yes. WIF can build local service pages, improve site structure and support Google Business Profile content strategy.", NewFaq "How long does SEO take?" "SEO usually takes weeks to months. Early work should focus on technical clarity, page targeting and helpful content.", NewFaq "Do SEO pages need case studies?" "Yes. Proof, examples and process details make pages more useful and trustworthy.")
    Cta = "Start with an SEO page and keyword audit."
    Image = "assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt = "Evanta International B2B lead-generation visual"; ImageWidth = "1535"; ImageHeight = "1024"
  },
  @{
    Path = "services/linkedin-ads-agency-india.html"
    Title = "LinkedIn Ads Agency in India | WIF Marketing"
    Description = "LinkedIn Ads agency in India for B2B lead generation, audience targeting, offer testing, landing pages and pipeline reporting."
    OgTitle = "LinkedIn Ads Agency in India"
    Breadcrumb = "LinkedIn Ads Agency India"
    Eyebrow = "LinkedIn Ads agency India"
    H1 = "LinkedIn Ads agency in India for B2B lead generation."
    Lede = "WIF Marketing plans LinkedIn Ads around buyer role, company type, offer clarity and pipeline reporting for B2B teams."
    SnapshotLabel = "B2B acquisition"
    SnapshotStrong = "LinkedIn demand to pipeline"
    SnapshotText = "For SaaS, IT, consulting, export and B2B brands that need higher-fit conversations."
    Market = "India and international B2B"
    BestFit = "B2B lead generation"
    Output = "Audience, offer and reporting plan"
    SectionEyebrow = "B2B media"; SectionTitle = "LinkedIn works when audience, offer and follow-up are precise."; SectionIntro = "WIF treats LinkedIn as a pipeline channel, not just a lead-form source."
    Cards = @(
      NewCard "Audience" "Role and company targeting" "Campaigns target decision-makers by seniority, function, company type and market.",
      NewCard "Offer" "Message and asset testing" "WIF tests proof, pain points, audit offers and conversion actions for different buyer groups.",
      NewCard "Pipeline" "Reporting beyond the form fill" "LinkedIn performance is reviewed against qualified leads and sales feedback."
    )
    ProcessEyebrow = "LinkedIn workflow"; ProcessTitle = "The first setup should make sales follow-up easier."; ProcessIntro = "The campaign plan has to match how a B2B buyer evaluates risk."
    Process = @("Define ICP, job roles, company filters and geographic priority.", "Build landing page or form flow around a clear offer.", "Connect CRM routing and source context.", "Review lead quality with the sales team before scaling.")
    ProofLabel = "B2B proof"; ProofStat = "Global"; ProofEyebrow = "Related proof"; ProofTitle = "Evanta International shows WIF's global B2B lead-generation direction."; ProofIntro = "The current portfolio includes B2B positioning and international lead-generation presence."
    Proof = @("B2B campaigns need stronger qualification than broad consumer campaigns.", "Landing pages should explain proof and next steps clearly.", "CRM follow-up determines whether LinkedIn lead volume becomes pipeline.")
    Related = @(NewLink "../industries/b2b-lead-generation-agency-india.html" "B2B lead generation agency India", NewLink "../case-studies/evanta-international-b2b-lead-generation.html" "Evanta case study", NewLink "services/workflow-automation.html" "Workflow automation")
    FaqTitle = "LinkedIn Ads questions."
    Faq = @(NewFaq "Is LinkedIn Ads only for enterprise brands?" "No. It can work for focused B2B offers when the audience and offer are narrow enough.", NewFaq "Do you use lead forms or landing pages?" "Both can work. WIF chooses based on offer complexity, follow-up process and tracking needs.", NewFaq "Can WIF support international B2B campaigns?" "Yes. The site positioning includes India and international B2B service delivery.")
    Cta = "Map your LinkedIn Ads funnel before spending more."
    Image = "assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt = "Evanta International B2B lead-generation visual"; ImageWidth = "1535"; ImageHeight = "1024"
  },
  @{
    Path = "services/meta-ads-agency-india.html"
    Title = "Meta Ads Agency in India | WIF Marketing"
    Description = "Meta Ads agency in India for D2C, local launches, showroom campaigns, creative testing, retargeting and lead-generation funnels."
    OgTitle = "Meta Ads Agency in India"
    Breadcrumb = "Meta Ads Agency India"
    Eyebrow = "Meta Ads agency India"
    H1 = "Meta Ads agency in India for D2C and local growth campaigns."
    Lede = "WIF Marketing uses Meta Ads for demand creation, retargeting, launch visibility and lead-generation systems tied to pages and follow-up."
    SnapshotLabel = "Paid social"
    SnapshotStrong = "Creative testing to action"
    SnapshotText = "Built for D2C brands, showrooms, local launches and campaigns where creative angles drive demand."
    Market = "India and selected international markets"
    BestFit = "D2C, local launches, retargeting"
    Output = "Creative and campaign testing plan"
    SectionEyebrow = "Meta system"; SectionTitle = "Meta Ads need creative testing and conversion discipline."; SectionIntro = "The channel can create demand, but the funnel still needs a strong page, offer and response path."
    Cards = @(
      NewCard "Creative" "Hooks, proof and offer angles" "WIF tests different buyer motivations and creative messages instead of relying on one ad idea.",
      NewCard "Audience" "Prospecting and retargeting logic" "Campaigns separate cold demand, warm audiences and remarketing where useful.",
      NewCard "Follow-up" "Lead capture and response" "Meta lead quality is protected with better forms, calling and CRM handoff."
    )
    ProcessEyebrow = "Meta workflow"; ProcessTitle = "From creative testing to lead quality."; ProcessIntro = "Meta works best when creative learning and sales feedback are connected."
    Process = @("Audit offer, past creative, landing page and lead quality.", "Build a testing matrix for hooks, visuals and audiences.", "Connect lead forms or pages to follow-up workflows.", "Scale creative and audiences that produce quality signals.")
    ProofLabel = "D2C and launch"; ProofStat = "First sales"; ProofEyebrow = "Related proof"; ProofTitle = "Jivan Amrut and Revolt show launch and D2C campaign use cases."; ProofIntro = "The current portfolio includes D2C launch and showroom growth examples."
    Proof = @("D2C launch work needs quick learning loops.", "Showroom campaigns need local reach and fast follow-up.", "Creative performance should be judged with lead quality and revenue context.")
    Related = @(NewLink "../industries/d2c-marketing-agency-india.html" "D2C marketing agency India", NewLink "../case-studies/jivan-amrut-d2c-launch.html" "Jivan Amrut case", NewLink "../case-studies/revolt-showroom-launch-surat.html" "Revolt showroom case")
    FaqTitle = "Meta Ads questions."
    Faq = @(NewFaq "Can Meta Ads generate leads?" "Yes, but lead quality depends on audience, creative, offer, form design and follow-up speed.", NewFaq "Is Meta better for D2C or B2B?" "Meta is often stronger for D2C, local launches and retargeting, but some B2B campaigns can work with the right offer.", NewFaq "Does WIF handle creative testing?" "Yes. WIF includes ad hooks and creative testing as part of campaign optimization.")
    Cta = "Build a Meta testing plan tied to real lead quality."
    Image = "assets/image/casestudy/jivanmarut.png"; ImageAlt = "Jivan Amrut D2C launch campaign visual"; ImageWidth = "1586"; ImageHeight = "992"
  },
  @{
    Path = "services/ai-calling-agent-lead-qualification.html"
    Title = "AI Calling Agent for Lead Qualification | WIF Marketing"
    Description = "AI calling agent service for lead qualification, fast response, call summaries, CRM updates and sales routing for marketing leads."
    OgTitle = "AI Calling Agent for Lead Qualification"
    Breadcrumb = "AI Calling Agent Lead Qualification"
    Eyebrow = "AI calling agent"
    H1 = "AI calling agent for lead qualification and faster follow-up."
    Lede = "WIF Marketing connects lead forms and campaigns to AI calling workflows that qualify intent, capture context and route prospects while interest is fresh."
    SnapshotLabel = "Response engine"
    SnapshotStrong = "Lead response before intent drops"
    SnapshotText = "For businesses generating leads from ads, SEO pages, forms, landing pages or local campaigns."
    Market = "India and international campaigns"
    BestFit = "Lead qualification and routing"
    Output = "Call script + workflow map"
    SectionEyebrow = "Automation layer"; SectionTitle = "Many campaigns lose value after the lead arrives."; SectionIntro = "An AI calling agent can help qualify leads quickly and keep sales teams focused on the right next action."
    Cards = @(
      NewCard "Call flow" "Script and qualification logic" "Questions collect intent, urgency, location, product interest and next-step readiness.",
      NewCard "Summary" "Lead context for sales teams" "Call outcomes can be summarized and tagged so sales does not start cold.",
      NewCard "Routing" "CRM updates and handoff rules" "Hot, warm and low-fit leads can be routed to the right owner or workflow."
    )
    ProcessEyebrow = "Automation workflow"; ProcessTitle = "The calling agent should match your sales process."; ProcessIntro = "WIF maps what the call needs to learn and how each outcome should move through the CRM."
    Process = @("Review lead sources, forms and sales handoff.", "Write call prompts and qualification logic.", "Connect summaries, tags and lead status updates.", "Monitor outcomes and refine the script based on real calls.")
    ProofLabel = "Automation"; ProofStat = "Faster follow-up"; ProofEyebrow = "Related proof"; ProofTitle = "WIF includes AI calling agents in its lead-response operating system."; ProofIntro = "The goal is to protect the value created by paid media and SEO pages."
    Proof = @("Fast follow-up can improve the chance of reaching high-intent leads.", "Qualification helps sales teams prioritize the right opportunities.", "CRM context makes campaign reporting more useful.")
    Related = @(NewLink "services/workflow-automation.html" "Workflow automation", NewLink "services/crm-lead-routing-automation.html" "CRM lead routing", NewLink "../case-studies/ai-calling-agent-lead-qualification.html" "AI calling case")
    FaqTitle = "AI calling agent questions."
    Faq = @(NewFaq "What does the AI calling agent ask?" "It can ask about interest, urgency, location, product/service need and next-step readiness.", NewFaq "Does it replace sales teams?" "No. It supports sales by qualifying and summarizing leads so humans can prioritize better.", NewFaq "Can it update a CRM?" "Yes, when connected to the right workflow and CRM fields.")
    Cta = "Add fast qualification to your lead-generation system."
    Image = "assets/image/casestudy/AI Calling Agent.png"; ImageAlt = "AI calling agent dashboard for lead qualification"; ImageWidth = "1448"; ImageHeight = "1086"
  },
  @{
    Path = "services/workflow-automation.html"
    Title = "Marketing Workflow Automation | WIF Marketing"
    Description = "Marketing workflow automation for lead capture, CRM routing, alerts, reminders, source tracking and sales handoff."
    OgTitle = "Marketing Workflow Automation"
    Breadcrumb = "Workflow Automation"
    Eyebrow = "Workflow automation"
    H1 = "Marketing workflow automation for cleaner lead handoff."
    Lede = "WIF Marketing builds workflows that connect ad leads, website forms, CRM stages, team alerts and follow-up reminders."
    SnapshotLabel = "Sales ops"
    SnapshotStrong = "Campaigns connected to action"
    SnapshotText = "For teams that generate leads but lose speed, ownership or source context after the form fill."
    Market = "India and international service delivery"
    BestFit = "Lead routing and CRM workflows"
    Output = "Automation map + routing rules"
    SectionEyebrow = "Workflow system"; SectionTitle = "Marketing performance improves when handoff is visible."; SectionIntro = "The post-lead process can waste campaign results if ownership, reminders and source context are unclear."
    Cards = @(
      NewCard "Capture" "Forms and ad leads enter one system" "New inquiries keep campaign, source and offer context attached.",
      NewCard "Route" "Assign owners and priority" "Rules can route leads based on source, service, location, fit and urgency.",
      NewCard "Recover" "Reminders and missed follow-up checks" "Automation can flag stalled leads before they disappear from the pipeline."
    )
    ProcessEyebrow = "Workflow build"; ProcessTitle = "How WIF maps lead routing."; ProcessIntro = "The workflow is built around what sales needs to know and do next."
    Process = @("Audit current lead capture and CRM stages.", "Define source fields, owner rules and qualification statuses.", "Build alerts, reminders and update logic.", "Review missed-follow-up and reporting gaps weekly.")
    ProofLabel = "Automation proof"; ProofStat = "Cleaner handoff"; ProofEyebrow = "Related proof"; ProofTitle = "Workflow automation is part of WIF's ad-to-CRM operating model."; ProofIntro = "This supports paid media, SEO pages and AI calling agents by keeping leads connected to action."
    Proof = @("CRM routing helps sales teams act faster.", "Source context helps reporting stay useful.", "Workflow maps reduce dependency on manual follow-up memory.")
    Related = @(NewLink "services/ai-calling-agent-lead-qualification.html" "AI calling agent", NewLink "services/crm-lead-routing-automation.html" "CRM lead routing", NewLink "../case-studies/workflow-automation-crm-routing.html" "Workflow automation case")
    FaqTitle = "Workflow automation questions."
    Faq = @(NewFaq "Which tools can be connected?" "The exact stack depends on the CRM and forms in use. WIF starts by mapping the current workflow.", NewFaq "Is this only for paid ads?" "No. It can support paid, organic, referral and direct website leads.", NewFaq "What is the main benefit?" "Cleaner handoff, faster response and better reporting context.")
    Cta = "Map the lead handoff before more leads go cold."
    Image = "assets/image/casestudy/Workflow Automation.png"; ImageAlt = "Workflow automation dashboard for ad-to-CRM handoff"; ImageWidth = "1586"; ImageHeight = "992"
  }
)

$morePages = @(
  @{ Path="services/ppc-agency-surat.html"; Title="PPC Agency in Surat | WIF Marketing"; Keyword="PPC agency in Surat"; H1="PPC agency in Surat for search and paid social lead generation."; Focus="PPC campaigns across Google, Meta and LinkedIn with tracking, landing pages and lead-quality review."; Image="assets/image/casestudy/Bajaj Chetak Lead Generation.png"; ImageAlt="Bajaj Chetak lead generation campaign visual"; ImageWidth="1586"; ImageHeight="992" },
  @{ Path="services/local-seo-agency-surat.html"; Title="Local SEO Agency in Surat | WIF Marketing"; Keyword="local SEO agency in Surat"; H1="Local SEO agency in Surat for service businesses and local demand."; Focus="Local SEO pages, Google Business Profile content direction, location signals and conversion-focused service pages."; Image="assets/image/casestudy/Revolt Showroom Launch.png"; ImageAlt="Revolt showroom launch visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="services/google-ads-management-india.html"; Title="Google Ads Management India | WIF Marketing"; Keyword="Google Ads management in India"; H1="Google Ads management in India for controlled campaign growth."; Focus="Search, YouTube and paid acquisition systems for brands that need conversion tracking and weekly budget decisions."; Image="assets/image/casestudy/Bajaj Chetak Revenue Scale.png"; ImageAlt="Bajaj Chetak revenue campaign visual"; ImageWidth="1537"; ImageHeight="1023" },
  @{ Path="services/crm-lead-routing-automation.html"; Title="CRM Lead Routing Automation | WIF Marketing"; Keyword="CRM lead routing automation"; H1="CRM lead routing automation for marketing and sales teams."; Focus="Lead assignment, source context, reminders, pipeline stages and handoff rules for paid and organic inquiries."; Image="assets/image/casestudy/Workflow Automation.png"; ImageAlt="Workflow automation dashboard"; ImageWidth="1586"; ImageHeight="992" },
  @{ Path="industries/ev-marketing-agency-india.html"; Title="EV Marketing Agency India | WIF Marketing"; Keyword="EV marketing agency India"; H1="EV marketing agency in India for showrooms, launches and lead generation."; Focus="EV campaigns need search intent, local reach, showroom follow-up and revenue reporting working together."; Image="assets/image/casestudy/revolt-ev.png"; ImageAlt="Revolt Motors EV campaign visual"; ImageWidth="1586"; ImageHeight="992" },
  @{ Path="industries/showroom-marketing-agency-surat.html"; Title="Showroom Marketing Agency in Surat | WIF Marketing"; Keyword="showroom marketing agency Surat"; H1="Showroom marketing agency in Surat for local launch and footfall campaigns."; Focus="Showroom growth needs local demand capture, Meta reach, Google Search, lead routing and fast sales response."; Image="assets/image/casestudy/Revolt Showroom Launch.png"; ImageAlt="Revolt showroom launch campaign visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="industries/d2c-marketing-agency-india.html"; Title="D2C Marketing Agency India | WIF Marketing"; Keyword="D2C marketing agency India"; H1="D2C marketing agency in India for launches, first sales and scale."; Focus="D2C growth depends on offer clarity, creative testing, landing page conversion and learning loops."; Image="assets/image/casestudy/jivanmarut.png"; ImageAlt="Jivan Amrut D2C launch campaign visual"; ImageWidth="1586"; ImageHeight="992" },
  @{ Path="industries/b2b-lead-generation-agency-india.html"; Title="B2B Lead Generation Agency India | WIF Marketing"; Keyword="B2B lead generation agency India"; H1="B2B lead generation agency in India for qualified pipeline."; Focus="B2B lead generation needs ICP targeting, proof-led pages, LinkedIn or Google campaigns and CRM follow-up."; Image="assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt="Evanta International B2B lead-generation visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="industries/export-business-marketing-gujarat.html"; Title="Export Business Marketing Gujarat | WIF Marketing"; Keyword="export business marketing Gujarat"; H1="Export business marketing in Gujarat for international B2B demand."; Focus="Export-focused businesses need global positioning, service pages, LinkedIn targeting and lead qualification workflows."; Image="assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt="B2B lead generation campaign visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="industries/textile-marketing-agency-surat.html"; Title="Textile Marketing Agency Surat | WIF Marketing"; Keyword="textile marketing agency Surat"; H1="Textile marketing agency in Surat for B2B and export lead generation."; Focus="Surat textile businesses can use SEO pages, LinkedIn outreach, Google intent and lead routing to reach buyers."; Image="assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt="B2B marketing campaign visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="global/google-ads-agency-usa.html"; Title="Google Ads Agency for US Businesses | WIF Marketing"; Keyword="Google Ads agency for US businesses"; H1="India-based Google Ads agency for US businesses."; Focus="WIF supports international Google Ads campaigns with search intent, landing page feedback and reporting discipline."; Image="assets/image/casestudy/Bajaj Chetak Lead Generation.png"; ImageAlt="Google Ads campaign visual"; ImageWidth="1586"; ImageHeight="992" },
  @{ Path="global/linkedin-ads-agency-usa.html"; Title="LinkedIn Ads Agency for US B2B Companies | WIF Marketing"; Keyword="LinkedIn Ads agency for US B2B companies"; H1="LinkedIn Ads agency for US B2B companies needing qualified leads."; Focus="B2B LinkedIn Ads require ICP clarity, offer testing, conversion pages and CRM-qualified reporting."; Image="assets/image/casestudy/Evanta International B2B Lead Generation.png"; ImageAlt="B2B LinkedIn lead generation visual"; ImageWidth="1535"; ImageHeight="1024" },
  @{ Path="global/performance-marketing-agency-uk.html"; Title="Performance Marketing Agency for UK Companies | WIF Marketing"; Keyword="performance marketing agency for UK companies"; H1="India-based performance marketing agency for UK growth teams."; Focus="WIF can support UK-facing campaigns with paid acquisition, SEO pages, tracking and lead-response workflows."; Image="assets/image/casestudy/Workflow Automation.png"; ImageAlt="Marketing workflow automation visual"; ImageWidth="1586"; ImageHeight="992" }
)

foreach ($p in $morePages) {
  $pages += @{
    Path = $p.Path
    Title = $p.Title
    Description = "$($p.H1) WIF Marketing builds paid media, SEO pages, tracking and follow-up systems from Surat, Gujarat for India and international clients."
    OgTitle = $p.Title
    Breadcrumb = $p.Keyword
    Eyebrow = $p.Keyword
    H1 = $p.H1
    Lede = $p.Focus
    SnapshotLabel = "SEO landing page"
    SnapshotStrong = "Search intent to action"
    SnapshotText = "A dedicated page built from the website audit to target a specific buyer search and explain WIF's process."
    Market = "Surat, Gujarat, India and international"
    BestFit = "Commercial searchers"
    Output = "Audit and operating plan"
    SectionEyebrow = "What WIF builds"
    SectionTitle = "A focused page for one service, market or industry."
    SectionIntro = "This page helps buyers understand the specific problem, WIF's approach and the proof or process connected to the offer."
    Cards = @(
      NewCard "Audit" "Current funnel diagnosis" "WIF reviews the existing page, channel, tracking and follow-up process before recommending scale.",
      NewCard "Build" "Campaign and page improvements" "The work connects traffic source, message, conversion path and reporting.",
      NewCard "Operate" "Weekly decisions and next steps" "Campaigns are reviewed by useful signals such as qualified leads, sales feedback and revenue movement."
    )
    ProcessEyebrow = "Process"
    ProcessTitle = "How the engagement starts."
    ProcessIntro = "The first step is not more activity. It is clarity on where the current funnel is leaking."
    Process = @("Review current website, offer, channels and available data.", "Map the target buyer and the page or campaign needed for that intent.", "Fix tracking, message gaps and lead handoff points.", "Create a 30-day action plan tied to measurable outcomes.")
    ProofLabel = "Related proof"
    ProofStat = "WIF system"
    ProofEyebrow = "Proof and context"
    ProofTitle = "WIF's reported portfolio includes EV, D2C, B2B and automation work."
    ProofIntro = "Use the case studies as directional proof, not as a guarantee. Actual outcomes depend on market, offer, budget, tracking and follow-up."
    Proof = @("Bajaj Chetak: 800+ leads and Rs. 5 Cr+ reported revenue in 90 days.", "Revolt Motors: Rs. 20L+ reported first-month showroom launch revenue.", "Evanta International: global B2B lead-generation presence.")
    Related = $defaultRelated
    FaqTitle = "Common questions about $($p.Keyword)."
    Faq = @(NewFaq "Can WIF work with my current funnel?" "Yes. WIF starts by auditing your current website, campaigns, tracking and follow-up process.", NewFaq "Is this only for Surat businesses?" "No. Surat and Gujarat are primary local targets, but WIF also supports India and international campaigns.", NewFaq "What happens after the audit?" "You receive a clearer view of gaps and a practical next-step plan for campaigns, pages, tracking or automation.")
    Cta = "Turn this search intent into a measurable growth plan."
    Image = $p.Image; ImageAlt = $p.ImageAlt; ImageWidth = $p.ImageWidth; ImageHeight = $p.ImageHeight
  }
}

$cases = @(
  @{ Path="case-studies/bajaj-chetak-ev-lead-generation.html"; Title="Bajaj Chetak EV Lead Generation Case Study | WIF Marketing"; H1="Bajaj Chetak EV lead generation case study."; Stat="800+ leads"; Image="assets/image/casestudy/Bajaj Chetak Lead Generation.png"; Alt="Bajaj Chetak lead generation campaign visual"; W="1586"; H="992"; Focus="WIF supported EV lead generation with paid acquisition and conversion-focused follow-up. Current site data reports 800+ leads at an 18.75% conversion rate." },
  @{ Path="case-studies/bajaj-chetak-revenue-scale.html"; Title="Bajaj Chetak Revenue Scale Case Study | WIF Marketing"; H1="Bajaj Chetak 90-day revenue scale case study."; Stat="Rs. 5 Cr+"; Image="assets/image/casestudy/Bajaj Chetak Revenue Scale.png"; Alt="Bajaj Chetak revenue scaling campaign visual"; W="1537"; H="1023"; Focus="The same EV acquisition system moved from lead volume into reported revenue performance, with current site data reporting Rs. 5 Cr+ in 90 days." },
  @{ Path="case-studies/revolt-showroom-launch-surat.html"; Title="Revolt Showroom Launch Surat Case Study | WIF Marketing"; H1="Revolt showroom launch case study in Surat."; Stat="Rs. 20L+"; Image="assets/image/casestudy/Revolt Showroom Launch.png"; Alt="Revolt showroom launch campaign visual"; W="1535"; H="1024"; Focus="The showroom campaign focused on local demand, launch visibility and conversion momentum. Current site data reports Rs. 20L+ in first-month revenue." },
  @{ Path="case-studies/revolt-motors-ev-marketing.html"; Title="Revolt Motors EV Marketing Case Study | WIF Marketing"; H1="Revolt Motors EV market entry case study."; Stat="Rs. 1 Cr+"; Image="assets/image/casestudy/revolt-ev.png"; Alt="Revolt Motors EV market entry campaign visual"; W="1586"; H="992"; Focus="Revolt Motors used WIF Marketing for launch and growth execution. Current site data reports Rs. 1 Cr+ revenue across six months." },
  @{ Path="case-studies/evanta-international-b2b-lead-generation.html"; Title="Evanta International B2B Lead Generation Case Study | WIF Marketing"; H1="Evanta International B2B lead generation case study."; Stat="Global"; Image="assets/image/casestudy/Evanta International B2B Lead Generation.png"; Alt="Evanta International B2B lead generation visual"; W="1535"; H="1024"; Focus="WIF helped strengthen international visibility and lead-generation momentum for a global B2B audience." },
  @{ Path="case-studies/jivan-amrut-d2c-launch.html"; Title="Jivan Amrut D2C Launch Case Study | WIF Marketing"; H1="Jivan Amrut D2C launch case study."; Stat="First sales"; Image="assets/image/casestudy/jivanmarut.png"; Alt="Jivan Amrut D2C launch campaign visual"; W="1586"; H="992"; Focus="WIF supported the Ayurveda brand in moving online, launching an MVP and reaching first buyers through digital acquisition." },
  @{ Path="case-studies/ai-calling-agent-lead-qualification.html"; Title="AI Calling Agent Lead Qualification Case Study | WIF Marketing"; H1="AI calling agent lead qualification case study."; Stat="Faster follow-up"; Image="assets/image/casestudy/AI Calling Agent.png"; Alt="AI calling agent dashboard for lead qualification"; W="1448"; H="1086"; Focus="WIF can connect paid lead forms to an AI calling workflow that confirms interest, captures context and routes qualified prospects." },
  @{ Path="case-studies/workflow-automation-crm-routing.html"; Title="Workflow Automation CRM Routing Case Study | WIF Marketing"; H1="Workflow automation and CRM routing case study."; Stat="Cleaner handoff"; Image="assets/image/casestudy/Workflow Automation.png"; Alt="Workflow automation dashboard for ad-to-CRM handoff"; W="1586"; H="992"; Focus="The automation model moves inquiries from ad forms into CRM stages, assigns ownership, sends alerts and keeps source context attached." }
)

foreach ($c in $cases) {
  $pages += @{
    Path = $c.Path
    Title = $c.Title
    Description = "$($c.H1) $($c.Focus)"
    OgTitle = $c.Title
    Breadcrumb = $c.H1
    Eyebrow = "Case study"
    H1 = $c.H1
    Lede = $c.Focus
    SnapshotLabel = "Reported outcome"
    SnapshotStrong = $c.Stat
    SnapshotText = "Case-study results reflect current site data and past reported outcomes, not guaranteed future performance."
    Market = "India and selected international contexts"
    BestFit = "Proof review"
    Output = "Problem, approach, result"
    SectionEyebrow = "Case context"
    SectionTitle = "What the case shows about the growth system."
    SectionIntro = "Each case is useful because it connects acquisition, page clarity, follow-up or reporting to a business outcome."
    Cards = @(
      NewCard "Situation" "A clear commercial problem" "The campaign needed a path from demand to measurable action, not only more visibility.",
      NewCard "Approach" "Campaign, page and follow-up alignment" "The work connected paid or organic demand with conversion and response workflows.",
      NewCard "Learning" "A repeatable growth lever" "The lesson is used to shape future audits, service pages and campaign decisions."
    )
    ProcessEyebrow = "Method"; ProcessTitle = "How to read this case study."; ProcessIntro = "WIF presents case data with limits so buyers can judge relevance to their own funnel."
    Process = @("Understand the market and buyer path.", "Identify the channel and conversion problem.", "Connect campaigns to lead capture and follow-up.", "Review reported results with context and caveats.")
    ProofLabel = "Case result"; ProofStat = $c.Stat; ProofEyebrow = "Reported proof"; ProofTitle = $c.H1; ProofIntro = $c.Focus
    Proof = @("Results depend on offer, market, budget, tracking and sales follow-up.", "This case supports the related service pages with real portfolio context.", "Use the free audit to see which parts of this pattern apply to your business.")
    Related = @(NewLink "../case-studies.html" "All case studies", NewLink "../services/google-ads-agency-surat.html" "Google Ads agency Surat", NewLink "../services/workflow-automation.html" "Workflow automation")
    FaqTitle = "Questions about this case."
    Faq = @(NewFaq "Are these results guaranteed?" "No. They are reported portfolio outcomes and should be read with context.", NewFaq "Can WIF apply this to another business?" "The audit identifies which parts of the case pattern are relevant to your market and funnel.", NewFaq "What should I prepare before asking for similar work?" "Share your current website, campaign data, lead process, target market and growth goal.")
    Cta = "See which case-study pattern applies to your funnel."
    Image = $c.Image; ImageAlt = $c.Alt; ImageWidth = $c.W; ImageHeight = $c.H
  }
}

$resources = @(
  @{ Path="resources/google-ads-audit-checklist.html"; Title="Google Ads Audit Checklist | WIF Marketing"; Keyword="Google Ads audit checklist"; H1="Google Ads audit checklist for lead-generation accounts."; Focus="Use this checklist to review structure, search terms, conversion events, landing pages and lead quality before scaling spend." },
  @{ Path="resources/lead-generation-funnel-audit.html"; Title="Lead Generation Funnel Audit | WIF Marketing"; Keyword="lead generation funnel audit"; H1="Lead generation funnel audit for paid and organic campaigns."; Focus="A practical way to inspect how traffic becomes leads, how leads are qualified and where follow-up breaks." },
  @{ Path="resources/how-to-reduce-cost-per-lead-google-ads.html"; Title="How to Reduce Cost Per Lead in Google Ads | WIF Marketing"; Keyword="reduce cost per lead Google Ads"; H1="How to reduce cost per lead in Google Ads without killing quality."; Focus="Lower CPL is only useful when lead quality stays strong. This guide focuses on waste, intent, pages and follow-up." },
  @{ Path="resources/landing-page-sections-for-lead-generation.html"; Title="Landing Page Sections for Lead Generation | WIF Marketing"; Keyword="landing page sections for lead generation"; H1="Landing page sections every lead-generation page should review."; Focus="A conversion page should explain the offer, proof, process, fit, objections and next action clearly." },
  @{ Path="resources/local-seo-checklist-surat-businesses.html"; Title="Local SEO Checklist for Surat Businesses | WIF Marketing"; Keyword="local SEO checklist Surat businesses"; H1="Local SEO checklist for Surat businesses."; Focus="A local SEO checklist covering service pages, Google Business Profile, citations, reviews, schema and conversion paths." },
  @{ Path="resources/ai-calling-agent-lead-qualification-guide.html"; Title="AI Calling Agent Lead Qualification Guide | WIF Marketing"; Keyword="AI calling agent lead qualification guide"; H1="AI calling agent lead qualification guide."; Focus="A guide to mapping call scripts, qualification logic, CRM routing and sales handoff for marketing leads." },
  @{ Path="resources/utm-tracking-template-paid-ads.html"; Title="UTM Tracking Template for Paid Ads | WIF Marketing"; Keyword="UTM tracking template paid ads"; H1="UTM tracking template for paid ads and lead-generation reporting."; Focus="A simple framework for naming sources, campaigns, content and offers so reporting stays usable." },
  @{ Path="resources/b2b-linkedin-ads-playbook.html"; Title="B2B LinkedIn Ads Playbook | WIF Marketing"; Keyword="B2B LinkedIn Ads playbook"; H1="B2B LinkedIn Ads playbook for qualified lead generation."; Focus="A playbook for ICP targeting, offer testing, landing pages, lead forms and pipeline feedback." }
)

foreach ($r in $resources) {
  $pages += @{
    Path = $r.Path
    Title = $r.Title
    Description = "$($r.H1) $($r.Focus)"
    OgTitle = $r.Title
    Breadcrumb = $r.Keyword
    Eyebrow = "Resource"
    H1 = $r.H1
    Lede = $r.Focus
    SnapshotLabel = "Practical guide"
    SnapshotStrong = "Audit-ready checklist"
    SnapshotText = "Built as a helpful resource that supports WIF's service pages and gives buyers a usable framework."
    Market = "India and international"
    BestFit = "Founders and marketing teams"
    Output = "Checklist and next steps"
    SectionEyebrow = "Checklist"
    SectionTitle = "What to review first."
    SectionIntro = "This guide is designed to be useful before a call with WIF and practical enough to audit your own funnel."
    Cards = @(
      NewCard "Inputs" "What data to collect" "Gather campaign data, landing page URLs, conversion events, CRM fields and sales feedback.",
      NewCard "Diagnosis" "Where to look for waste" "Separate channel issues from page, offer, tracking and follow-up issues.",
      NewCard "Action" "What to change next" "Prioritize the changes that make measurement and lead quality clearer."
    )
    ProcessEyebrow = "How to use it"; ProcessTitle = "Use the resource as an audit starter."; ProcessIntro = "The goal is to enter the audit conversation with sharper context."
    Process = @("Document the current page, channel, source and conversion path.", "List what is trusted, unknown and likely broken.", "Prioritize fixes by business impact and effort.", "Bring the notes into a WIF audit call for a clearer next plan.")
    ProofLabel = "Resource"; ProofStat = "Practical"; ProofEyebrow = "Why it matters"; ProofTitle = "Helpful content supports better search visibility and better buyer decisions."; ProofIntro = "WIF's resource hub should prove expertise while helping real buyers solve marketing problems."
    Proof = @("Useful pages support SEO better than generic keyword pages.", "Checklists can earn links and help sales conversations.", "Resource pages should link naturally to service and case pages.")
    Related = @(NewLink "../services/seo-agency-surat.html" "SEO agency Surat", NewLink "../services/google-ads-agency-surat.html" "Google Ads agency Surat", NewLink "../contact.html#audit" "Book audit")
    FaqTitle = "Resource questions."
    Faq = @(NewFaq "Is this a replacement for a full audit?" "No. It helps you prepare, but account data and business context still matter.", NewFaq "Can WIF implement the fixes?" "Yes. WIF can help with campaigns, pages, tracking and automation after the audit.", NewFaq "Should this be used for India-only campaigns?" "No. The framework works for India and international campaigns with market-specific adjustments.")
    Cta = "Use the checklist, then bring WIF the funnel."
    Image = "assets/image/casestudy/Workflow Automation.png"; ImageAlt = "Workflow automation dashboard visual"; ImageWidth = "1586"; ImageHeight = "992"
  }
}

foreach ($page in $pages) {
  $target = Join-Path $root $page.Path
  $dir = Split-Path -Parent $target
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force $dir | Out-Null
  }
  RenderPage $page | Set-Content -LiteralPath $target -Encoding UTF8
}

$baseUrls = @(
  @{ Loc="$site/"; Priority="1.0"; Change="weekly" },
  @{ Loc="$site/services.html"; Priority="0.9"; Change="weekly" },
  @{ Loc="$site/case-studies.html"; Priority="0.9"; Change="weekly" },
  @{ Loc="$site/about.html"; Priority="0.7"; Change="monthly" },
  @{ Loc="$site/contact.html"; Priority="0.8"; Change="monthly" },
  @{ Loc="$site/privacy-policy.html"; Priority="0.3"; Change="yearly" },
  @{ Loc="$site/terms.html"; Priority="0.3"; Change="yearly" }
)

$urlItems = @()
foreach ($u in $baseUrls) {
  $urlItems += @"
  <url>
    <loc>$($u.Loc)</loc>
    <lastmod>$lastmod</lastmod>
    <changefreq>$($u.Change)</changefreq>
    <priority>$($u.Priority)</priority>
  </url>
"@
}

foreach ($page in $pages) {
  $priority = if ($page.Path -like "resources/*") { "0.6" } elseif ($page.Path -like "case-studies/*") { "0.75" } else { "0.85" }
  $urlItems += @"
  <url>
    <loc>$site/$($page.Path)</loc>
    <lastmod>$lastmod</lastmod>
    <changefreq>monthly</changefreq>
    <priority>$priority</priority>
  </url>
"@
}

$sitemap = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($urlItems -join "`n")
</urlset>
"@

$sitemap | Set-Content -LiteralPath (Join-Path $root "sitemap.xml") -Encoding UTF8

Write-Host "Generated $($pages.Count) SEO pages and updated sitemap.xml"
