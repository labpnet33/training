var e={id:`services`,h:{en:`Services: the assembly line and its classification rules`,hi:`Services: assembly line aur uske classification rules`},body:{en:`
<p>When trust works, the next question for ClearPass is simple: "Which of my configured workflows should handle this request?" The answer is a <b>service</b>. Services are the heart of ClearPass configuration, and mistakes here are the most common reason for a complete outage after a change.</p>

<h3>Analogy: the airport check-in counters</h3>
<p>At an airport the hall has counters: business class, economy domestic, economy international, group booking. A staff member at the entrance looks at your ticket and sends you to the first counter whose sign matches. If your ticket matches none of them, you are told "this is the wrong airport". A ClearPass service is a counter, and its <b>classification rules</b> are the sign above it.</p>

<h3>What a service contains</h3>
<p>A ClearPass service is a bundle of everything needed to handle one kind of request:</p>
<ul>
<li><b>Classification rules</b> (the Service tab): conditions on request attributes that decide whether this service takes the request.</li>
<li><b>Authentication</b> (the Authentication tab): the methods (such as [EAP PEAP] or [MAC AUTH]) and the sources (such as [Local User Repository] or [Endpoints Repository]).</li>
<li><b>Roles</b> (the Roles tab): the role-mapping policy that turns attributes into roles.</li>
<li><b>Enforcement</b> (the Enforcement tab): the enforcement policy that chooses the profile to return.</li>
</ul>
<p>The real GUI path is <b>Configuration, Services, Add</b>. You pick a service type such as an Aruba 802.1X Wired template, give the service a name and review the generated rules. In the lab, <code>configuration service add "Wired 802.1X" template wired-802.1x</code> does the same.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Service list top to bottom">
<rect x="20" y="15" width="600" height="48" rx="8" fill="#bae6fd"/><text x="40" y="44" class="svg-ink" font-size="13">1  Wired 802.1X       NAS-Port-Type = 15 and Service-Type in 1,2,8</text>
<rect x="20" y="75" width="600" height="48" rx="8" fill="#bbf7d0"/><text x="40" y="104" class="svg-ink" font-size="13">2  Wired MAC Auth      wired MAC authentication request</text>
<rect x="20" y="135" width="600" height="48" rx="8" fill="#ddd6fe"/><text x="40" y="164" class="svg-ink" font-size="13">3  Wireless 802.1X     NAS-Port-Type = 19</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">The request is tested from the top; the first match wins; no match = 9002</text>
<line x1="8" y1="25" x2="8" y2="170" stroke="#64748b" stroke-width="2"/><text x="8" y="190" text-anchor="middle" class="svg-muted" font-size="11">top</text>
</svg><p class="cap">Order is part of the configuration. A broad service placed above a precise one steals its requests.</p></div>

<h3>How classification rules look</h3>
<p>A rule is a triple: <b>attribute, operator, value</b>. Several rules are combined with match <b>ALL</b> or <b>ANY</b>. Operators you use most are EQUALS, NOT_EQUALS, BELONGS_TO (value is in a list), CONTAINS, EXISTS and MATCHES (pattern). The wired 802.1X template in the lab creates these rules:</p>
<pre class="out">Service: Wired 802.1X   (match: ALL)
  <span class="hl">Radius:IETF:NAS-Port-Type   EQUALS      15</span>
  <span class="hl">Radius:IETF:Service-Type    BELONGS_TO  1,2,8</span>
Auth methods : [EAP PEAP]
Auth sources : [Local User Repository]</pre>
<p>NAS-Port-Type 15 means "Ethernet", which is how a wired switch describes the port. A wireless service uses 19 (IEEE 802.11). That one number is what separates a wired service from a wireless service, and it will be the key in the troubleshooting lab.</p>

<h3>The two behaviours you must remember</h3>
<ol>
<li><b>Top to bottom, first match wins.</b> After a match, ClearPass stops looking. A catch-all test service placed above production will take everything.</li>
<li><b>No match means no processing.</b> ClearPass records error <b>9002 "Failed to classify request to service"</b> and the user is rejected. The built-in services that ship with a default install (such as the policy-manager admin login and the health-check services) do not match wired 802.1X requests, so they cannot rescue you.</li>
</ol>

<h3>Lab shell: reading and managing services</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Services</span>
configuration service show
configuration service "Wired 802.1X" show
configuration service "Wired 802.1X" order 1
configuration service "Wired 802.1X" disable
configuration service "Wired 802.1X" enable</pre>
<pre class="out">Services (evaluated top to bottom)
 1  Wired 802.1X      enabled   policy: EPOL-WIRED
 2  Wired MAC Auth    enabled   policy: EPOL-MAC</pre>
<p>Use <code>order N</code> to move a service to a position and <code>disable</code> to take one out of the evaluation without deleting it, a handy rollback.</p>

<div class="eg"><p><b>Worked example.</b> A request arrives with NAS-Port-Type 15 and Service-Type 2. ClearPass tests service 1: NAS-Port-Type EQUALS 15 is true, Service-Type BELONGS_TO 1,2,8 is true, match ALL satisfied, so service 1 handles it and the later services are never tested. Another request arrives with NAS-Port-Type 19. Service 1 fails the first rule, service 2 is not a 802.1X wired match, service 3 matches.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cloning a service from a wireless one and leaving NAS-Port-Type 19. Using match ANY when you meant ALL, which widens the service too far. Adding a new "temporary" allow-all service at the top of the list and forgetting to remove it. Changing a service and not testing a real login afterwards.</p></div>

<div class="exam"><p><b>Exam trap.</b> Classification is about the <b>request attributes</b>, not about the user. The username is not known to the classification step in the same way it is later, so do not try to separate employees from contractors with services; use role mapping and enforcement for that. Services separate access types: wired 802.1X, wired MAC auth, wireless, guest, TACACS+.</p></div>

<div class="scn"><h4>The allow-all that never left</h4><p>During a pilot an engineer created "Wired Allow-All Test" and put it at the top of the list. The pilot finished, but the service stayed. Months later an audit showed that every wired login, including employees, was being handled by the test service and received a generic role. Production policies had never run. Disabling the test service and bouncing the ports restored proper roles.</p><p><b>Lesson:</b> service order is policy. Review the whole list after every change.</p></div>

<div class="iv"><p class="q">"Users report that nobody can log in after a change; the Access Tracker shows 9002. What happened?"</p><p>Strong answer: the request did not match any enabled service. Look at the service classification rules, compare them with the Input tab attributes of the failed record, for example NAS-Port-Type and Service-Type, and correct the rule or the order. Mention that this is not a credential problem because authentication never started.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A service bundles classification rules, authentication, roles and enforcement.</li>
<li>Services are tested top to bottom, first match wins, no match is error 9002.</li>
<li>Wired is NAS-Port-Type 15; wireless is 19.</li>
<li>Rules are attribute, operator, value, combined with match ALL or ANY.</li>
<li>Use order and disable to manage services safely.</li>
</ul></div>
`,hi:`
<p>Trust kaam karne ke baad ClearPass ka agla sawaal simple hai: "Meri configured workflows mein se kaunsi is request ko handle kare?" Iska jawab ek <b>service</b> hai. Services ClearPass configuration ka dil hain, aur yahan ki galtiyan change ke baad complete outage ki sabse common wajah hain.</p>

<h3>Analogy: airport ke check-in counters</h3>
<p>Airport ke hall mein counters hote hain: business class, economy domestic, economy international, group booking. Entrance par staff aapka ticket dekhta hai aur aapko pehle us counter par bhejta hai jiska sign match karta hai. Agar ticket kisi se match na kare to kaha jata hai "yeh galat airport hai". ClearPass service ek counter hai, aur uske <b>classification rules</b> counter ke upar ka sign hain.</p>

<h3>Service mein kya hota hai</h3>
<p>ClearPass service ek bundle hai jisme ek type ki request handle karne ki saari cheezein hoti hain:</p>
<ul>
<li><b>Classification rules</b> (Service tab): request attributes par conditions jo decide karti hain ki yeh service request legi ya nahi.</li>
<li><b>Authentication</b> (Authentication tab): methods (jaise [EAP PEAP] ya [MAC AUTH]) aur sources (jaise [Local User Repository] ya [Endpoints Repository]).</li>
<li><b>Roles</b> (Roles tab): role-mapping policy jo attributes ko roles mein badalti hai.</li>
<li><b>Enforcement</b> (Enforcement tab): enforcement policy jo return hone wala profile chunti hai.</li>
</ul>
<p>Real GUI path <b>Configuration, Services, Add</b> hai. Aap Aruba 802.1X Wired template jaisa service type chunte ho, service ko naam dete ho aur generated rules review karte ho. Lab mein <code>configuration service add "Wired 802.1X" template wired-802.1x</code> wahi kaam karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Service list upar se neeche">
<rect x="20" y="15" width="600" height="48" rx="8" fill="#bae6fd"/><text x="40" y="44" class="svg-ink" font-size="13">1  Wired 802.1X       NAS-Port-Type = 15 and Service-Type in 1,2,8</text>
<rect x="20" y="75" width="600" height="48" rx="8" fill="#bbf7d0"/><text x="40" y="104" class="svg-ink" font-size="13">2  Wired MAC Auth      wired MAC authentication request</text>
<rect x="20" y="135" width="600" height="48" rx="8" fill="#ddd6fe"/><text x="40" y="164" class="svg-ink" font-size="13">3  Wireless 802.1X     NAS-Port-Type = 19</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">Request upar se test hoti hai; first match jeetta hai; no match = 9002</text>
<line x1="8" y1="25" x2="8" y2="170" stroke="#64748b" stroke-width="2"/><text x="8" y="190" text-anchor="middle" class="svg-muted" font-size="11">top</text>
</svg><p class="cap">Order configuration ka hissa hai. Precise service ke upar rakhi broad service uski requests chura leti hai.</p></div>

<h3>Classification rules kaise dikhte hain</h3>
<p>Rule ek triple hai: <b>attribute, operator, value</b>. Kai rules match <b>ALL</b> ya <b>ANY</b> se combine hote hain. Sabse zyada use hone wale operators EQUALS, NOT_EQUALS, BELONGS_TO (value list mein hai), CONTAINS, EXISTS aur MATCHES (pattern) hain. Lab ka wired 802.1X template yeh rules banata hai:</p>
<pre class="out">Service: Wired 802.1X   (match: ALL)
  <span class="hl">Radius:IETF:NAS-Port-Type   EQUALS      15</span>
  <span class="hl">Radius:IETF:Service-Type    BELONGS_TO  1,2,8</span>
Auth methods : [EAP PEAP]
Auth sources : [Local User Repository]</pre>
<p>NAS-Port-Type 15 ka matlab "Ethernet" hai, jis tarah wired switch port ko describe karta hai. Wireless service 19 (IEEE 802.11) use karti hai. Wahi ek number wired service ko wireless service se alag karta hai, aur troubleshooting lab mein wahi key hoga.</p>

<h3>Do behaviours jo yaad rakhne hain</h3>
<ol>
<li><b>Upar se neeche, first match jeetta hai.</b> Match ke baad ClearPass dekhna band kar deta hai. Production ke upar rakhi catch-all test service sab kuch le legi.</li>
<li><b>No match matlab no processing.</b> ClearPass error <b>9002 "Failed to classify request to service"</b> record karta hai aur user reject ho jata hai. Default install ke saath aane wali built-in services (jaise policy-manager admin login aur health-check services) wired 802.1X requests ko match nahi karti, isliye woh aapko bacha nahi sakti.</li>
</ol>

<h3>Lab shell: services padhna aur manage karna</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Services</span>
configuration service show
configuration service "Wired 802.1X" show
configuration service "Wired 802.1X" order 1
configuration service "Wired 802.1X" disable
configuration service "Wired 802.1X" enable</pre>
<pre class="out">Services (evaluated top to bottom)
 1  Wired 802.1X      enabled   policy: EPOL-WIRED
 2  Wired MAC Auth    enabled   policy: EPOL-MAC</pre>
<p>Service ko position par le jaane ke liye <code>order N</code> use karo, aur kisi service ko delete kiye bina evaluation se nikalne ke liye <code>disable</code>, jo rollback ke liye kaam ka hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek request aati hai jisme NAS-Port-Type 15 aur Service-Type 2 hai. ClearPass service 1 test karta hai: NAS-Port-Type EQUALS 15 true hai, Service-Type BELONGS_TO 1,2,8 true hai, match ALL satisfy hua, to service 1 handle karti hai aur baad ki services test hi nahi hoti. Doosri request NAS-Port-Type 19 ke saath aati hai. Service 1 pehle rule par fail hoti hai, service 2 wired 802.1X match nahi hai, service 3 match karti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Wireless service se clone karke NAS-Port-Type 19 chhod dena. ALL ke bajaye ANY use karna, jo service ko zyada chaudi kar deta hai. List ke top par naya "temporary" allow-all service daalna aur hatana bhool jana. Service badalne ke baad real login test na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Classification <b>request attributes</b> ke baare mein hai, user ke baare mein nahi. Services se employees aur contractors ko alag karne ki koshish mat karo; uske liye role mapping aur enforcement use karo. Services access types alag karti hain: wired 802.1X, wired MAC auth, wireless, guest, TACACS+.</p></div>

<div class="scn"><h4>Allow-all jo kabhi gaya nahi</h4><p>Pilot ke dauraan ek engineer ne "Wired Allow-All Test" banaya aur list ke top par rakha. Pilot khatam hua, par service reh gayi. Mahino baad audit mein pata chala ki har wired login, employees samet, test service handle kar rahi thi aur generic role mil raha tha. Production policies kabhi chali hi nahi thi. Test service disable karke ports bounce karne se proper roles wapas aa gaye.</p><p><b>Seekh:</b> service order policy hai. Har change ke baad poori list review karo.</p></div>

<div class="iv"><p class="q">"Change ke baad users batate hain ki koi login nahi kar pa raha; Access Tracker mein 9002 hai. Kya hua?"</p><p>Strong answer: request kisi enabled service se match nahi hui. Service classification rules dekho, unhe failed record ki Input tab attributes se compare karo, jaise NAS-Port-Type aur Service-Type, aur rule ya order sahi karo. Mention karo ki yeh credential problem nahi hai kyunki authentication shuru hi nahi hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service mein classification rules, authentication, roles aur enforcement ka bundle hota hai.</li>
<li>Services upar se neeche test hoti hain, first match jeetta hai, no match error 9002 hai.</li>
<li>Wired NAS-Port-Type 15 hai; wireless 19.</li>
<li>Rules attribute, operator, value hote hain, match ALL ya ANY se combine.</li>
<li>Services ko safely manage karne ke liye order aur disable use karo.</li>
</ul></div>
`}};export{e as default};