var e={id:`welcome`,h:{en:`Welcome: what SD-WAN is and what you will learn`,hi:`Welcome: SD-WAN kya hai aur aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> This is the free starter module of the Cisco Catalyst SD-WAN track. By the end of nine short chapters you will be able to explain, in plain words, what a classic WAN is, why companies are replacing it, what an SD-WAN does differently, which boxes make up a Catalyst SD-WAN network and what each one is responsible for, how a new branch comes online by itself, and which words (TLOC, colour, VPN, OMP, BFD, template, policy) you will hear again and again. You will also see what the job market looks like and how the rest of the track is laid out.</p>
<p><b>Prerequisites.</b> Almost none. You should know what an IP address is, what a router does (it forwards packets between networks) and roughly what a branch office is. If you have heard of MPLS or VPN, good; if not, we build both from nothing. You do not need Cisco certification knowledge, and you do not need to type any command in this module.</p>

<h3>Start with an analogy: a courier company</h3>
<p>Imagine a courier company with offices in 200 cities. In the <b>old way</b> every city office has a thick printed rule book. Parcels from Pune to Nashik first travel to the head office in Nagpur and only then come back, because "all routes go through head office". The company rents one dedicated truck per route, which is reliable but expensive, and a new route takes a month to arrange. When the rules change, someone must post a new rule book to 200 offices and hope all of them update it.</p>
<p>In the <b>new way</b> there is a central control room with a screen. The control room knows every office, writes the rules once and sends them out automatically. Offices may use any carrier: the dedicated truck, a cheap public bus, a train. Every few seconds each office measures how fast and how safe each carrier is today, and sends urgent parcels by the best one at that moment. A new office needs only a phone call: it is switched on, finds the control room, and downloads its rules.</p>
<p>That is the whole idea of <b>SD-WAN</b>: <b>Software-Defined Wide Area Network</b>. A WAN is the network that links offices that are far apart. "Software-defined" means the intelligence sits in central software, not in a hand-typed rule book on every router.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Old WAN versus SD-WAN">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Classic WAN</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN</text>
<rect x="110" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">Data centre</text>
<rect x="20" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="60" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="120" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<rect x="220" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="260" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch C</text>
<line x1="140" y1="76" x2="60" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="76" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="180" y1="76" x2="260" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="212" text-anchor="middle" class="svg-muted" font-size="12">Everything goes via the hub</text>
<rect x="430" y="30" width="100" height="32" rx="8" fill="#ddd6fe"/><text x="480" y="51" text-anchor="middle" class="svg-ink" font-size="12">Central control</text>
<rect x="340" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="380" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="440" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<rect x="540" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="580" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch C</text>
<line x1="420" y1="167" x2="440" y2="167" stroke="#16a34a" stroke-width="3"/><line x1="520" y1="167" x2="540" y2="167" stroke="#16a34a" stroke-width="3"/>
<path d="M380 150 Q480 110 580 150" fill="none" stroke="#16a34a" stroke-width="3"/>
<line x1="470" y1="62" x2="390" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="480" y1="62" x2="480" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="490" y1="62" x2="570" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="480" y="212" text-anchor="middle" class="svg-muted" font-size="12">Direct tunnels, rules from the centre</text>
</svg><p class="cap">Left: every branch talks through the hub. Right: branches talk directly to each other, and a central controller (dashed lines) only distributes rules.</p></div>

<h3>Why this matters to you</h3>
<p>Almost every company with more than a few offices has a WAN, and almost every one of them is either already moving to SD-WAN or is planning to. Retailers with hundreds of stores, banks with thousands of branches and ATMs, hospital chains, schools and IT services companies all need the same thing: reliable, secure links between many small sites and a few big ones, at a cost they can afford. Cisco Catalyst SD-WAN (the product formerly called Viptela) is one of the most deployed solutions, and the skills transfer to other vendors because the ideas are the same.</p>

<div class="eg"><p><b>Worked example.</b> A retail chain has 300 stores. Today each store has one MPLS line costing the equivalent of a mid-range monthly salary, a 6-week lead time for a new store, and one router configured by hand. A rule change, such as "send video calls first", takes a week of engineers logging in to routers. With SD-WAN the same chain adds a cheap broadband line at each store, powers on a pre-registered router that configures itself, and applies the video rule from one screen in minutes. You will learn how, step by step, in this track.</p></div>

<h3>Words you must be comfortable with</h3>
<dl class="terms">
<dt>WAN</dt><dd>Wide Area Network: links between sites that are far apart (cities, countries).</dd>
<dt>Branch</dt><dd>A small site such as a store, bank branch or clinic with a router and some users.</dd>
<dt>Data centre (DC)</dt><dd>The big site where servers and applications live.</dd>
<dt>Transport</dt><dd>The service that carries your packets between sites: MPLS, broadband, 4G/5G.</dd>
<dt>Overlay</dt><dd>A virtual network built on top of the real one, made of tunnels. SD-WAN lives here.</dd>
</dl>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking SD-WAN is "a new kind of internet" or "a cheaper line". It is neither. SD-WAN is a way to <i>manage and steer</i> whatever lines you already have or buy.</p></div>

<div class="scn"><h4>The week-long rule change</h4><p>A logistics firm with 120 depots wanted to give its tracking application priority over staff web browsing. The network team wrote the QoS change once, then spent six days logging in to 120 routers; three depots were missed and two had typos, so scanners lagged at a depot during peak. After the move to SD-WAN the same kind of change was a single policy pushed to all depots at once, with a visible report of which depots had applied it.</p><p><b>Lesson:</b> the main benefit of SD-WAN is not a fancy feature, it is doing network-wide changes once, correctly, everywhere.</p></div>

<div class="iv"><p class="q">"In one minute, what is SD-WAN?"</p><p>A strong answer: a WAN architecture that separates the control from the forwarding hardware. Branches build encrypted tunnels (an overlay) over any mix of transports; a central controller distributes routes and policy; a central manager configures and monitors every device; and the edges measure each path so they can choose the best one per application. Mention the benefits (cost, agility, visibility, direct cloud access) in one sentence at the end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A WAN links distant sites; SD-WAN moves the intelligence into central software.</li>
<li>Branches use any transport (MPLS, broadband, 4G/5G) and connect through an encrypted overlay.</li>
<li>One place to write rules replaces typing the same change on hundreds of routers.</li>
<li>Cisco Catalyst SD-WAN was formerly Viptela; the ideas carry over to every vendor.</li>
<li>This module needs no commands; later modules in the track add the CLI and hands-on labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Cisco Catalyst SD-WAN track ka free starter module hai. Nau chhote chapters ke end tak aap saaf shabdon mein bata paoge ki classic WAN kya hota hai, companies use kyun badal rahi hain, SD-WAN alag kya karta hai, Catalyst SD-WAN network mein kaun se boxes hote hain aur har ek ki zimmedari kya hai, naya branch apne aap online kaise aata hai, aur kaun se words (TLOC, colour, VPN, OMP, BFD, template, policy) aapko baar baar sunai denge. Aap job market ki tasveer bhi dekhoge aur yeh bhi ki baaki track kaise laid out hai.</p>
<p><b>Prerequisites.</b> Lagbhag koi nahi. Aapko pata hona chahiye ki IP address kya hai, router kya karta hai (networks ke beech packets forward karta hai) aur branch office kaisa hota hai. Agar MPLS ya VPN ka naam suna hai to achha; nahi suna to hum dono ko zero se banate hain. Cisco certification ka knowledge nahi chahiye, aur is module mein koi command type karne ki zaroorat nahi hai.</p>

<h3>Ek analogy se shuru karo: courier company</h3>
<p>Socho ek courier company hai jiske 200 shehron mein offices hain. <b>Purane tareeke</b> mein har city office ke paas ek moti printed rule book hai. Pune se Nashik ka parcel pehle Nagpur ke head office jaata hai aur phir wapas aata hai, kyunki "saare routes head office se hokar jaate hain". Company har route ke liye ek dedicated truck kiraye par leti hai, jo reliable hai par mehenga, aur naya route arrange karne mein ek mahina lagta hai. Jab rules badalte hain to kisi ko 200 offices ko nayi rule book post karni padti hai aur umeed karni padti hai ki sab update kar lenge.</p>
<p><b>Naye tareeke</b> mein ek central control room hai jisme ek screen hai. Control room har office ko jaanta hai, rules ek baar likhta hai aur apne aap bhej deta hai. Offices koi bhi carrier use kar sakte hain: dedicated truck, sasti public bus, train. Har kuch second mein har office naapta hai ki aaj kaunsa carrier kitna tez aur safe hai, aur urgent parcels us waqt ke best carrier se bhejta hai. Naye office ko bas ek phone call chahiye: woh on hota hai, control room dhundh leta hai, aur apne rules download kar leta hai.</p>
<p><b>SD-WAN</b> ka poora idea yahi hai: <b>Software-Defined Wide Area Network</b>. WAN woh network hai jo door door ke offices ko jodta hai. "Software-defined" ka matlab hai ki intelligence central software mein hai, har router par haath se type ki hui rule book mein nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Purana WAN aur SD-WAN">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Classic WAN</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN</text>
<rect x="110" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">Data centre</text>
<rect x="20" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="60" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="120" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<rect x="220" y="150" width="80" height="34" rx="8" fill="#e2e8f0"/><text x="260" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch C</text>
<line x1="140" y1="76" x2="60" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="76" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="180" y1="76" x2="260" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="212" text-anchor="middle" class="svg-muted" font-size="12">Sab kuch hub se hokar</text>
<rect x="430" y="30" width="100" height="32" rx="8" fill="#ddd6fe"/><text x="480" y="51" text-anchor="middle" class="svg-ink" font-size="12">Central control</text>
<rect x="340" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="380" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="440" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<rect x="540" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="580" y="171" text-anchor="middle" class="svg-ink" font-size="12">Branch C</text>
<line x1="420" y1="167" x2="440" y2="167" stroke="#16a34a" stroke-width="3"/><line x1="520" y1="167" x2="540" y2="167" stroke="#16a34a" stroke-width="3"/>
<path d="M380 150 Q480 110 580 150" fill="none" stroke="#16a34a" stroke-width="3"/>
<line x1="470" y1="62" x2="390" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="480" y1="62" x2="480" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="490" y1="62" x2="570" y2="150" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="480" y="212" text-anchor="middle" class="svg-muted" font-size="12">Direct tunnels, rules centre se</text>
</svg><p class="cap">Left: har branch hub ke through baat karti hai. Right: branches seedha ek doosre se baat karti hain, aur central controller (dashed lines) sirf rules baant-ta hai.</p></div>

<h3>Yeh aapke liye kyun matter karta hai</h3>
<p>Jis bhi company ke paas kuch se zyada offices hain, uske paas WAN hai, aur lagbhag sab ya to SD-WAN par shift ho chuki hain ya plan kar rahi hain. Saikdon stores wale retailers, hazaaron branches aur ATMs wale banks, hospital chains, schools aur IT services companies sabko ek hi cheez chahiye: bahut saari chhoti sites aur kuch badi sites ke beech reliable, secure links, aise cost par jo afford ho sake. Cisco Catalyst SD-WAN (jise pehle Viptela kehte the) sabse zyada deploy hone wale solutions mein se ek hai, aur skills doosre vendors par bhi kaam aati hain kyunki ideas wahi hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek retail chain ke 300 stores hain. Aaj har store par ek MPLS line hai jiska kharcha ek mid-range monthly salary ke barabar hai, naye store ka lead time 6 hafte hai, aur ek router haath se configure kiya gaya hai. "Video calls pehle bhejo" jaisa rule change karne mein engineers ko routers par login karke ek hafta lagta hai. SD-WAN ke saath wahi chain har store par ek sasti broadband line jodti hai, pehle se registered router on karti hai jo apne aap configure ho jaata hai, aur video rule ek screen se minutes mein laga deti hai. Kaise, yeh aap is track mein step by step seekhoge.</p></div>

<h3>Woh words jinse aapko comfortable hona hai</h3>
<dl class="terms">
<dt>WAN</dt><dd>Wide Area Network: door door ki sites (shehron, deshon) ke beech links.</dd>
<dt>Branch</dt><dd>Chhoti site jaise store, bank branch ya clinic, jisme ek router aur kuch users hote hain.</dd>
<dt>Data centre (DC)</dt><dd>Badi site jahan servers aur applications rehte hain.</dd>
<dt>Transport</dt><dd>Woh service jo sites ke beech aapke packets le jaati hai: MPLS, broadband, 4G/5G.</dd>
<dt>Overlay</dt><dd>Asli network ke upar tunnels se bana virtual network. SD-WAN yahin rehta hai.</dd>
</dl>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki SD-WAN "naye type ka internet" hai ya "sasti line" hai. Dono nahi. SD-WAN ek tareeka hai jisse aap jo lines pehle se hain ya kharidte ho unhe <i>manage aur steer</i> karte ho.</p></div>

<div class="scn"><h4>Ek hafte ka rule change</h4><p>Ek logistics firm ke 120 depots the aur woh apni tracking application ko staff ki web browsing se zyada priority dena chahti thi. Network team ne QoS change ek baar likha, phir 120 routers par login karne mein chhe din lage; teen depots chhoot gaye aur do mein typos the, isliye peak ke waqt ek depot par scanners lag karne lage. SD-WAN par move karne ke baad isi tarah ka change ek hi policy tha jo saare depots par ek saath push hua, aur report mein dikhta tha ki kaunse depots ne apply kiya.</p><p><b>Seekh:</b> SD-WAN ka sabse bada fayda koi fancy feature nahi hai, balki network-wide changes ek baar, sahi tareeke se, har jagah karna hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein bataiye, SD-WAN kya hai?"</p><p>Strong answer: ek WAN architecture jo control ko forwarding hardware se alag karta hai. Branches kisi bhi transport mix par encrypted tunnels (overlay) banati hain; ek central controller routes aur policy baant-ta hai; ek central manager har device ko configure aur monitor karta hai; aur edges har path ko measure karte hain taaki per application best path chun sakein. Ant mein ek sentence mein benefits (cost, agility, visibility, direct cloud access) mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WAN door ki sites ko jodta hai; SD-WAN intelligence ko central software mein le jaata hai.</li>
<li>Branches koi bhi transport (MPLS, broadband, 4G/5G) use karti hain aur encrypted overlay se jurti hain.</li>
<li>Saikdon routers par ek hi change type karne ki jagah rules likhne ki ek hi jagah.</li>
<li>Cisco Catalyst SD-WAN pehle Viptela tha; ideas har vendor par lagu hote hain.</li>
<li>Is module mein commands nahi hain; track ke baad ke modules CLI aur hands-on labs jodte hain.</li>
</ul></div>
`}};export{e as default};