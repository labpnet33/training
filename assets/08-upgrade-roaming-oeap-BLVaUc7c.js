var e={id:`upgrade-roaming-oeap`,h:{en:`Efficient AP upgrade, fast roaming and OEAP (concept chapter)`,hi:`Efficient AP upgrade, fast roaming aur OEAP (concept chapter)`},body:{en:`
<p>This chapter covers the FlexConnect features that the labs do <b>not</b> simulate: efficient image upgrade, key caching for roaming in a branch, and the home-office AP. They are part of the ENWLSI FlexConnect blueprint area, so know the idea, the reason and the limits. Exact commands differ by release; treat command names here as pointers and confirm them in the configuration guide of your software version.</p>

<h3>Efficient AP image upgrade</h3>
<p>Imagine posting a 60 MB parcel to each of 30 shops over a thin rural road. A smarter way: post it to one shop (the <b>master</b>), and let that shop's neighbours collect it from the master on foot. That is <b>efficient AP upgrade</b>.</p>
<ul>
<li>Normally every AP downloads its image from the controller. With 30 APs at a branch, 30 copies cross the WAN.</li>
<li>With efficient upgrade, a few APs of the site are elected as <b>masters</b> (a primary and one or more secondaries). Each master downloads the image over the WAN once. The other APs of the same site then pull it from a master over the branch LAN.</li>
<li>Two benefits: far less WAN traffic, and a much shorter upgrade window because the LAN is fast.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Efficient AP upgrade over WAN once then branch LAN">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">WLC1 image</text>
<rect x="250" y="30" width="120" height="50" rx="8" fill="#fed7aa"/><text x="310" y="52" text-anchor="middle" class="svg-ink" font-size="13">Master AP</text><text x="310" y="69" text-anchor="middle" class="svg-muted" font-size="12">downloads once</text>
<rect x="480" y="10" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="33" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2 pulls</text>
<rect x="480" y="60" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="83" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN3 pulls</text>
<rect x="480" y="110" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="133" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN4 pulls</text>
<line x1="130" y1="95" x2="250" y2="55" stroke="#2563eb" stroke-width="4"/><text x="160" y="62" class="svg-accent" font-size="12">WAN, once</text>
<line x1="370" y1="55" x2="480" y2="28" stroke="#16a34a" stroke-width="2"/><line x1="370" y1="55" x2="480" y2="78" stroke="#16a34a" stroke-width="2"/><line x1="370" y1="55" x2="480" y2="128" stroke="#16a34a" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">branch LAN carries the other copies</text>
</svg><p class="cap">Efficient upgrade: one copy over the WAN, the rest over the branch LAN.</p></div>
<p>Related idea, <b>AP image pre-download</b> (preload): the AP downloads the new image in the background into its second partition while it serves clients, and swaps and reboots later in the maintenance window. The outage becomes one reboot, not a long download. On 9800 the efficient setting is configured with the flex profile or the AP join settings on current releases; confirm the exact place in your guide.</p>

<h3>Fast roaming inside a branch</h3>
<p>A client walking from AP-PUN1 to AP-PUN2 would normally redo the full 802.1X exchange, which needs a RADIUS server. In standalone mode, that is slow or impossible. <b>Key caching</b> lets the APs of one site share the client key material:</p>
<ul>
<li><b>OKC</b> (opportunistic key caching) and <b>CCKM</b> (Cisco's older scheme): the new AP already has the client key and finishes in a short handshake.</li>
<li><b>802.11r</b> (FT): the standard way; module wl-roaming explains it.</li>
</ul>
<p>The sharing group is the <b>site</b>: APs on the same flex site tag cooperate. Between two sites, keys are not shared, so a client always does a full authentication. Concept, and a design rule: <b>one site tag per branch</b>, never one site tag across two cities. On a 9800 a flex site tag also has a documented limit on the number of APs (commonly quoted as about 100; confirm on your release), which gives another reason to split large campuses into several site tags.</p>

<h3>OfficeExtend AP (OEAP)</h3>
<p>An employee works from home. Their company laptop should reach company systems, and the family's printer should still work. An <b>OEAP</b> is a FlexConnect AP placed at home, behind an ordinary internet router:</p>
<ul>
<li>It joins the controller over the internet. The controller must be reachable on a public address (or through NAT), and the CAPWAP session is protected with <b>DTLS</b>, for both control and data.</li>
<li>The <b>corporate SSID</b> is centrally switched: the traffic is tunnelled to headquarters and looks like an office client.</li>
<li>The <b>personal SSID</b> is locally switched: the family devices go to the home LAN directly.</li>
<li>With <b>split tunnelling</b> an ACL decides which corporate destinations are reached locally (home printer) while everything else is tunnelled.</li>
</ul>
<p>Security note: an OEAP puts a corporate radio in an untrusted location, so use strong WLAN security, DTLS and the ACLs and monitoring from your security policy. OEAP, split tunnelling and the whole page are <b>concept only</b> in this module; there is no OEAP lab.</p>

<div class="eg"><p><b>Worked example.</b> A branch has 24 APs and a 4 Mbps WAN. An image of 80 MB takes about 160 seconds per AP at full line rate, so downloading 24 copies is about 64 minutes of a saturated circuit. With one master and efficient upgrade, only about 160 seconds cross the WAN, the other 23 copies move on the branch LAN at 1 Gbps in the background.</p></div>

<div class="warn"><p><b>Common mistake.</b> Scheduling a mass upgrade of 200 branch APs "over the weekend" without pre-download. The WAN saturates, the APs time out and remain in a half upgraded state, and Monday starts with a ticket storm. Pre-download in the evening, swap in the window.</p></div>

<div class="exam"><p><b>Exam trap.</b> Efficient upgrade reduces <b>WAN</b> bandwidth; it does not remove the reboot. And key caching works inside a site (flex group), not across the company. The corporate SSID on an OEAP is the one that is centrally switched.</p></div>

<div class="scn"><h4>The 3 a.m. upgrade that finished at lunch</h4><p>A retailer upgraded 90 branch APs on a Sunday. The first attempt downloaded each image over 2 Mbps shop links and half the shops were still downloading on Monday morning. For the next release the team used efficient upgrade with pre-download on Friday evening, and swapped on Sunday at 3 a.m. Every shop finished before opening.</p><p><b>Lesson:</b> separate the download from the reboot, and send each image over the WAN only once per branch.</p></div>

<div class="iv"><p class="q">"How do you upgrade 500 branch APs over slow links?"</p><p>Use efficient AP upgrade, so only elected master APs download over the WAN and the others copy from them on the branch LAN, and pre-download the image in advance. Swap and reboot in a window, stagger by region, and verify image versions afterwards. Mention that confirmation of the exact commands depends on the release.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Efficient upgrade: masters download once over the WAN, other APs pull over the LAN.</li>
<li>Pre-download separates the long download from the short swap and reboot.</li>
<li>Key caching (OKC, CCKM, 802.11r) works between APs of one site tag.</li>
<li>One flex site tag per branch; there is a per-site AP limit to check on your release.</li>
<li>OEAP: corporate SSID central and DTLS-protected, personal SSID local; concept only here.</li>
</ul></div>
`,hi:`
<p>Yeh chapter FlexConnect ke woh features cover karta hai jo labs <b>simulate nahi</b> karte: efficient image upgrade, branch ke andar roaming ke liye key caching, aur home-office AP. Yeh ENWLSI FlexConnect blueprint area ka hissa hain, isliye idea, wajah aur limits jaano. Exact commands release ke hisaab se alag hote hain; yahan ke command names ko pointers samjho aur apne software version ki configuration guide mein confirm karo.</p>

<h3>Efficient AP image upgrade</h3>
<p>Socho 30 shops ko patli gaon ki sadak par 60 MB ka parcel bhejna hai. Smart tareeqa: ek shop (<b>master</b>) ko bhejo, aur uske padosi shops master se paidal jaakar le lein. Yahi <b>efficient AP upgrade</b> hai.</p>
<ul>
<li>Normally har AP apni image controller se download karta hai. Branch par 30 APs hon to 30 copies WAN cross karti hain.</li>
<li>Efficient upgrade mein site ke kuch APs <b>masters</b> elect hote hain (ek primary aur ek ya zyada secondaries). Har master image WAN ke upar ek baar download karta hai. Same site ke baaki APs phir master se branch LAN par pull karte hain.</li>
<li>Do fayde: WAN traffic bahut kam, aur upgrade window bahut chhoti kyunki LAN fast hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Efficient AP upgrade WAN par ek baar phir branch LAN">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">WLC1 image</text>
<rect x="250" y="30" width="120" height="50" rx="8" fill="#fed7aa"/><text x="310" y="52" text-anchor="middle" class="svg-ink" font-size="13">Master AP</text><text x="310" y="69" text-anchor="middle" class="svg-muted" font-size="12">ek baar download</text>
<rect x="480" y="10" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="33" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2 pull</text>
<rect x="480" y="60" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="83" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN3 pull</text>
<rect x="480" y="110" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="133" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN4 pull</text>
<line x1="130" y1="95" x2="250" y2="55" stroke="#2563eb" stroke-width="4"/><text x="160" y="62" class="svg-accent" font-size="12">WAN, ek baar</text>
<line x1="370" y1="55" x2="480" y2="28" stroke="#16a34a" stroke-width="2"/><line x1="370" y1="55" x2="480" y2="78" stroke="#16a34a" stroke-width="2"/><line x1="370" y1="55" x2="480" y2="128" stroke="#16a34a" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">baaki copies branch LAN par jaati hain</text>
</svg><p class="cap">Efficient upgrade: WAN par ek copy, baaki branch LAN par.</p></div>
<p>Related idea, <b>AP image pre-download</b> (preload): AP naya image background mein apni doosri partition mein download karta hai jabki clients serve karta hai, aur swap aur reboot baad mein maintenance window mein karta hai. Outage lambi download nahi, sirf ek reboot ban jata hai. 9800 par efficient setting current releases mein flex profile ya AP join settings ke saath configure hoti hai; exact jagah apni guide mein confirm karo.</p>

<h3>Branch ke andar fast roaming</h3>
<p>Client AP-PUN1 se AP-PUN2 tak chale to normally poora 802.1X exchange dobara karega, jisme RADIUS server chahiye. Standalone mode mein yeh slow ya impossible hai. <b>Key caching</b> ek site ke APs ko client key material share karne deta hai:</p>
<ul>
<li><b>OKC</b> (opportunistic key caching) aur <b>CCKM</b> (Cisco ki purani scheme): naye AP ke paas client key pehle se hoti hai aur woh chhote handshake mein khatam karta hai.</li>
<li><b>802.11r</b> (FT): standard tareeqa; module wl-roaming samjhata hai.</li>
</ul>
<p>Sharing group <b>site</b> hai: ek hi flex site tag ke APs cooperate karte hain. Do sites ke beech keys share nahi hoti, isliye client hamesha full authentication karta hai. Concept, aur design rule: <b>ek branch ke liye ek site tag</b>, do shehron par kabhi ek site tag nahi. 9800 par flex site tag mein APs ki sankhya par documented limit bhi hoti hai (aam taur par lagbhag 100 kaha jata hai; apne release par confirm karo), jo bade campuses ko kai site tags mein todne ki ek aur wajah hai.</p>

<h3>OfficeExtend AP (OEAP)</h3>
<p>Ek employee ghar se kaam karta hai. Company laptop ko company systems tak pahunchna hai, aur parivaar ka printer bhi chalna chahiye. <b>OEAP</b> ek FlexConnect AP hai jo ghar par normal internet router ke peeche lagta hai:</p>
<ul>
<li>Woh internet ke upar controller se join hota hai. Controller public address par (ya NAT ke through) reachable hona chahiye, aur CAPWAP session <b>DTLS</b> se protected hota hai, control aur data dono ke liye.</li>
<li><b>Corporate SSID</b> centrally switched hota hai: traffic headquarters tak tunnel hota hai aur office client jaisa dikhta hai.</li>
<li><b>Personal SSID</b> locally switched hota hai: ghar ke devices seedha home LAN par jaate hain.</li>
<li><b>Split tunnelling</b> ke saath ek ACL decide karta hai ki kaunsi corporate destinations locally reach hon (ghar ka printer) aur baaki sab tunnel ho.</li>
</ul>
<p>Security note: OEAP corporate radio ko untrusted jagah par rakhta hai, isliye strong WLAN security, DTLS aur apni security policy ke ACLs aur monitoring use karo. OEAP, split tunnelling aur yeh poora page is module mein <b>concept only</b> hain; koi OEAP lab nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> Branch mein 24 APs aur 4 Mbps WAN hai. 80 MB image full line rate par har AP ke liye lagbhag 160 second leti hai, isliye 24 copies download karna lagbhag 64 minute saturated circuit hai. Ek master aur efficient upgrade ke saath sirf lagbhag 160 second WAN cross karte hain, baaki 23 copies branch LAN par 1 Gbps par background mein jaati hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> 200 branch APs ka mass upgrade "weekend par" bina pre-download ke schedule karna. WAN saturate hota hai, APs timeout hote hain aur aadhe upgraded state mein rehte hain, aur Monday ticket storm se shuru hota hai. Shaam ko pre-download karo, window mein swap karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Efficient upgrade <b>WAN</b> bandwidth kam karta hai; reboot nahi hatata. Aur key caching site (flex group) ke andar kaam karti hai, poori company mein nahi. OEAP ka corporate SSID woh hai jo centrally switched hota hai.</p></div>

<div class="scn"><h4>3 baje raat ka upgrade jo lunch tak chala</h4><p>Ek retailer ne Sunday ko 90 branch APs upgrade kiye. Pehli koshish mein har image 2 Mbps shop links par download hui aur aadhi shops Monday subah tak download kar rahi thi. Agle release ke liye team ne Friday shaam ko pre-download ke saath efficient upgrade use kiya, aur Sunday 3 baje swap kiya. Har shop khulne se pehle khatam.</p><p><b>Lesson:</b> download ko reboot se alag karo, aur har image ko branch ke liye WAN par sirf ek baar bhejo.</p></div>

<div class="iv"><p class="q">"Slow links par 500 branch APs kaise upgrade karte ho?"</p><p>Efficient AP upgrade use karo, taaki sirf elected master APs WAN par download karein aur baaki branch LAN par unse copy karein, aur image ko pehle se pre-download karo. Window mein swap aur reboot karo, region ke hisaab se stagger karo, aur baad mein image versions verify karo. Bolo ki exact commands ki confirmation release par depend karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Efficient upgrade: masters WAN par ek baar download karte hain, baaki APs LAN par pull karte hain.</li>
<li>Pre-download lambi download ko chhote swap aur reboot se alag karta hai.</li>
<li>Key caching (OKC, CCKM, 802.11r) ek site tag ke APs ke beech kaam karti hai.</li>
<li>Ek branch ke liye ek flex site tag; per-site AP limit apne release par check karo.</li>
<li>OEAP: corporate SSID central aur DTLS-protected, personal SSID local; yahan concept only.</li>
</ul></div>
`}};export{e as default};