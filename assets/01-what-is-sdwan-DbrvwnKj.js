var e={id:`what-is-sdwan`,h:{en:`What SD-WAN is, and the problem it solves`,hi:`SD-WAN kya hai, aur woh kaunsa problem solve karta hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will start from zero and finish able to bring up a Versa SD-WAN branch yourself. You will learn what SD-WAN is and why companies buy it, the difference between the underlay and the overlay, how carriers deliver Internet, MPLS and LTE circuits, how IPsec tunnels protect the overlay, what an organization (tenant), a site and a site-id are, how the Versa architecture fits together (Director, Controller, Analytics, VOS branch, optional Concerto), and how to drive the VOS command line. Then you will practise three labs: <b>vs-underlay-inet</b> (bring up the Delhi Internet circuit), <b>vs-tenant-site</b> (give Delhi its overlay identity) and <b>vs-controller-typo</b> (a ticket where the overlay is Idle after a change).</p>
<p><b>Prerequisites.</b> Basic IPv4 addressing and subnetting (a /30 has two usable hosts), what a default route is, what ping does, and what a VRF or virtual router means in one sentence. If you have finished the CCNA-level modules in this academy you are ready. No Versa experience is needed.</p>

<h3>Start with an analogy: a company with a courier network</h3>
<p>Imagine a company with 200 shops across India and one head office in Mumbai. For years it hired one expensive courier company with a guaranteed delivery promise to carry every parcel between shops and head office. It worked, but each new shop took weeks to connect, and the bill grew every month. One day a manager asks: "Why not use the cheap public postal service for ordinary parcels and keep the expensive courier only for urgent ones? And can someone watch every parcel and choose the best route automatically?"</p>
<p>That manager is describing SD-WAN. A <b>WAN</b> (wide area network) connects sites that are far apart. <b>SD-WAN</b> means <b>software-defined WAN</b>: a central software brain decides how traffic crosses several different links, so the company can mix cheap and premium transports and still keep applications healthy.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Old WAN versus SD-WAN">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Old: MPLS only</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">New: hybrid SD-WAN</text>
<rect x="20" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="220" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="110" y="150" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Head office DC</text>
<ellipse cx="160" cy="110" rx="60" ry="20" fill="#fed7aa"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">MPLS cloud</text>
<line x1="60" y1="74" x2="130" y2="100" stroke="#64748b"/><line x1="260" y1="74" x2="190" y2="100" stroke="#64748b"/><line x1="160" y1="130" x2="160" y2="150" stroke="#64748b"/>
<rect x="340" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="380" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="540" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="430" y="150" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Head office DC</text>
<ellipse cx="440" cy="110" rx="40" ry="16" fill="#fed7aa"/><text x="440" y="114" text-anchor="middle" class="svg-ink" font-size="11">MPLS</text>
<ellipse cx="530" cy="110" rx="40" ry="16" fill="#ddd6fe"/><text x="530" y="114" text-anchor="middle" class="svg-ink" font-size="11">Internet</text>
<line x1="380" y1="74" x2="440" y2="94" stroke="#64748b"/><line x1="380" y1="74" x2="520" y2="94" stroke="#64748b" stroke-dasharray="4"/><line x1="580" y1="74" x2="540" y2="94" stroke="#64748b"/><line x1="440" y1="126" x2="470" y2="150" stroke="#64748b"/><line x1="530" y1="126" x2="500" y2="150" stroke="#64748b"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Several transports, one policy brain</text>
</svg><p class="cap">Left: every branch depends on one private carrier. Right: each branch has two or three transports and software chooses per application.</p></div>

<h3>The problem SD-WAN solves</h3>
<p>For two decades the enterprise WAN was <b>MPLS</b>: a private, carrier-managed network with a service level agreement (SLA). It is reliable but expensive per megabit, slow to order (weeks to months for a new circuit), and it carries branch Internet traffic backhaul-style to the head office. That last point hurts today. When an employee in Delhi opens a cloud application, the traffic travels over MPLS to Mumbai, through the central firewall, out to the Internet, and all the way back. The path is long, the head-office link is crowded, and the cloud application feels slow.</p>
<p>Meanwhile, ordinary broadband and 4G/5G became cheap and fast. The catch: the Internet gives no guarantee. Latency and loss change minute by minute. SD-WAN is the answer to "how do we safely use cheap links?" It does four things:</p>
<ul>
<li><b>Builds an encrypted overlay</b> across any transport, so private traffic is safe even on the public Internet.</li>
<li><b>Measures every path</b> continuously (latency, jitter, loss) and picks the best one per application.</li>
<li><b>Breaks out locally</b>: cloud and Internet traffic can leave directly at the branch (<b>direct Internet access</b>, DIA) with security applied there.</li>
<li><b>Centralises management</b>: one place to define templates and policy for hundreds of branches, with zero-touch onboarding.</li>
</ul>

<table class="cmp"><tr><th>Question</th><th>Traditional MPLS WAN</th><th>SD-WAN</th></tr>
<tr><td>Transport</td><td>One private carrier</td><td>Internet, MPLS, LTE/5G together</td></tr>
<tr><td>New branch</td><td>Weeks, per-branch router config</td><td>Days, template plus serial number</td></tr>
<tr><td>Cloud traffic</td><td>Backhauled to head office</td><td>Local breakout at the branch</td></tr>
<tr><td>Path choice</td><td>Static routing</td><td>Per application, based on live SLA</td></tr>
<tr><td>Cost per Mbps</td><td>High</td><td>Lower (cheap links carry bulk traffic)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The Delhi branch needs 100 Mbps. A carrier quotes an MPLS circuit at 5 units per Mbps and a business broadband line at 1 unit per Mbps. Buying 100 Mbps MPLS costs 500 units. With SD-WAN the company buys 20 Mbps MPLS (100 units) for voice and ERP, plus 100 Mbps broadband (100 units) for everything else: 200 units, more total capacity (120 Mbps), and a second path if one fails. Numbers are illustrative, but this is the exact business case that sold SD-WAN.</p></div>

<h3>Where Versa fits, and how this course teaches it</h3>
<p>Versa Networks builds an SD-WAN and security platform. Its branch software is <b>VOS</b> (Versa Operating System, which runs on the branch device, often called a CPE, customer premises equipment). A central <b>Director</b> manages devices, a <b>Controller</b> runs the control plane, and <b>Analytics</b> collects logs. You will meet all of them in this module.</p>
<div class="note"><p><b>About the lab CLI.</b> The real VOS command line and the Director web interface are much larger than anything in a first course. The labs in this academy use a deliberately <b>simplified CLI model</b> that keeps the real concepts and the real style of commands (<code>set</code>, <code>commit</code>, <code>show orgs org Acme sd-wan brief</code>) but supports only the subset you need. Where the model is simpler than the product, the text says so.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking SD-WAN replaces routing and IP. It does not. SD-WAN sits on top of ordinary IP connectivity. If the underlay is broken, no policy can fix it. This single idea drives the order of this module: underlay first, overlay second.</p></div>

<div class="scn"><h4>The slow cloud application</h4><p>A retailer with 120 stores backhauled all Internet traffic through two head-office firewalls over MPLS. Every Monday morning the head-office link hit 95 percent and the cloud billing app timed out. After moving to SD-WAN, each store kept MPLS for point-of-sale traffic to the data center and used a local broadband link for cloud applications, with a branch firewall inspecting it. The head-office link dropped to 40 percent and cloud response time halved.</p><p><b>Lesson:</b> SD-WAN is not mainly about "cheaper circuits". It is about sending each application over the right path.</p></div>

<div class="iv"><p class="q">"What is SD-WAN and why would a company adopt it?"</p><p>Strong answer: a software-defined WAN that builds an encrypted overlay over multiple underlay transports and steers traffic per application using live path measurements, managed centrally. Reasons: lower cost by mixing broadband with MPLS, local Internet breakout for cloud, faster branch rollout with zero-touch provisioning, and visibility. Add one caveat: it depends on a healthy underlay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN is a central software brain that uses several transports (Internet, MPLS, LTE/5G) together.</li>
<li>It solves cost, slow rollout, backhauled cloud traffic and lack of path visibility.</li>
<li>It builds an encrypted overlay and steers traffic per application using measured latency, jitter and loss.</li>
<li>Versa's pieces: VOS on branches, Director, Controller, Analytics.</li>
<li>The course lab CLI is a simplified model of the real VOS and Director.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap zero se shuru karoge aur end tak khud ek Versa SD-WAN branch bring up kar paoge. Aap seekhoge ki SD-WAN kya hai aur companies ise kyun kharidti hain, underlay aur overlay mein kya farak hai, carriers Internet, MPLS aur LTE circuits kaise deliver karte hain, IPsec tunnels overlay ko kaise protect karte hain, organization (tenant), site aur site-id kya hote hain, Versa architecture kaise judta hai (Director, Controller, Analytics, VOS branch, optional Concerto), aur VOS command line kaise chalate hain. Phir aap teen labs practise karoge: <b>vs-underlay-inet</b> (Delhi Internet circuit up karo), <b>vs-tenant-site</b> (Delhi ko overlay identity do) aur <b>vs-controller-typo</b> (ek ticket jahan change ke baad overlay Idle hai).</p>
<p><b>Prerequisites.</b> Basic IPv4 addressing aur subnetting (/30 mein do usable hosts hote hain), default route kya hota hai, ping kya karta hai, aur VRF ya virtual router ek line mein kya hota hai. Agar aapne is academy ke CCNA-level modules kiye hain to aap ready ho. Versa ka koi experience nahi chahiye.</p>

<h3>Ek analogy se shuru karo: courier network wali company</h3>
<p>Socho ek company ki poore India mein 200 shops hain aur Mumbai mein ek head office. Saalon tak usne ek mehengi courier company hire ki jo guaranteed delivery ke saath shops aur head office ke beech har parcel le jaati thi. Kaam chalta tha, lekin har nayi shop jodne mein hafte lagte the, aur bill har mahine badhta tha. Ek din manager poochta hai: "Normal parcels ke liye sasti public postal service kyun na use karein aur mehengi courier sirf urgent parcels ke liye rakhein? Aur koi har parcel ko dekh kar best route automatically kyun na chune?"</p>
<p>Yeh manager SD-WAN hi describe kar raha hai. <b>WAN</b> (wide area network) door door ki sites ko jodta hai. <b>SD-WAN</b> ka matlab <b>software-defined WAN</b>: ek central software brain decide karta hai ki traffic kai alag links par kaise jaye, taaki company sasti aur premium transports mix kar sake aur phir bhi applications healthy rahein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Purana WAN aur SD-WAN">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Purana: sirf MPLS</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Naya: hybrid SD-WAN</text>
<rect x="20" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="220" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="110" y="150" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Head office DC</text>
<ellipse cx="160" cy="110" rx="60" ry="20" fill="#fed7aa"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">MPLS cloud</text>
<line x1="60" y1="74" x2="130" y2="100" stroke="#64748b"/><line x1="260" y1="74" x2="190" y2="100" stroke="#64748b"/><line x1="160" y1="130" x2="160" y2="150" stroke="#64748b"/>
<rect x="340" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="380" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="540" y="40" width="80" height="34" rx="6" fill="#bae6fd"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="430" y="150" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Head office DC</text>
<ellipse cx="440" cy="110" rx="40" ry="16" fill="#fed7aa"/><text x="440" y="114" text-anchor="middle" class="svg-ink" font-size="11">MPLS</text>
<ellipse cx="530" cy="110" rx="40" ry="16" fill="#ddd6fe"/><text x="530" y="114" text-anchor="middle" class="svg-ink" font-size="11">Internet</text>
<line x1="380" y1="74" x2="440" y2="94" stroke="#64748b"/><line x1="380" y1="74" x2="520" y2="94" stroke="#64748b" stroke-dasharray="4"/><line x1="580" y1="74" x2="540" y2="94" stroke="#64748b"/><line x1="440" y1="126" x2="470" y2="150" stroke="#64748b"/><line x1="530" y1="126" x2="500" y2="150" stroke="#64748b"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Kai transports, ek policy brain</text>
</svg><p class="cap">Left: har branch ek private carrier par depend karti hai. Right: har branch ke paas do ya teen transports hain aur software per application choose karta hai.</p></div>

<h3>SD-WAN kaunsa problem solve karta hai</h3>
<p>Do dashak tak enterprise WAN matlab <b>MPLS</b> tha: ek private, carrier-managed network jismein service level agreement (SLA) hota hai. Yeh reliable hai lekin per megabit mehenga, order karne mein slow (naye circuit mein hafte se mahine), aur branch ka Internet traffic backhaul karke head office le jaata hai. Yeh last point aaj dard deta hai. Jab Delhi ka employee cloud application kholta hai, traffic MPLS se Mumbai jaata hai, central firewall se guzarta hai, Internet par nikalta hai, aur poora raasta wapas aata hai. Path lamba hai, head-office link crowded hai, aur cloud application slow lagti hai.</p>
<p>Idhar ordinary broadband aur 4G/5G sasta aur fast ho gaya. Catch yeh hai: Internet koi guarantee nahi deta. Latency aur loss minute by minute badalte hain. SD-WAN is sawaal ka jawab hai: "sasti links safely kaise use karein?" Yeh chaar kaam karta hai:</p>
<ul>
<li><b>Encrypted overlay banata hai</b> kisi bhi transport par, taaki private traffic public Internet par bhi safe rahe.</li>
<li><b>Har path ko continuously measure karta hai</b> (latency, jitter, loss) aur per application best path chunta hai.</li>
<li><b>Local breakout deta hai</b>: cloud aur Internet traffic branch se seedha nikal sakta hai (<b>direct Internet access</b>, DIA) aur security wahin apply hoti hai.</li>
<li><b>Management centralise karta hai</b>: hazaaron branches ke liye templates aur policy ek jagah, zero-touch onboarding ke saath.</li>
</ul>

<table class="cmp"><tr><th>Sawaal</th><th>Traditional MPLS WAN</th><th>SD-WAN</th></tr>
<tr><td>Transport</td><td>Ek private carrier</td><td>Internet, MPLS, LTE/5G saath mein</td></tr>
<tr><td>Nayi branch</td><td>Hafte, per-branch router config</td><td>Din, template plus serial number</td></tr>
<tr><td>Cloud traffic</td><td>Head office tak backhaul</td><td>Branch par local breakout</td></tr>
<tr><td>Path choice</td><td>Static routing</td><td>Per application, live SLA ke basis par</td></tr>
<tr><td>Cost per Mbps</td><td>High</td><td>Kam (sasti links bulk traffic leti hain)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Delhi branch ko 100 Mbps chahiye. Carrier MPLS circuit 5 unit per Mbps aur business broadband 1 unit per Mbps quote karta hai. 100 Mbps MPLS lene par 500 unit lagte hain. SD-WAN ke saath company 20 Mbps MPLS (100 unit) voice aur ERP ke liye leti hai, plus 100 Mbps broadband (100 unit) baaki sab ke liye: 200 unit, zyada total capacity (120 Mbps), aur ek link fail ho to doosra path. Numbers illustrative hain, lekin yahi business case SD-WAN ko bechta tha.</p></div>

<h3>Versa kahan fit hota hai, aur yeh course kaise padhata hai</h3>
<p>Versa Networks ek SD-WAN aur security platform banata hai. Iska branch software <b>VOS</b> hai (Versa Operating System, jo branch device par chalta hai, jise aksar CPE, customer premises equipment, kehte hain). Central <b>Director</b> devices manage karta hai, <b>Controller</b> control plane chalata hai, aur <b>Analytics</b> logs collect karta hai. In sabse aap is module mein milonge.</p>
<div class="note"><p><b>Lab CLI ke baare mein.</b> Asli VOS command line aur Director web interface pehle course ki kisi bhi cheez se bahut bade hain. Is academy ke labs jaan-boojh kar ek <b>simplified CLI model</b> use karte hain jo real concepts aur commands ka real style rakhta hai (<code>set</code>, <code>commit</code>, <code>show orgs org Acme sd-wan brief</code>) lekin sirf wahi subset support karta hai jo aapko chahiye. Jahan model product se simple hai, text mein bataya gaya hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki SD-WAN routing aur IP ko replace kar deta hai. Aisa nahi hai. SD-WAN ordinary IP connectivity ke upar baithta hai. Agar underlay toota hai to koi policy use fix nahi kar sakti. Yahi ek idea is module ka order decide karta hai: pehle underlay, phir overlay.</p></div>

<div class="scn"><h4>Slow cloud application</h4><p>120 stores wale ek retailer ne saara Internet traffic MPLS se do head-office firewalls ke through backhaul kiya. Har Monday subah head-office link 95 percent par pahunch jaata tha aur cloud billing app timeout ho jaati thi. SD-WAN par jaane ke baad har store ne point-of-sale traffic ke liye MPLS data center tak rakha aur cloud applications ke liye local broadband use kiya, jise branch firewall inspect karta tha. Head-office link 40 percent par aa gaya aur cloud response time aadha ho gaya.</p><p><b>Seekh:</b> SD-WAN mainly "sasti circuits" ke baare mein nahi hai. Yeh har application ko sahi path par bhejne ke baare mein hai.</p></div>

<div class="iv"><p class="q">"SD-WAN kya hai aur company ise kyun adopt karegi?"</p><p>Strong answer: ek software-defined WAN jo multiple underlay transports par encrypted overlay banata hai aur live path measurements se per application traffic steer karta hai, centrally managed. Reasons: broadband ko MPLS ke saath mix karke kam cost, cloud ke liye local Internet breakout, zero-touch provisioning se tez branch rollout, aur visibility. Ek caveat jodo: yeh healthy underlay par depend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN ek central software brain hai jo kai transports (Internet, MPLS, LTE/5G) ek saath use karta hai.</li>
<li>Yeh cost, slow rollout, backhaul hua cloud traffic aur path visibility ki kami solve karta hai.</li>
<li>Yeh encrypted overlay banata hai aur measured latency, jitter aur loss se per application traffic steer karta hai.</li>
<li>Versa ke pieces: branches par VOS, Director, Controller, Analytics.</li>
<li>Course ka lab CLI asli VOS aur Director ka simplified model hai.</li>
</ul></div>
`}};export{e as default};