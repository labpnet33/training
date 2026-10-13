var e={id:`overview`,h:{en:`Advanced BGP: what you will learn and the big picture`,hi:`Advanced BGP: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will move from "BGP sessions come up" to "I can design and run BGP for a real enterprise or service-provider edge". You will tag routes with communities and build policy on the tags, replace an IBGP full mesh with route reflectors, understand confederations, load-balance with multipath, and use <code>local-as</code>, <code>remove-private</code>, <code>as-override</code> and <code>loops</code> to survive mergers and hub-and-spoke designs. This is the BGP portion of the JNCIP-ENT exam (JN0-650) and it is also what interviewers for senior network roles ask.</p>
<p><b>Prerequisites.</b> You should already know how an EBGP and an IBGP session is formed, the basic path attributes, and how a Junos policy-statement is written. That is the JNCIS-ENT BGP module (jncis-bgp) and the policy module of JNCIA. We refer back to them instead of repeating them.</p>

<h3>Analogy: international post</h3>
<p>Think of BGP as the international postal system. Every country (autonomous system) has its own rules inside, but between countries they agree on one language: <b>which destinations can I reach through you, and what is the route?</b> A <b>community</b> is a coloured sticker on a parcel: "customer", "do not forward abroad", "express". Any sorting office along the way can read the sticker and act without knowing the address. A <b>route reflector</b> is a regional hub: instead of every office phoning every other office, each one talks to the hub, and the hub passes the news on. A <b>local-as</b> trick is a company that merged and still has old letterhead: the partner still expects letters from the old name.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Topics of this module">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="14">Attributes</text><text x="110" y="66" text-anchor="middle" class="svg-muted" font-size="12">LP, MED, path choice</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Communities</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">tag and filter</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="14">Route reflection</text><text x="530" y="66" text-anchor="middle" class="svg-muted" font-size="12">scale IBGP</text>
<rect x="20" y="120" width="180" height="60" rx="10" fill="#fde68a"/><text x="110" y="148" text-anchor="middle" class="svg-ink" font-size="14">Confederations</text><text x="110" y="166" text-anchor="middle" class="svg-muted" font-size="12">and multipath</text>
<rect x="230" y="120" width="180" height="60" rx="10" fill="#fed7aa"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="14">AS tricks</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">local-as, as-override</text>
<rect x="440" y="120" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="148" text-anchor="middle" class="svg-ink" font-size="14">Troubleshooting</text><text x="530" y="166" text-anchor="middle" class="svg-muted" font-size="12">hidden routes, policy</text>
</svg><p class="cap">The six building blocks of advanced BGP.</p></div>

<h3>Your three labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Story</th><th>Devices</th></tr>
<tr><td>bgp-rr-design</td><td>Konark Media (AS 65100) replaces the full mesh with route reflector RR1</td><td>ISP, C1, C2, C3, RR1, PC3</td></tr>
<tr><td>bgp-community-policy</td><td>Customer, upstream and peering policy driven by communities (AS 65200)</td><td>CE, R1, R2, UP, PEER</td></tr>
<tr><td>bgp-localas-migration</td><td>A merger: AS 64520 becomes AS 65300 but the upstream still expects the old number</td><td>A1, B1, UPB</td></tr></table>
<p>All command output shown in this module was captured from these labs, so you will see the same text in the simulator.</p>

<h3>A mental model for every BGP problem</h3>
<p>Whenever BGP misbehaves, walk the same four questions: <b>(1) Is the session Established?</b> <b>(2) Did the route arrive?</b> (<code>show route receive-protocol bgp</code>) <b>(3) Is it usable?</b> The next hop must resolve, otherwise the route is <i>hidden</i>. <b>(4) Did policy or best-path selection change the outcome?</b> Each chapter adds tools for one of these questions.</p>

<div class="eg"><p><b>Worked example.</b> A customer announces 10.60.1.0/24. Your import policy adds community 65200:100 and local preference 200. Another provider announces the same prefix with local preference 100. Because 200 beats 100 before AS-path length is even looked at, the customer path wins everywhere in your AS. One policy line decided the exit for the whole network, and a community lets the next router decide again without looking at the prefix.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating BGP as "just another routing protocol". BGP carries policy, not topology: it does not find the shortest path, it finds the path you allow and prefer. A neighbour that is Established and a route that is installed are two different facts.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam often gives a policy that looks right but is attached at the wrong level or direction. Import acts on routes received from a peer; export acts on routes sent to a peer. Always say the direction aloud.</p></div>

<div class="scn"><h4>The ISP that leaked its customers</h4><p>A small ISP accepted customer routes and announced everything to two upstream providers. It became a free transit path between its upstreams and a link saturated overnight. The fix was not a bigger link: tagging customer routes at ingress and exporting only tagged routes to upstreams.</p><p><b>Lesson:</b> BGP policy is how you say who may use your network for transit. Communities make that rule short and repeatable.</p></div>

<div class="iv"><p class="q">"Why is BGP called a policy-based protocol?"</p><p>BGP chooses paths by attributes that operators set and filter (local preference, AS path, MED, communities) rather than by a metric of link cost. A good answer names one import use (local preference), one export use (MED or prepend) and one tagging use (communities), and mentions that policy is evaluated before routes enter or leave the table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers communities, route reflection, confederations, multipath and AS-number tricks.</li>
<li>Walk four questions: session, received route, usable next hop, policy and best path.</li>
<li>BGP expresses business policy; communities are the tags that make policy scalable.</li>
<li>Import is for received routes, export is for advertised routes.</li>
<li>Every output in this module was captured from the NK simulator labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap "BGP sessions up ho gaye" se aage badhkar "main real enterprise ya service-provider edge ke liye BGP design aur run kar sakta hoon" tak pahunchoge. Aap routes par communities tag karoge aur tags par policy banaoge, IBGP full mesh ki jagah route reflectors lagaoge, confederations samjhoge, multipath se load-balance karoge, aur mergers aur hub-and-spoke designs ke liye <code>local-as</code>, <code>remove-private</code>, <code>as-override</code> aur <code>loops</code> use karoge. Yeh JNCIP-ENT exam (JN0-650) ka BGP hissa hai aur senior network roles ke interviewers bhi yahi poochte hain.</p>
<p><b>Prerequisites.</b> Aapko pehle se pata hona chahiye ki EBGP aur IBGP session kaise banta hai, basic path attributes kya hain, aur Junos policy-statement kaise likhte hain. Woh JNCIS-ENT BGP module (jncis-bgp) aur JNCIA ke policy module mein hai. Hum unhe dohrate nahi, sirf refer karte hain.</p>

<h3>Analogy: international post</h3>
<p>BGP ko international dak vyavastha samjho. Har desh (autonomous system) ke andar apne rules hote hain, lekin deshon ke beech ek hi bhasha hoti hai: <b>main aapke through kaun si destinations pahunch sakta hoon, aur route kya hai?</b> <b>Community</b> parcel par laga rangeen sticker hai: "customer", "bahar forward mat karo", "express". Raaste ka koi bhi sorting office sticker padhkar address jaane bina action le sakta hai. <b>Route reflector</b> regional hub hai: har office har doosre office ko phone karne ki jagah hub se baat karta hai aur hub khabar aage bhejta hai. <b>local-as</b> trick us company jaisi hai jo merge ho gayi lekin partner ab bhi purane naam ke letterhead ki umeed rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Is module ke topics">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="14">Attributes</text><text x="110" y="66" text-anchor="middle" class="svg-muted" font-size="12">LP, MED, path choice</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Communities</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">tag aur filter</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="14">Route reflection</text><text x="530" y="66" text-anchor="middle" class="svg-muted" font-size="12">IBGP scale</text>
<rect x="20" y="120" width="180" height="60" rx="10" fill="#fde68a"/><text x="110" y="148" text-anchor="middle" class="svg-ink" font-size="14">Confederations</text><text x="110" y="166" text-anchor="middle" class="svg-muted" font-size="12">aur multipath</text>
<rect x="230" y="120" width="180" height="60" rx="10" fill="#fed7aa"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="14">AS tricks</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">local-as, as-override</text>
<rect x="440" y="120" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="148" text-anchor="middle" class="svg-ink" font-size="14">Troubleshooting</text><text x="530" y="166" text-anchor="middle" class="svg-muted" font-size="12">hidden routes, policy</text>
</svg><p class="cap">Advanced BGP ke chhe building blocks.</p></div>

<h3>Aapke teen labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Kahani</th><th>Devices</th></tr>
<tr><td>bgp-rr-design</td><td>Konark Media (AS 65100) full mesh ki jagah route reflector RR1 lagata hai</td><td>ISP, C1, C2, C3, RR1, PC3</td></tr>
<tr><td>bgp-community-policy</td><td>Communities se chalne wali customer, upstream aur peering policy (AS 65200)</td><td>CE, R1, R2, UP, PEER</td></tr>
<tr><td>bgp-localas-migration</td><td>Merger: AS 64520 ab AS 65300 hai lekin upstream abhi bhi purana number maangta hai</td><td>A1, B1, UPB</td></tr></table>
<p>Is module ka saara command output in labs se capture kiya gaya hai, isliye simulator mein aapko wahi text dikhega.</p>

<h3>Har BGP problem ke liye ek mental model</h3>
<p>Jab bhi BGP bigde, wahi chaar sawaal poochho: <b>(1) Kya session Established hai?</b> <b>(2) Kya route aaya?</b> (<code>show route receive-protocol bgp</code>) <b>(3) Kya woh use ho sakta hai?</b> Next hop resolve hona chahiye, warna route <i>hidden</i> hota hai. <b>(4) Kya policy ya best-path selection ne nateeja badla?</b> Har chapter in sawaalon mein se ek ke tools jodta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek customer 10.60.1.0/24 announce karta hai. Aapki import policy community 65200:100 aur local preference 200 lagati hai. Doosra provider wahi prefix local preference 100 ke saath announce karta hai. 200, 100 ko AS-path length dekhne se pehle hi haraa deta hai, isliye customer path aapke poore AS mein jeetta hai. Policy ki ek line ne poore network ka exit tay kiya, aur community agle router ko prefix dekhe bina phir decide karne deti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> BGP ko "bas ek aur routing protocol" samajhna. BGP topology nahi, policy carry karta hai: yeh shortest path nahi dhoondhta, woh path dhoondhta hai jo aap allow aur prefer karte ho. Established neighbour aur installed route do alag baatein hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam aksar aisi policy deta hai jo sahi lagti hai lekin galat level ya direction par lagi hoti hai. Import peer se aaye routes par kaam karta hai; export peer ko bheje routes par. Direction hamesha bolkar socho.</p></div>

<div class="scn"><h4>Woh ISP jisne customers leak kar diye</h4><p>Ek chhote ISP ne customer routes accept kiye aur sab kuch do upstream providers ko announce kar diya. Woh apne upstreams ke beech free transit path ban gaya aur raat bhar ek link saturate ho gaya. Fix bada link nahi tha: ingress par customer routes tag karna aur upstreams ko sirf tagged routes export karna.</p><p><b>Lesson:</b> BGP policy hi batati hai ki aapke network ko transit ke liye kaun use kar sakta hai. Communities is rule ko chhota aur repeatable banati hain.</p></div>

<div class="iv"><p class="q">"BGP ko policy-based protocol kyun kehte hain?"</p><p>BGP link cost ki metric se nahi, un attributes se path chunta hai jo operator set aur filter karta hai (local preference, AS path, MED, communities). Achha jawab ek import use (local preference), ek export use (MED ya prepend) aur ek tagging use (communities) batata hai, aur yeh bhi ki policy routes ke table mein aane ya jaane se pehle evaluate hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Is module mein communities, route reflection, confederations, multipath aur AS-number tricks hain.</li>
<li>Chaar sawaal: session, received route, usable next hop, policy aur best path.</li>
<li>BGP business policy express karta hai; communities woh tags hain jo policy ko scalable banate hain.</li>
<li>Import received routes ke liye hai, export advertised routes ke liye.</li>
<li>Is module ka har output NK simulator labs se capture kiya gaya hai.</li>
</ul></div>
`}};export{e as default};