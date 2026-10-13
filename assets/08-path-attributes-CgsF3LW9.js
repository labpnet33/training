var e={id:`attributes`,h:{en:`Path attributes: the four categories`,hi:`Path attributes: chaar categories`},body:{en:`
<p>A shipping label has fields that every courier in the world must understand (destination, sender), fields that every courier understands but that are not always filled in (a "fragile" sticker), and private codes that only some companies use. Some private codes must stay on the parcel even if a courier does not understand them; others can be torn off. BGP path attributes are organised in exactly these four groups, and the categories are a favourite exam topic.</p>

<h3>What a path attribute is</h3>
<p>An UPDATE message carries <b>NLRI</b> (Network Layer Reachability Information, the prefixes themselves) plus a set of <b>path attributes</b> describing the path to them. Every attribute has a type code and a flags byte. Two flag bits decide the category: <b>optional</b> (0 = well-known, 1 = optional) and <b>transitive</b> (whether to pass it on if you do not understand it). A third flag, <b>partial</b>, is set when an optional transitive attribute was passed on by a router that did not understand it.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Four categories of BGP path attributes">
<rect x="10" y="10" width="300" height="105" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Well-known mandatory</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">every router knows, every UPDATE has</text><text x="160" y="90" text-anchor="middle" class="svg-accent" font-size="13">ORIGIN, AS_PATH, NEXT_HOP</text>
<rect x="330" y="10" width="300" height="105" rx="8" fill="#bbf7d0"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Well-known discretionary</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">every router knows, may be absent</text><text x="480" y="90" text-anchor="middle" class="svg-accent" font-size="13">LOCAL_PREF, ATOMIC_AGGREGATE</text>
<rect x="10" y="130" width="300" height="105" rx="8" fill="#ddd6fe"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="14">Optional transitive</text><text x="160" y="180" text-anchor="middle" class="svg-muted" font-size="12">pass on even if not understood</text><text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="13">COMMUNITY, AGGREGATOR</text>
<rect x="330" y="130" width="300" height="105" rx="8" fill="#fde68a"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="14">Optional non-transitive</text><text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">drop if not understood</text><text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="13">MED, ORIGINATOR_ID, CLUSTER_LIST</text>
</svg><p class="cap">Memorise one or two examples per box. Weight is not in any box: it is not a BGP attribute at all.</p></div>

<h3>Well-known mandatory</h3>
<p>Every BGP implementation must recognise these, and every UPDATE that advertises prefixes must include them.</p>
<dl class="terms">
<dt>ORIGIN (type 1)</dt><dd>How the prefix entered BGP: <code>i</code> IGP (network statement or aggregate), <code>e</code> EGP (the historic EGP protocol, practically never seen), <code>?</code> incomplete (redistribution). Lower is preferred in best-path: IGP, then EGP, then incomplete.</dd>
<dt>AS_PATH (type 2)</dt><dd>The list of ASes the route crossed. Normally an ordered <b>AS_SEQUENCE</b>; an aggregate can carry an unordered <b>AS_SET</b> shown in braces, for example <code>{65101,65104}</code>, which counts as one AS in path length.</dd>
<dt>NEXT_HOP (type 3)</dt><dd>The IP address to forward to. eBGP sets it to the advertising router's address on the session; iBGP leaves it unchanged. If it is unreachable, the route is not valid.</dd>
</dl>

<h3>Well-known discretionary</h3>
<p>Every implementation must recognise them, but they need not be in every UPDATE.</p>
<dl class="terms">
<dt>LOCAL_PREF (type 5)</dt><dd>A preference shared <b>inside one AS</b> (sent to iBGP peers, never to eBGP peers). Default 100, <b>higher wins</b>. Used to choose the exit point from your AS.</dd>
<dt>ATOMIC_AGGREGATE (type 6)</dt><dd>A flag saying "this route is a summary and some path information from the more specific routes may have been lost". Set by <code>aggregate-address</code> without <code>as-set</code>.</dd>
</dl>

<h3>Optional transitive</h3>
<p>Not every router must understand these, but a router that does not understand one must still pass it on, setting the partial flag.</p>
<dl class="terms">
<dt>COMMUNITY (type 8)</dt><dd>A 32-bit tag, usually written <code>ASN:value</code> such as <code>64500:120</code>, used to signal policy to other routers ("customers can ask the ISP to lower preference with community 64500:80"). Well-known values: <code>no-export</code> (do not send outside the AS), <code>no-advertise</code> (do not send to any peer), <code>local-AS</code>. IOS only sends communities when you configure <code>neighbor x send-community</code>.</dd>
<dt>AGGREGATOR (type 7)</dt><dd>The ASN and router ID of the router that built an aggregate.</dd>
</dl>

<h3>Optional non-transitive</h3>
<p>A router that does not understand one simply drops it.</p>
<dl class="terms">
<dt>MULTI_EXIT_DISC, MED (type 4)</dt><dd>A metric one AS sends to a neighbouring AS to suggest which of several entry links to use. <b>Lower wins</b>. It is passed to the neighbouring AS only and not beyond. Shown as "Metric" in <code>show ip bgp</code>.</dd>
<dt>ORIGINATOR_ID and CLUSTER_LIST (types 9, 10)</dt><dd>Loop prevention for route reflectors inside an AS (ENARSI topic).</dd>
</dl>

<h3>And weight?</h3>
<p><b>Weight</b> is a Cisco-proprietary value that exists only inside one router. It is never sent in any UPDATE, so it is not a path attribute in the RFC sense, even though IOS shows it in the same table. Range 0 to 65535, <b>higher wins</b>, 32768 for locally originated routes and 0 for learned routes.</p>

<div class="eg"><p><b>Worked example.</b> R4 (AS 65104) advertises 172.31.4.0/24 to R3 with ORIGIN i, AS_PATH 65104, NEXT_HOP 10.34.0.2 and MED 0. R3 passes it to R2: ORIGIN stays i (never changed in transit), AS_PATH becomes 65103 65104, NEXT_HOP becomes 3.3.3.3 (R3's update-source), and the MED from R4 is <b>not</b> passed on because MED only travels one AS. If R4 had tagged the route with community 65104:100 and R3 had <code>send-community</code> towards R2, R2 would receive the community too, because it is optional transitive.</p></div>

<div class="warn"><p><b>Common mistake.</b> Calling MED "the BGP metric that finds the shortest path". MED is only a hint from a neighbouring AS about which of <b>its</b> entry points to use, and by default it is compared only between paths from the same neighbouring AS.</p></div>

<div class="exam"><p><b>Exam trap.</b> LOCAL_PREF is <b>well-known discretionary</b>, not optional. MED is <b>optional non-transitive</b>. COMMUNITY is <b>optional transitive</b>. Weight is <b>not an attribute</b>. Questions love to swap these.</p></div>

<div class="scn"><h4>Communities that vanished on the way</h4><p>A customer tagged its backup prefix with the provider's documented community 64500:80, which should lower the provider's local preference for that route. Nothing changed. <code>show ip bgp 192.168.60.0</code> on the provider side showed no community at all. The customer router had no <code>neighbor 100.64.10.1 send-community</code>, so IOS stripped the tag before sending. Adding it and a soft outbound clear made the policy work.</p><p><b>Lesson:</b> IOS does not send communities by default; the attribute is optional transitive, but only if you actually send it.</p></div>

<div class="iv"><p class="q">"Name the four categories of BGP path attributes with an example of each."</p><p>Strong answer: well-known mandatory (ORIGIN, AS_PATH, NEXT_HOP), well-known discretionary (LOCAL_PREF, ATOMIC_AGGREGATE), optional transitive (COMMUNITY, AGGREGATOR), optional non-transitive (MED, ORIGINATOR_ID, CLUSTER_LIST). Explain what "transitive" means and add that weight is Cisco-only and local to the router, which shows you know the difference between an attribute and a local setting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Well-known mandatory: ORIGIN, AS_PATH, NEXT_HOP, present in every UPDATE with prefixes.</li>
<li>Well-known discretionary: LOCAL_PREF (iBGP only, default 100, higher wins) and ATOMIC_AGGREGATE.</li>
<li>Optional transitive: COMMUNITY, AGGREGATOR. Optional non-transitive: MED, ORIGINATOR_ID, CLUSTER_LIST.</li>
<li>MED: lower wins, travels only to the neighbouring AS.</li>
<li>Weight is Cisco-local, never advertised, higher wins.</li>
</ul></div>
`,hi:`
<p>Shipping label mein kuch fields aise hote hain jo duniya ke har courier ko samajhne padte hain (destination, sender), kuch aise jo har courier samajhta hai par hamesha bhare nahi hote (ek "fragile" sticker), aur kuch private codes jo sirf kuch companies use karti hain. Kuch private codes parcel par rehne chahiye bhale hi courier unhe na samjhe; baaki phaade ja sakte hain. BGP path attributes bilkul in chaar groups mein bante hain, aur categories exam ka favourite topic hain.</p>

<h3>Path attribute kya hai</h3>
<p>UPDATE message <b>NLRI</b> (Network Layer Reachability Information, yaani khud prefixes) aur unke path ko describe karne wale <b>path attributes</b> ka set le jaata hai. Har attribute ka ek type code aur flags byte hota hai. Do flag bits category tay karte hain: <b>optional</b> (0 = well-known, 1 = optional) aur <b>transitive</b> (samajh na aaye to aage bhejna hai ya nahi). Teesra flag, <b>partial</b>, tab set hota hai jab optional transitive attribute ko kisi aise router ne aage bheja jo use samajhta nahi tha.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="BGP path attributes ki chaar categories">
<rect x="10" y="10" width="300" height="105" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Well-known mandatory</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">har router jaanta hai, har UPDATE mein</text><text x="160" y="90" text-anchor="middle" class="svg-accent" font-size="13">ORIGIN, AS_PATH, NEXT_HOP</text>
<rect x="330" y="10" width="300" height="105" rx="8" fill="#bbf7d0"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Well-known discretionary</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">har router jaanta hai, missing ho sakta</text><text x="480" y="90" text-anchor="middle" class="svg-accent" font-size="13">LOCAL_PREF, ATOMIC_AGGREGATE</text>
<rect x="10" y="130" width="300" height="105" rx="8" fill="#ddd6fe"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="14">Optional transitive</text><text x="160" y="180" text-anchor="middle" class="svg-muted" font-size="12">samajh na aaye phir bhi aage bhejo</text><text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="13">COMMUNITY, AGGREGATOR</text>
<rect x="330" y="130" width="300" height="105" rx="8" fill="#fde68a"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="14">Optional non-transitive</text><text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">samajh na aaye to drop</text><text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="13">MED, ORIGINATOR_ID, CLUSTER_LIST</text>
</svg><p class="cap">Har box ke ek do examples yaad karo. Weight kisi box mein nahi hai: yeh BGP attribute hai hi nahi.</p></div>

<h3>Well-known mandatory</h3>
<p>Har BGP implementation ko inhe pehchanna zaroori hai, aur prefixes advertise karne wale har UPDATE mein yeh hone chahiye.</p>
<dl class="terms">
<dt>ORIGIN (type 1)</dt><dd>Prefix BGP mein kaise aaya: <code>i</code> IGP (network statement ya aggregate), <code>e</code> EGP (purana EGP protocol, practically kabhi nahi dikhta), <code>?</code> incomplete (redistribution). Best-path mein kam wala prefer hota hai: IGP, phir EGP, phir incomplete.</dd>
<dt>AS_PATH (type 2)</dt><dd>Un ASes ki list jinse route guzra. Normally ordered <b>AS_SEQUENCE</b>; aggregate ek unordered <b>AS_SET</b> le ja sakta hai jo braces mein dikhta hai, jaise <code>{65101,65104}</code>, jo path length mein ek AS gina jaata hai.</dd>
<dt>NEXT_HOP (type 3)</dt><dd>Woh IP address jahan forward karna hai. eBGP ise session par advertise karne wale router ke address par set karta hai; iBGP ise nahi badalta. Unreachable ho to route valid nahi.</dd>
</dl>

<h3>Well-known discretionary</h3>
<p>Har implementation ko inhe pehchanna zaroori hai, par har UPDATE mein hona zaroori nahi.</p>
<dl class="terms">
<dt>LOCAL_PREF (type 5)</dt><dd>Ek preference jo <b>ek AS ke andar</b> share hoti hai (iBGP peers ko bheji jaati hai, eBGP peers ko kabhi nahi). Default 100, <b>zyada jeetta hai</b>. Apne AS se exit point chunne ke liye use hoti hai.</dd>
<dt>ATOMIC_AGGREGATE (type 6)</dt><dd>Ek flag jo kehta hai "yeh route summary hai aur more specific routes ki kuch path information kho gayi ho sakti hai". <code>as-set</code> ke bina <code>aggregate-address</code> ise set karta hai.</dd>
</dl>

<h3>Optional transitive</h3>
<p>Har router ko inhe samajhna zaroori nahi, par jo router nahi samajhta use bhi inhe aage bhejna hota hai, partial flag set karke.</p>
<dl class="terms">
<dt>COMMUNITY (type 8)</dt><dd>32-bit tag, aam taur par <code>ASN:value</code> jaise <code>64500:120</code> likha jaata hai, jo doosre routers ko policy signal karne ke liye use hota hai ("customers community 64500:80 se ISP ko preference kam karne ko keh sakte hain"). Well-known values: <code>no-export</code> (AS ke bahar mat bhejo), <code>no-advertise</code> (kisi peer ko mat bhejo), <code>local-AS</code>. IOS communities tabhi bhejta hai jab aap <code>neighbor x send-community</code> configure karo.</dd>
<dt>AGGREGATOR (type 7)</dt><dd>Us router ka ASN aur router ID jisne aggregate banaya.</dd>
</dl>

<h3>Optional non-transitive</h3>
<p>Jo router ise nahi samajhta, woh bas drop kar deta hai.</p>
<dl class="terms">
<dt>MULTI_EXIT_DISC, MED (type 4)</dt><dd>Ek metric jo ek AS padosi AS ko bhejta hai yeh suggest karne ke liye ki kai entry links mein se kaunsa use kare. <b>Kam jeetta hai</b>. Yeh sirf padosi AS tak jaata hai, aage nahi. <code>show ip bgp</code> mein "Metric" ki tarah dikhta hai.</dd>
<dt>ORIGINATOR_ID aur CLUSTER_LIST (types 9, 10)</dt><dd>AS ke andar route reflectors ke liye loop prevention (ENARSI topic).</dd>
</dl>

<h3>Aur weight?</h3>
<p><b>Weight</b> ek Cisco-proprietary value hai jo sirf ek router ke andar exist karti hai. Yeh kabhi kisi UPDATE mein nahi jaati, isliye RFC ke hisaab se path attribute nahi hai, bhale hi IOS ise same table mein dikhata ho. Range 0 se 65535, <b>zyada jeetta hai</b>, locally originated routes ke liye 32768 aur seekhe routes ke liye 0.</p>

<div class="eg"><p><b>Worked example.</b> R4 (AS 65104) 172.31.4.0/24 ko R3 ko ORIGIN i, AS_PATH 65104, NEXT_HOP 10.34.0.2 aur MED 0 ke saath advertise karta hai. R3 ise R2 ko deta hai: ORIGIN i hi rehta hai (transit mein kabhi nahi badalta), AS_PATH 65103 65104 ban jaata hai, NEXT_HOP 3.3.3.3 ban jaata hai (R3 ka update-source), aur R4 ka MED aage <b>nahi</b> jaata kyunki MED sirf ek AS tak chalta hai. Agar R4 ne route ko community 65104:100 se tag kiya hota aur R3 par R2 ki taraf <code>send-community</code> hota, to R2 ko community bhi milti, kyunki woh optional transitive hai.</p></div>

<div class="warn"><p><b>Common galti.</b> MED ko "BGP metric jo shortest path dhoondhta hai" kehna. MED sirf padosi AS ka hint hai ki <b>uske</b> kaunse entry point use karein, aur default mein yeh sirf same padosi AS se aaye paths ke beech compare hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> LOCAL_PREF <b>well-known discretionary</b> hai, optional nahi. MED <b>optional non-transitive</b> hai. COMMUNITY <b>optional transitive</b> hai. Weight <b>attribute nahi</b> hai. Questions inhe ulatna pasand karte hain.</p></div>

<div class="scn"><h4>Raaste mein gayab hui communities</h4><p>Ek customer ne apne backup prefix ko provider ki documented community 64500:80 se tag kiya, jo provider ki us route ki local preference kam karni chahiye thi. Kuch nahi badla. Provider side par <code>show ip bgp 192.168.60.0</code> mein koi community thi hi nahi. Customer router par <code>neighbor 100.64.10.1 send-community</code> nahi tha, isliye IOS ne bhejne se pehle tag hata diya. Ise jodne aur soft outbound clear karne se policy chal gayi.</p><p><b>Seekh:</b> IOS default mein communities nahi bhejta; attribute optional transitive hai, par sirf tab jab aap use sach mein bhejo.</p></div>

<div class="iv"><p class="q">"BGP path attributes ki chaar categories har ek ke example ke saath batao."</p><p>Strong answer: well-known mandatory (ORIGIN, AS_PATH, NEXT_HOP), well-known discretionary (LOCAL_PREF, ATOMIC_AGGREGATE), optional transitive (COMMUNITY, AGGREGATOR), optional non-transitive (MED, ORIGINATOR_ID, CLUSTER_LIST). "Transitive" ka matlab samjhao aur jodo ki weight Cisco-only aur router ke liye local hai, jisse dikhta hai ki aap attribute aur local setting ka fark jaante ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Well-known mandatory: ORIGIN, AS_PATH, NEXT_HOP, prefixes wale har UPDATE mein.</li>
<li>Well-known discretionary: LOCAL_PREF (sirf iBGP, default 100, zyada jeetta) aur ATOMIC_AGGREGATE.</li>
<li>Optional transitive: COMMUNITY, AGGREGATOR. Optional non-transitive: MED, ORIGINATOR_ID, CLUSTER_LIST.</li>
<li>MED: kam jeetta hai, sirf padosi AS tak jaata hai.</li>
<li>Weight Cisco-local hai, kabhi advertise nahi hota, zyada jeetta hai.</li>
</ul></div>
`}};export{e as default};