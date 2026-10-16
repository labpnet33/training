var e={id:`lab-tid`,h:{en:`Lab walkthrough: block observables from a CERT feed with TID`,hi:`Lab walkthrough: TID se CERT feed ke observables block karo`},body:{en:`
<p>Time to do it. In the lab <b>"Threat Intelligence Director: block observables from a CERT feed"</b>, the national CERT has shared a flat file with two indicators seen in an active campaign: the IP <b>192.0.2.66</b> and the domain <b>cdn-stats.example</b>. Your job is to make every Threat Defense block both — <b>without touching the access control policy</b> and without a Deploy.</p>

<h3>An analogy: the airport watch list</h3>
<p>Immigration officers at every counter of an airport do not get a new rulebook when a name is added to the watch list. The list is updated centrally and every counter's screen shows it instantly. The rulebook (the access control policy) stays the same; only the list changes. TID is that central watch list for your firewalls.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TID lab topology">
<rect x="20" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#fed7aa"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="260" y="130" text-anchor="middle" class="svg-muted" font-size="12">TID element</text>
<rect x="390" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="435" y="120" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="530" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="12">BADHOST</text><text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.66</text>
<rect x="530" y="160" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="182" text-anchor="middle" class="svg-ink" font-size="12">INET</text><text x="580" y="200" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8 DNS</text>
<line x1="130" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="390" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="105" x2="530" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="125" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="265" y="35" text-anchor="middle" class="svg-ink" font-size="12">CERT-IN-Feed</text>
<line x1="265" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">PC1 reaches BADHOST and cdn-stats.example through FTD1 until the TID source is published.</p></div>

<h3>Step 1 — prove the problem first</h3>
<p>Always capture the "before" state. If you skip it, you cannot prove later that your change caused the block. From PC1:</p>
<pre class="code"><span class="c">! on PC1</span>
curl 192.0.2.66
curl cdn-stats.example</pre>
<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">&lt;html&gt;&lt;body&gt;…page served by 192.0.2.66…&lt;/body&gt;&lt;/html&gt;</span>
PC1&gt; curl cdn-stats.example
<span class="hl">&lt;html&gt;&lt;body&gt;…page served…&lt;/body&gt;&lt;/html&gt;</span></pre>
<p>Both answer. The access control policy NK-ACP has the rule Inside-Out (INSIDE to OUTSIDE, web, DNS and ICMP allowed), so nothing stops them yet.</p>

<h3>Step 2 — add the TID source</h3>
<p>In the lab Management Center open <b>Objects → Threat Intelligence Director → Add Source</b> (on a real 7.x Management Center: Integration → Intelligence → Sources).</p>
<pre class="code"><span class="c">! Objects → Threat Intelligence Director → Add Source</span>
Name         : CERT-IN-Feed
Type         : Flat file
Observables  : 192.0.2.66
               cdn-stats.example        <span class="c">! one observable per line</span>
Action       : Block
Publish      : On
<span class="c">! no Deploy — TID publishes to the elements directly</span></pre>
<div class="note"><p><b>Lab simplification.</b> On a real Management Center a flat-file source has one content type, so you would create two sources — one IPv4, one domain — or deliver both as STIX. The lab accepts both observables in one source so you can focus on the flow.</p></div>

<h3>Step 3 — verify the block, and that you broke nothing else</h3>
<pre class="code"><span class="c">! on PC1</span>
curl 192.0.2.66
curl cdn-stats.example
curl news.example</pre>
<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">curl: (28) Failed to connect to 192.0.2.66 port 80 after 2001 ms: Timeout was reached</span>
PC1&gt; curl cdn-stats.example
<span class="hl">curl: (56) Recv failure: Connection reset by peer</span>
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;…MyPnetLab news…&lt;/body&gt;&lt;/html&gt;</pre>
<p>The two indicators fail; news.example still works. The second check matters as much as the first: a good engineer proves the change is <b>narrow</b>.</p>

<h3>Step 4 — find the evidence in the events</h3>
<p>Open <b>Analysis → Security Intelligence</b> (connection events filtered to Security Intelligence). Look at the list column: it tells you which list or feed made the decision.</p>
<pre class="out">Time      Initiator   Responder           Action  Reason                 List
10:14:02  10.0.1.10   192.0.2.66          Block   IP Block               <span class="hl">TID: CERT-IN-Feed</span>
10:14:09  10.0.1.10   cdn-stats.example   Block   URL Block              <span class="hl">TID: CERT-IN-Feed</span></pre>
<p>The answer the lab asks for is the list name <b>TID: CERT-IN-Feed</b>. On a real Management Center the Security Intelligence category shows a TID category (for example a TID IPv4 or TID URL block), and Integration → Intelligence → Incidents shows one incident per matched indicator.</p>

<div class="eg"><p><b>Worked example — reading the result.</b> Two blocked connections, both from 10.0.1.10, both listing TID: CERT-IN-Feed, and zero blocks for news.example. That proves: the observables reached the element, the element matched them in the Security Intelligence stage before any access rule, and the access policy itself was untouched. It also tells the SOC that 10.0.1.10 tried to reach a campaign indicator — which is worth investigating (the subject of the RTC lab).</p></div>

<div class="warn"><p><b>Common mistakes in this lab.</b> Clicking Deploy and thinking it was needed (harmless, but it shows a misunderstanding). Putting both values on one line. Leaving the action at Monitor — then events appear with action Monitor but traffic passes. Testing only the bad indicators and never proving that normal browsing still works.</p></div>

<div class="exam"><p><b>Exam trap.</b> If a question shows TID events with action "Monitor" and asks why traffic was not dropped, the answer is the source (or the observable) action, not the access rule or a missing Deploy.</p></div>

<div class="scn"><h4>The 7-deploy week</h4><p>A team received a daily STIX feed of indicators from their national CERT and pasted the IPs into an access rule by hand, then deployed — 7 deploys, 212 manual entries and 3 typos in one week, one of which blocked a partner's mail relay. They replaced the routine with a TID TAXII source polling the CERT collection every hour, action Monitor for the first week, then Block, TTL 30 days. Deploys for intelligence dropped to zero and the typos disappeared.</p><p><b>Lesson:</b> intelligence belongs in TID, not in access rules. Rules describe business intent; TID carries fast-changing indicators.</p></div>

<div class="iv"><p class="q">"How would you prove to an auditor that a CERT indicator is being enforced on your firewalls?"</p><p>Strong answer: show the TID source and its published state, the elements receiving it, then a controlled test from an inside host that fails, with the Security Intelligence event naming the TID list, and a counter-test that normal traffic still works. Mention the incident in TID and that no access-rule change or Deploy was involved, so change control is clean.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capture the "before" state, then change, then verify both the block and normal traffic.</li>
<li>A TID source with action Block is published without Deploy and without touching NK-ACP.</li>
<li>Security Intelligence events name the list: TID: CERT-IN-Feed.</li>
<li>A real flat-file source carries one observable type; STIX can mix types.</li>
<li>A blocked indicator from an inside host is also a lead: that host may be infected.</li>
</ul></div>
`,hi:`
<p>Ab karke dekhte hain. Lab <b>"Threat Intelligence Director: block observables from a CERT feed"</b> mein national CERT ne ek active campaign mein dikhe do indicators wali flat file share ki hai: IP <b>192.0.2.66</b> aur domain <b>cdn-stats.example</b>. Aapka kaam hai har Threat Defense se dono ko block karwana — <b>access control policy ko chhue bina</b> aur bina Deploy ke.</p>

<h3>Ek analogy: airport ki watch list</h3>
<p>Airport ke har counter ke immigration officers ko naya rulebook nahi milta jab watch list mein ek naam judta hai. List centrally update hoti hai aur har counter ki screen par turant dikhti hai. Rulebook (access control policy) wahi rehti hai; sirf list badalti hai. TID aapke firewalls ke liye wahi central watch list hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TID lab topology">
<rect x="20" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#fed7aa"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="260" y="130" text-anchor="middle" class="svg-muted" font-size="12">TID element</text>
<rect x="390" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="435" y="120" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="530" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="12">BADHOST</text><text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.66</text>
<rect x="530" y="160" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="182" text-anchor="middle" class="svg-ink" font-size="12">INET</text><text x="580" y="200" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8 DNS</text>
<line x1="130" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="390" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="105" x2="530" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="125" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="265" y="35" text-anchor="middle" class="svg-ink" font-size="12">CERT-IN-Feed</text>
<line x1="265" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Jab tak TID source publish nahi hota, PC1 FTD1 ke through BADHOST aur cdn-stats.example tak pahunchta hai.</p></div>

<h3>Step 1 — pehle problem saabit karo</h3>
<p>Hamesha "before" state capture karo. Agar skip karoge, to baad mein saabit nahi kar paoge ki block aapke change se hua. PC1 se:</p>
<pre class="code"><span class="c">! PC1 par</span>
curl 192.0.2.66
curl cdn-stats.example</pre>
<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">&lt;html&gt;&lt;body&gt;…page served by 192.0.2.66…&lt;/body&gt;&lt;/html&gt;</span>
PC1&gt; curl cdn-stats.example
<span class="hl">&lt;html&gt;&lt;body&gt;…page served…&lt;/body&gt;&lt;/html&gt;</span></pre>
<p>Dono jawab dete hain. Access control policy NK-ACP mein rule Inside-Out hai (INSIDE se OUTSIDE, web, DNS aur ICMP allowed), isliye abhi unhe kuch nahi rokta.</p>

<h3>Step 2 — TID source jodo</h3>
<p>Lab Management Center mein <b>Objects → Threat Intelligence Director → Add Source</b> kholo (asli 7.x Management Center par: Integration → Intelligence → Sources).</p>
<pre class="code"><span class="c">! Objects → Threat Intelligence Director → Add Source</span>
Name         : CERT-IN-Feed
Type         : Flat file
Observables  : 192.0.2.66
               cdn-stats.example        <span class="c">! har line mein ek observable</span>
Action       : Block
Publish      : On
<span class="c">! Deploy nahi — TID seedha elements ko publish karta hai</span></pre>
<div class="note"><p><b>Lab simplification.</b> Asli Management Center par flat-file source ka ek content type hota hai, isliye aap do sources banaoge — ek IPv4, ek domain — ya dono ko STIX mein bhejoge. Lab ek source mein dono observables accept karti hai taaki aap flow par focus kar sako.</p></div>

<h3>Step 3 — block verify karo, aur yeh bhi ki kuch aur nahi toota</h3>
<pre class="code"><span class="c">! PC1 par</span>
curl 192.0.2.66
curl cdn-stats.example
curl news.example</pre>
<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">curl: (28) Failed to connect to 192.0.2.66 port 80 after 2001 ms: Timeout was reached</span>
PC1&gt; curl cdn-stats.example
<span class="hl">curl: (56) Recv failure: Connection reset by peer</span>
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;…MyPnetLab news…&lt;/body&gt;&lt;/html&gt;</pre>
<p>Dono indicators fail hote hain; news.example ab bhi chalta hai. Doosra check pehle jitna hi zaroori hai: achha engineer saabit karta hai ki change <b>narrow</b> hai.</p>

<h3>Step 4 — events mein saboot dhoondo</h3>
<p><b>Analysis → Security Intelligence</b> kholo (Security Intelligence par filtered connection events). List column dekho: woh batata hai kis list ya feed ne decision liya.</p>
<pre class="out">Time      Initiator   Responder           Action  Reason                 List
10:14:02  10.0.1.10   192.0.2.66          Block   IP Block               <span class="hl">TID: CERT-IN-Feed</span>
10:14:09  10.0.1.10   cdn-stats.example   Block   URL Block              <span class="hl">TID: CERT-IN-Feed</span></pre>
<p>Lab jo answer maangti hai woh list name <b>TID: CERT-IN-Feed</b> hai. Asli Management Center par Security Intelligence category ek TID category dikhati hai (jaise TID IPv4 ya TID URL block), aur Integration → Intelligence → Incidents har matched indicator ka ek incident dikhata hai.</p>

<div class="eg"><p><b>Worked example — result padhna.</b> Do blocked connections, dono 10.0.1.10 se, dono mein TID: CERT-IN-Feed, aur news.example ke liye zero blocks. Yeh saabit karta hai: observables element tak pahunche, element ne unhe kisi bhi access rule se pehle Security Intelligence stage mein match kiya, aur access policy khud untouched rahi. Yeh SOC ko yeh bhi batata hai ki 10.0.1.10 ne ek campaign indicator tak pahunchne ki koshish ki — jo investigate karne layak hai (RTC lab ka topic).</p></div>

<div class="warn"><p><b>Is lab ki common galtiyan.</b> Deploy click karna aur sochna ki woh zaroori tha (nuksaan nahi, par galat samajh dikhata hai). Dono values ek line mein daalna. Action Monitor par chhod dena — tab events action Monitor ke saath aate hain par traffic guzar jaata hai. Sirf bad indicators test karna aur kabhi saabit na karna ki normal browsing ab bhi chalti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar question TID events action "Monitor" ke saath dikhaye aur pooche ki traffic drop kyun nahi hua, to jawab source (ya observable) ka action hai, access rule ya missing Deploy nahi.</p></div>

<div class="scn"><h4>7-deploy wala hafta</h4><p>Ek team ko apne national CERT se indicators ki daily STIX feed milti thi aur woh IPs haath se ek access rule mein paste karke deploy karti thi — ek hafte mein 7 deploys, 212 manual entries aur 3 typos, jinmein se ek ne partner ka mail relay block kar diya. Unhone yeh routine ek TID TAXII source se badal di jo CERT collection har ghante poll karta tha, pehle hafte action Monitor, phir Block, TTL 30 days. Intelligence ke liye deploys zero ho gaye aur typos gayab ho gaye.</p><p><b>Seekh:</b> intelligence TID mein rehti hai, access rules mein nahi. Rules business intent batate hain; TID tezi se badalte indicators le jaata hai.</p></div>

<div class="iv"><p class="q">"Aap auditor ko kaise saabit karoge ki ek CERT indicator aapke firewalls par enforce ho raha hai?"</p><p>Strong answer: TID source aur uski published state dikhao, use receive karne wale elements, phir ek inside host se controlled test jo fail ho, Security Intelligence event ke saath jo TID list ka naam batata hai, aur ek counter-test ki normal traffic ab bhi chalta hai. TID ke incident ka zikr karo aur yeh ki koi access-rule change ya Deploy shaamil nahi tha, isliye change control clean hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"Before" state capture karo, phir change, phir block aur normal traffic dono verify karo.</li>
<li>Action Block wala TID source bina Deploy aur bina NK-ACP chhue publish hota hai.</li>
<li>Security Intelligence events list ka naam batate hain: TID: CERT-IN-Feed.</li>
<li>Asli flat-file source ek observable type leta hai; STIX types mix kar sakta hai.</li>
<li>Inside host se blocked indicator ek lead bhi hai: woh host infected ho sakta hai.</li>
</ul></div>
`}};export{e as default};