var e={id:`content-filtering`,h:{en:`Content filtering: categories, allow and block lists, which wins`,hi:`Content filtering: categories, allow aur block lists, kaun jeetta hai`},body:{en:`
<h3>Why filter web content?</h3>
<p>Firewall rules answer "may this address talk to that address?". But a retail company also needs rules like "no gambling or malware sites from any shop network", and the list of such sites changes every day and lives behind thousands of addresses. <b>Content filtering</b> solves this by sorting websites into <b>categories</b> and letting you act on the category. The <b>Content filtering</b> page has three controls: blocked categories, an allow list of URLs and a block list of URLs.</p>

<h3>Categories</h3>
<p>A <b>category</b> is a group of sites with the same theme, assigned by the vendor's classification service. In our lab internet the sites are:</p>
<table class="cmp"><tr><th>Site name</th><th>Category</th><th>Typical policy at Bharat Retail Co</th></tr>
<tr><td>news.example</td><td>News</td><td>Allowed</td></tr>
<tr><td>social.example</td><td>Social</td><td>Blocked on the guest and staff networks during work hours (policy choice)</td></tr>
<tr><td>games.example</td><td>Gaming</td><td>Blocked</td></tr>
<tr><td>streaming.example</td><td>Streaming</td><td>Blocked on branches to save bandwidth</td></tr>
<tr><td>casino.example</td><td>Gambling</td><td>Blocked</td></tr>
<tr><td>malware.example</td><td>Malicious</td><td>Always blocked</td></tr>
<tr><td>intranet.example</td><td>(internal, 10.1.20.10)</td><td>Allowed: it is the company server</td></tr>
</table>
<p>Which categories exist and how a site is classified is decided by the vendor; check the vendor documentation. The names above are for training.</p>

<h3>Allow list and block list</h3>
<ul>
<li>The <b>block list</b> is a list of URLs (site names) that are blocked even if their category is allowed. Use it for one bad site in an otherwise fine category.</li>
<li>The <b>allow list</b> is a list of URLs that are allowed even if their category is blocked. Use it for one useful site in a blocked category, for example a supplier's site that the classifier files under Streaming.</li>
</ul>

<h3>Which wins? The order of evaluation</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Content filtering decision order">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. On the allow list?</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">yes: ALLOW, stop</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fecaca"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. On the block list?</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">yes: BLOCK, stop</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Category blocked?</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">yes: BLOCK, else ALLOW</text>
<line x1="200" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/><line x1="415" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="125" width="620" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Allow-list URLs override block-list URLs, then blocked categories decide</text><text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">A URL on both lists is allowed</text>
</svg><p class="cap">The allow list is read first, then the block list, then the category setting.</p></div>
<p>So <b>allow beats block</b>, and both beat the category. A site on both lists is allowed.</p>

<pre class="out">Content filtering  (network: Mumbai HQ)
Blocked categories : Gambling, Malicious, Gaming, Streaming
Allow list         : <span class="hl">streaming.example</span>
Block list         : social.example

Test results
URL                  Category    Decision   Reason
news.example         News        allow      category allowed
social.example       Social      block      block list
games.example        Gaming      block      category blocked
streaming.example    Streaming   <span class="hl">allow</span>      allow list overrides category
casino.example       Gambling    block      category blocked
malware.example      Malicious   block      category blocked</pre>

<div class="eg"><p><b>Worked example.</b> Head office decides streaming is blocked in branches, but the training team needs streaming.example for a vendor webinar. You keep Streaming in the blocked categories and add streaming.example to the allow list. Everyone can open that one site; other streaming sites remain blocked. Had you also put streaming.example on the block list, the allow list would still win.</p></div>

<h3>Content filtering and the firewall together</h3>
<p>Firewall rules and content filtering are separate controls. A connection must pass both: the firewall decides address-level access, and content filtering decides the web request. Intranet.example resolves to 10.1.20.10 in the server VLAN, so reaching it from Bengaluru needs the firewall to allow Staff to Servers across the site-to-site VPN (later module) and the filter to allow it.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Adding a category or a URL changes which web requests the appliance permits or drops after the Save changes click. It does not change VLANs, addresses or routing. On a template-bound network these settings are template-controlled and read-only (module 1): change them in the template. Real products also work on encrypted traffic in specific ways, and the details come from the vendor documentation.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Blocking a whole category and forgetting a business-critical site in it; assuming a block-list entry beats an allow-list entry; entering the URL in the wrong form (use the site name as the lab shows it); testing from a network where the policy is not applied.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A site is in a blocked category and also in the allow list. What happens?" It is allowed: allow list overrides category. "In both lists?" Allowed.</p></div>

<div class="scn"><h4>The supplier portal filed under Streaming</h4><p>After Bharat Retail Co blocked Streaming at all branches, Delhi's purchasing team could no longer open their supplier's video-training portal. Ticket opened: "internet is broken". The engineer tested the URL in the content-filtering results: category Streaming, decision block. Rather than unblock the whole category, they added the portal to the allow list and saved. The next test showed allow with reason "allow list overrides category".</p><p><b>Lesson:</b> use the narrowest exception that solves the problem.</p></div>

<div class="iv"><p class="q">"How do you handle a business site that is wrongly blocked by a category?"</p><p>Strong answer: confirm the decision in the filter test, keep the category blocked, add the exact URL to the allow list (allow beats block and category), save, retest and note the reason in the change log. Mention that over-broad unblocking creates risk and that exceptions should be reviewed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Content filtering acts on website categories plus allow and block URL lists.</li>
<li>Evaluation order: allow list, then block list, then blocked categories.</li>
<li>Allow beats block; a URL on both lists is allowed.</li>
<li>Filtering and firewall rules are separate; traffic must pass both.</li>
<li>Prefer narrow allow-list exceptions to unblocking whole categories.</li>
</ul></div>
`,hi:`
<h3>Web content filter kyun karte hain?</h3>
<p>Firewall rules jawab dete hain "kya yeh address us address se baat kar sakta hai?". Lekin retail company ko "kisi bhi shop network se gambling ya malware sites nahi" jaise rules bhi chahiye, aur aise sites ki list roz badalti hai aur hazaaron addresses ke peeche hoti hai. <b>Content filtering</b> yeh solve karta hai websites ko <b>categories</b> mein sort karke aur category par action lene deke. <b>Content filtering</b> page ke teen controls hain: blocked categories, URLs ki allow list aur URLs ki block list.</p>

<h3>Categories</h3>
<p><b>Category</b> ek theme wali sites ka group hai, jo vendor ki classification service assign karti hai. Humare lab internet mein sites yeh hain:</p>
<table class="cmp"><tr><th>Site name</th><th>Category</th><th>Bharat Retail Co mein typical policy</th></tr>
<tr><td>news.example</td><td>News</td><td>Allowed</td></tr>
<tr><td>social.example</td><td>Social</td><td>Guest aur staff networks par kaam ke ghanton mein blocked (policy choice)</td></tr>
<tr><td>games.example</td><td>Gaming</td><td>Blocked</td></tr>
<tr><td>streaming.example</td><td>Streaming</td><td>Bandwidth bachane ke liye branches par blocked</td></tr>
<tr><td>casino.example</td><td>Gambling</td><td>Blocked</td></tr>
<tr><td>malware.example</td><td>Malicious</td><td>Hamesha blocked</td></tr>
<tr><td>intranet.example</td><td>(internal, 10.1.20.10)</td><td>Allowed: yeh company ka server hai</td></tr>
</table>
<p>Kaunsi categories hain aur site kaise classify hoti hai, yeh vendor decide karta hai; vendor documentation check karo. Upar ke naam training ke liye hain.</p>

<h3>Allow list aur block list</h3>
<ul>
<li><b>Block list</b> URLs (site names) ki list hai jo category allowed hone par bhi block hote hain. Ek achhi category mein ek kharab site ke liye use karo.</li>
<li><b>Allow list</b> URLs ki list hai jo category blocked hone par bhi allow hote hain. Blocked category mein ek kaam ki site ke liye use karo, jaise supplier ki site jise classifier Streaming mein daal deta hai.</li>
</ul>

<h3>Kaun jeetta hai? Evaluation ka order</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Content filtering decision order">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. Allow list mein hai?</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">haan: ALLOW, ruko</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fecaca"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. Block list mein hai?</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">haan: BLOCK, ruko</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Category blocked hai?</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">haan: BLOCK, nahi: ALLOW</text>
<line x1="200" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/><line x1="415" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="125" width="620" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Allow-list URLs block-list URLs ko override karte hain, phir blocked categories decide karti hain</text><text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">Dono lists mein hone wala URL allowed hai</text>
</svg><p class="cap">Pehle allow list padhi jaati hai, phir block list, phir category setting.</p></div>
<p>To <b>allow block ko harata hai</b>, aur dono category ko harate hain. Dono lists mein hone wali site allowed hai.</p>

<pre class="out">Content filtering  (network: Mumbai HQ)
Blocked categories : Gambling, Malicious, Gaming, Streaming
Allow list         : <span class="hl">streaming.example</span>
Block list         : social.example

Test results
URL                  Category    Decision   Reason
news.example         News        allow      category allowed
social.example       Social      block      block list
games.example        Gaming      block      category blocked
streaming.example    Streaming   <span class="hl">allow</span>      allow list overrides category
casino.example       Gambling    block      category blocked
malware.example      Malicious   block      category blocked</pre>

<div class="eg"><p><b>Worked example.</b> Head office decide karta hai ki branches mein streaming blocked hai, lekin training team ko vendor webinar ke liye streaming.example chahiye. Aap Streaming ko blocked categories mein rakhte ho aur streaming.example ko allow list mein jodte ho. Sab us ek site ko khol sakte hain; baaki streaming sites blocked rehti hain. Agar aap streaming.example ko block list mein bhi daalte, to bhi allow list jeet jaati.</p></div>

<h3>Content filtering aur firewall saath mein</h3>
<p>Firewall rules aur content filtering alag controls hain. Connection ko dono pass karne padte hain: firewall address-level access decide karta hai, aur content filtering web request decide karta hai. Intranet.example server VLAN mein 10.1.20.10 par resolve hota hai, isliye Bengaluru se use reach karne ke liye firewall ko site-to-site VPN (baad ka module) par Staff se Servers allow karna padega aur filter ko bhi allow karna padega.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Category ya URL add karne se Save changes ke baad appliance kaunsi web requests permit ya drop karta hai woh badalta hai. Yeh VLANs, addresses ya routing nahi badalta. Template-bound network par yeh settings template-controlled aur read-only hoti hain (module 1): inhe template mein badlo. Real products encrypted traffic par bhi khaas tareeke se kaam karte hain, aur details vendor documentation se aati hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Poori category block karke usme ek business-critical site bhool jaana; maan lena ki block-list entry allow-list entry ko harati hai; URL galat form mein daalna (site name wahi daalo jaisa lab dikhata hai); aise network se test karna jahan policy lagu nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek site blocked category mein hai aur allow list mein bhi. Kya hoga?" Woh allowed hai: allow list category ko override karti hai. "Dono lists mein?" Allowed.</p></div>

<div class="scn"><h4>Supplier portal jo Streaming mein file hua</h4><p>Bharat Retail Co ne saari branches par Streaming block kiya, to Delhi ki purchasing team apne supplier ka video-training portal nahi khol paayi. Ticket khula: "internet toota hai". Engineer ne content-filtering results mein URL test kiya: category Streaming, decision block. Poori category unblock karne ke bajaye unhone portal ko allow list mein jodha aur save kiya. Agle test mein allow dikha, reason "allow list overrides category".</p><p><b>Seekh:</b> sabse narrow exception use karo jo problem solve kare.</p></div>

<div class="iv"><p class="q">"Category ki wajah se galat block hui business site ko kaise handle karoge?"</p><p>Strong answer: filter test mein decision confirm karo, category blocked rakho, exact URL ko allow list mein jodo (allow block aur category dono ko harata hai), save karo, retest karo aur reason change log mein note karo. Bolo ki zyada broad unblock risk badhata hai aur exceptions review hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Content filtering website categories aur allow aur block URL lists par kaam karti hai.</li>
<li>Evaluation order: allow list, phir block list, phir blocked categories.</li>
<li>Allow block ko harata hai; dono lists mein hone wala URL allowed hai.</li>
<li>Filtering aur firewall rules alag hain; traffic ko dono pass karne padte hain.</li>
<li>Poori category unblock karne se behtar hai narrow allow-list exception.</li>
</ul></div>
`}};export{e as default};