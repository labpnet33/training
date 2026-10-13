var e={id:`intel-basics`,h:{en:`Threat intelligence basics: IOCs, observables, indicators, STIX and TAXII`,hi:`Threat intelligence basics: IOCs, observables, indicators, STIX aur TAXII`},body:{en:`
<p>Before you configure Threat Intelligence Director you need the vocabulary. Threat intelligence has its own language, and exam questions love to swap two of its words.</p>

<h3>An analogy: a wanted poster</h3>
<p>A police wanted poster has a photo, a name, a car number plate and a sentence like "armed, approach with care". Each single fact — the plate number, the name — is something you can check at a checkpoint. The poster as a whole tells you who the person is, why they matter and what to do. Threat intelligence works the same way. The single checkable facts are <b>observables</b>. The poster that groups them with context is an <b>indicator</b>. A <b>feed</b> is the stack of posters the police send you every day.</p>

<h3>The words, defined</h3>
<dl class="terms">
<dt>Indicator of compromise (IOC)</dt><dd>Any artifact that suggests a system is or was compromised: a command-and-control IP, a phishing domain, a malware file hash.</dd>
<dt>Observable</dt><dd>One concrete value a sensor can match in traffic: an IPv4 or IPv6 address, a domain, a URL or a SHA-256 file hash. In TID, observables are what the firewalls actually enforce.</dd>
<dt>Indicator</dt><dd>A named group of one or more observables plus context (description, confidence, severity, sometimes a logical relationship such as "this hash AND this domain"). A <b>simple</b> indicator holds one observable; a <b>complex</b> indicator holds several joined with AND/OR.</dd>
<dt>STIX</dt><dd>Structured Threat Information eXpression: a standard, machine-readable format for describing indicators, campaigns and threat actors.</dd>
<dt>TAXII</dt><dd>Trusted Automated eXchange of Indicator Information: the transport protocol a server uses to offer STIX content in <b>collections</b> and a client uses to poll them. STIX is the letter, TAXII is the postal service.</dd>
<dt>Flat file</dt><dd>A plain text list, one observable per line, of a single type — the simplest way a partner or CERT shares indicators.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Feed, indicator and observables">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Source / feed: CERT TAXII collection "active-campaigns"</text>
<rect x="20" y="80" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="105" text-anchor="middle" class="svg-ink" font-size="13">Indicator: "Campaign C2 node"</text>
<rect x="330" y="80" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="105" text-anchor="middle" class="svg-ink" font-size="13">Indicator: "Dropper + domain"</text>
<rect x="20" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="170" text-anchor="middle" class="svg-ink" font-size="13">IPv4 192.0.2.66</text>
<rect x="170" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="170" text-anchor="middle" class="svg-ink" font-size="13">domain cdn-stats</text>
<rect x="330" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="400" y="170" text-anchor="middle" class="svg-ink" font-size="13">SHA-256 9f2c…</text>
<rect x="480" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="170" text-anchor="middle" class="svg-ink" font-size="13">URL /nk-sim/dl</text>
<text x="475" y="138" text-anchor="middle" class="svg-accent" font-size="12">AND</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Threat Defense enforces observables; the Management Center tracks indicators and incidents</text>
</svg><p class="cap">A source delivers indicators; each indicator contains one or more observables.</p></div>

<h3>Where intelligence comes from</h3>
<p>The firewall already has excellent built-in intelligence: <b>Cisco Talos</b> feeds Security Intelligence lists, URL reputation and the intrusion rule set (you used these in sec-ftd-ips). TID is for <b>everything else</b>: a national or sector CERT, an ISAC (information sharing and analysis center for an industry such as banking), a commercial intelligence vendor, your own threat-hunting team, or a partner company that shares what attacked it last night. These sources usually speak STIX over TAXII, or they send a flat file.</p>

<table class="cmp"><tr><th>Source type</th><th>Typical delivery</th><th>Strength</th><th>Watch out for</th></tr>
<tr><td>Talos (built in)</td><td>Automatic updates</td><td>High quality, global</td><td>Not specific to your sector</td></tr>
<tr><td>National / sector CERT</td><td>STIX over TAXII, flat files</td><td>Local, campaign-specific</td><td>Variable confidence</td></tr>
<tr><td>Commercial vendor</td><td>TAXII collections</td><td>Rich context</td><td>Cost, volume</td></tr>
<tr><td>Internal hunting team</td><td>Flat file or manual upload</td><td>Exactly your threats</td><td>Needs ownership and expiry</td></tr></table>

<h3>Why quality and expiry matter</h3>
<p>Intelligence ages fast. Attackers rent cloud servers by the hour; an IP that was a command-and-control node last month may host a legitimate shop today. That is why every feed should carry a <b>confidence</b> score and why every observable needs a <b>time to live (TTL)</b> after which it is removed. A feed full of stale or shared-hosting IPs will block real business traffic. For the same reason good practice is to start a new source in <b>Monitor</b> (log only), review what it would have blocked, and then switch it to <b>Block</b>.</p>
<p>Also think about <b>what kind</b> of observable you are blocking. Blocking a SHA-256 hash is precise — it only matches that exact file. Blocking a domain is broad but robust when the attacker changes IPs. Blocking a single IP on a shared hosting platform can break hundreds of innocent sites. Analysts call this the "pyramid of pain": hashes and IPs are easy for an attacker to change, domains a bit harder, behaviours hardest.</p>

<div class="eg"><p><b>Worked example.</b> A CERT bulletin lists 3 IPs, 2 domains, 1 URL and 4 SHA-256 hashes for a phishing campaign. Imported into TID, that is 10 observables. If the bulletin says "the dropper hash AND the domain together indicate infection", that pair is one complex indicator; the incident becomes "fully realized" only when both are seen. The IPs, each on their own, are simple indicators that create an incident on the first match.</p></div>

<div class="warn"><p><b>Common mistake.</b> Importing a feed straight into Block. One false positive — for example a CDN address that also serves your payroll provider — and the helpdesk queue explodes. Monitor first, then block.</p></div>

<div class="exam"><p><b>Exam trap.</b> STIX is the <b>format</b>; TAXII is the <b>transport</b>. "TAXII packages" or "STIX servers" are distractors. Also: the observable types TID enforces are IPv4, IPv6, URL, domain and SHA-256 — not usernames, not ports.</p></div>

<div class="scn"><h4>The feed that blocked payroll</h4><p>A bank's SOC subscribed to a free indicator list and loaded it as a block list on a Friday. On Monday the HR team could not reach the payroll portal. The SOC searched the firewall events and found the portal's CDN address in the free list, with no confidence score and no expiry — it had been reported once, two years earlier. They removed the feed, re-imported only high-confidence indicators with a 30-day TTL, and from then on ran every new source in Monitor for a week before blocking.</p><p><b>Lesson:</b> intelligence is only as good as its confidence and its expiry. Treat a new feed like a new firewall rule: test before you enforce.</p></div>

<div class="iv"><p class="q">"What is the difference between STIX and TAXII, and between an indicator and an observable?"</p><p>Strong answer: STIX is a structured language for describing threat information; TAXII is the protocol used to exchange it, with servers publishing collections and clients polling them. An observable is a single matchable value such as an IP, domain, URL or SHA-256; an indicator groups observables with context and logic. Add that the firewall enforces observables, while TID tracks indicators and raises incidents when they are seen.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observables are single matchable values; indicators group them with context and AND/OR logic.</li>
<li>STIX is the format, TAXII is the transport; flat files are simple one-type lists.</li>
<li>Talos is built in; TID adds CERTs, ISACs, vendors and your own hunting team.</li>
<li>Confidence and TTL decide whether a feed helps or hurts.</li>
<li>Run new sources in Monitor first, then Block.</li>
</ul></div>
`,hi:`
<p>Threat Intelligence Director configure karne se pehle aapko vocabulary chahiye. Threat intelligence ki apni bhasha hai, aur exam questions iske do shabdon ko aapas mein badalna pasand karte hain.</p>

<h3>Ek analogy: wanted poster</h3>
<p>Police ke wanted poster par ek photo, ek naam, gaadi ka number plate aur "armed, dhyaan se approach karo" jaisa ek sentence hota hai. Har ek single fact — plate number, naam — checkpoint par check kiya ja sakta hai. Poora poster batata hai ki woh insaan kaun hai, kyun important hai aur kya karna hai. Threat intelligence bhi aise hi kaam karti hai. Single check hone wale facts <b>observables</b> hain. Jo poster unhe context ke saath group karta hai woh <b>indicator</b> hai. <b>Feed</b> posters ka woh dher hai jo police aapko roz bhejti hai.</p>

<h3>Shabd, define kiye hue</h3>
<dl class="terms">
<dt>Indicator of compromise (IOC)</dt><dd>Koi bhi artifact jo batata hai ki system compromise hai ya tha: command-and-control IP, phishing domain, malware file hash.</dd>
<dt>Observable</dt><dd>Ek concrete value jise sensor traffic mein match kar sakta hai: IPv4 ya IPv6 address, domain, URL ya SHA-256 file hash. TID mein observables hi woh cheez hain jo firewalls asal mein enforce karte hain.</dd>
<dt>Indicator</dt><dd>Ek ya zyada observables ka naam wala group plus context (description, confidence, severity, kabhi kabhi "yeh hash AND yeh domain" jaisa logical relationship). <b>Simple</b> indicator mein ek observable hota hai; <b>complex</b> indicator mein kai, AND/OR se jude hue.</dd>
<dt>STIX</dt><dd>Structured Threat Information eXpression: indicators, campaigns aur threat actors describe karne ka standard, machine-readable format.</dd>
<dt>TAXII</dt><dd>Trusted Automated eXchange of Indicator Information: woh transport protocol jisse server STIX content <b>collections</b> mein offer karta hai aur client unhe poll karta hai. STIX chitthi hai, TAXII daak seva.</dd>
<dt>Flat file</dt><dd>Plain text list, har line mein ek observable, ek hi type ka — partner ya CERT ke indicators share karne ka sabse simple tareeka.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Feed, indicator aur observables">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Source / feed: CERT TAXII collection "active-campaigns"</text>
<rect x="20" y="80" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="105" text-anchor="middle" class="svg-ink" font-size="13">Indicator: "Campaign C2 node"</text>
<rect x="330" y="80" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="105" text-anchor="middle" class="svg-ink" font-size="13">Indicator: "Dropper + domain"</text>
<rect x="20" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="170" text-anchor="middle" class="svg-ink" font-size="13">IPv4 192.0.2.66</text>
<rect x="170" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="170" text-anchor="middle" class="svg-ink" font-size="13">domain cdn-stats</text>
<rect x="330" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="400" y="170" text-anchor="middle" class="svg-ink" font-size="13">SHA-256 9f2c…</text>
<rect x="480" y="145" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="170" text-anchor="middle" class="svg-ink" font-size="13">URL /nk-sim/dl</text>
<text x="475" y="138" text-anchor="middle" class="svg-accent" font-size="12">AND</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Threat Defense observables enforce karta hai; Management Center indicators aur incidents track karta hai</text>
</svg><p class="cap">Source indicators deta hai; har indicator mein ek ya zyada observables hote hain.</p></div>

<h3>Intelligence kahan se aati hai</h3>
<p>Firewall ke paas pehle se behtareen built-in intelligence hai: <b>Cisco Talos</b> Security Intelligence lists, URL reputation aur intrusion rule set feed karta hai (yeh aapne sec-ftd-ips mein use kiye). TID <b>baaki sab</b> ke liye hai: national ya sector CERT, ISAC (banking jaisi kisi industry ka information sharing and analysis center), commercial intelligence vendor, aapki apni threat-hunting team, ya koi partner company jo share kare ki kal raat us par kisne attack kiya. Yeh sources aam taur par TAXII par STIX bolte hain, ya flat file bhejte hain.</p>

<table class="cmp"><tr><th>Source type</th><th>Typical delivery</th><th>Taakat</th><th>Kis cheez ka dhyaan rakho</th></tr>
<tr><td>Talos (built in)</td><td>Automatic updates</td><td>High quality, global</td><td>Aapke sector ke liye specific nahi</td></tr>
<tr><td>National / sector CERT</td><td>TAXII par STIX, flat files</td><td>Local, campaign-specific</td><td>Confidence badalta rehta hai</td></tr>
<tr><td>Commercial vendor</td><td>TAXII collections</td><td>Rich context</td><td>Cost, volume</td></tr>
<tr><td>Internal hunting team</td><td>Flat file ya manual upload</td><td>Bilkul aapke threats</td><td>Ownership aur expiry chahiye</td></tr></table>

<h3>Quality aur expiry kyun matter karte hain</h3>
<p>Intelligence jaldi purani hoti hai. Attackers cloud servers ghante ke hisaab se kiraye par lete hain; jo IP pichhle mahine command-and-control node tha, aaj woh ek legitimate shop host kar sakta hai. Isiliye har feed ke saath <b>confidence</b> score hona chahiye aur har observable ka <b>time to live (TTL)</b> hona chahiye jiske baad woh hat jaaye. Purane ya shared-hosting IPs se bhari feed asli business traffic block karegi. Isi wajah se good practice hai ki naya source <b>Monitor</b> (sirf log) mein shuru karo, dekho woh kya block karta, aur phir use <b>Block</b> par switch karo.</p>
<p>Yeh bhi socho ki aap <b>kis type</b> ka observable block kar rahe ho. SHA-256 hash block karna precise hai — sirf wahi exact file match hoti hai. Domain block karna broad hai lekin robust hai jab attacker IPs badalta hai. Shared hosting platform ka ek IP block karne se sainkdon begunah sites toot sakti hain. Analysts ise "pyramid of pain" kehte hain: hashes aur IPs attacker ke liye badalna aasaan hai, domains thoda mushkil, behaviours sabse mushkil.</p>

<div class="eg"><p><b>Worked example.</b> Ek CERT bulletin ek phishing campaign ke liye 3 IPs, 2 domains, 1 URL aur 4 SHA-256 hashes list karta hai. TID mein import karne par yeh 10 observables hain. Agar bulletin kehta hai "dropper hash AND domain dono saath infection batate hain", to woh pair ek complex indicator hai; incident tabhi "fully realized" hota hai jab dono dikhein. IPs, har ek akela, simple indicators hain jo pehle match par incident banate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Feed ko seedha Block mein import karna. Ek false positive — jaise koi CDN address jo aapke payroll provider ko bhi serve karta hai — aur helpdesk queue phat jaati hai. Pehle Monitor, phir block.</p></div>

<div class="exam"><p><b>Exam trap.</b> STIX <b>format</b> hai; TAXII <b>transport</b> hai. "TAXII packages" ya "STIX servers" distractors hain. Aur: TID jo observable types enforce karta hai woh IPv4, IPv6, URL, domain aur SHA-256 hain — usernames nahi, ports nahi.</p></div>

<div class="scn"><h4>Woh feed jisne payroll block kar diya</h4><p>Ek bank ke SOC ne ek free indicator list subscribe ki aur Friday ko use block list ki tarah load kar diya. Monday ko HR team payroll portal tak nahi pahunch payi. SOC ne firewall events search kiye aur portal ka CDN address free list mein mila, bina confidence score aur bina expiry ke — use do saal pehle ek baar report kiya gaya tha. Unhone feed hata di, sirf high-confidence indicators 30-day TTL ke saath dobara import kiye, aur tab se har naya source block karne se pehle ek hafte Monitor mein chalaya.</p><p><b>Seekh:</b> intelligence utni hi achhi hai jitna uska confidence aur expiry. Nayi feed ko naye firewall rule ki tarah treat karo: enforce karne se pehle test karo.</p></div>

<div class="iv"><p class="q">"STIX aur TAXII mein, aur indicator aur observable mein kya farak hai?"</p><p>Strong answer: STIX threat information describe karne ki structured language hai; TAXII use exchange karne ka protocol hai, jismein servers collections publish karte hain aur clients unhe poll karte hain. Observable ek single match hone wali value hai jaise IP, domain, URL ya SHA-256; indicator observables ko context aur logic ke saath group karta hai. Saath mein batao ki firewall observables enforce karta hai, jabki TID indicators track karta hai aur dikhne par incidents banata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observables single match hone wali values hain; indicators unhe context aur AND/OR logic ke saath group karte hain.</li>
<li>STIX format hai, TAXII transport; flat files simple ek-type lists hain.</li>
<li>Talos built in hai; TID CERTs, ISACs, vendors aur aapki apni hunting team jodta hai.</li>
<li>Confidence aur TTL tay karte hain ki feed madad karegi ya nuksaan.</li>
<li>Naye sources pehle Monitor mein chalao, phir Block.</li>
</ul></div>
`}};export{e as default};