var e={id:`east-west-lateral`,h:{en:`East-west traffic and lateral movement`,hi:`East-west traffic aur lateral movement`},body:{en:`
<h3>Most traffic never leaves the building</h3>
<p>When a customer clicks "Place order", one request enters the data center. Inside, that single click can cause dozens of calls: the web tier asks the app tier, the app tier asks the database, a billing service, a cache and a logging service. Modern applications are built from many small parts that talk to each other all day. Because of this, most traffic in a data center is <b>east-west</b>. Teams that measure it often find east-west is the large majority of all bytes. The exact share depends on the company; the direction of the trend is clear.</p>
<p>That is good news for attackers and bad news for a design that only watches the front door.</p>

<h3>Lateral movement, from the defender's chair</h3>
<p><b>Lateral movement</b> is what a defender calls it when an intruder who controls one workload starts reaching other workloads inside the network. The first foothold might be a web VM with an unpatched component or a stolen credential. A foothold on its own is not the real damage. The damage grows if that VM can freely talk to everything else.</p>
<p>We will study this only from the defender's side: what makes it possible, what it looks like in your logs, and which controls stop it.</p>
<h4>Why it is possible: three weaknesses</h4>
<dl class="terms">
<dt>Flat network</dt><dd>A network where any workload can reach any other workload on any service. There are no internal boundaries, like the bank with every door open.</dd>
<dt>Default allow</dt><dd>A firewall whose last rule permits everything that no earlier rule mentioned. Flows nobody thought about are therefore permitted.</dd>
<dt>Blast radius</dt><dd>The set of things that one compromised workload can reach. In a flat network with default allow, the blast radius is the whole environment. Good design shrinks the blast radius to what the application truly needs.</dd>
</dl>

<h4>Indicators a defender can watch for</h4>
<ul>
<li>A server starts talking to peers it has never talked to before, for example a web VM opening a database connection that the application design does not need.</li>
<li>One VM tries many destinations or many ports in a short time (a scanning pattern in flow logs).</li>
<li>Traffic on services that tier should not use, such as remote-administration services from a web server to other servers.</li>
<li>Flows from the dev environment into prod.</li>
</ul>
<h4>Controls that limit it</h4>
<ul>
<li>Allow only the flows the application needs (allow-list thinking, chapter 4).</li>
<li>Separate environments, so dev can never reach prod.</li>
<li>Log the rules that matter, so unusual flows leave a trace.</li>
<li>Quarantine a suspect VM quickly by tagging it and letting a rule isolate it (a later module).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Blast radius in a flat network and in a segmented network">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Flat: big blast radius</text>
<rect x="20" y="40" width="80" height="36" rx="8" fill="#fed7aa"/><text x="60" y="63" text-anchor="middle" class="svg-ink" font-size="12">WEB-P taken</text>
<rect x="120" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="220" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="70" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="110" y="143" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="190" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="230" y="143" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<line x1="100" y1="58" x2="120" y2="58" stroke="#c2410c" stroke-width="2"/><line x1="200" y1="58" x2="220" y2="58" stroke="#c2410c" stroke-width="2"/>
<line x1="60" y1="76" x2="105" y2="120" stroke="#c2410c" stroke-width="2"/><line x1="70" y1="76" x2="225" y2="120" stroke="#c2410c" stroke-width="2"/>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">every VM is reachable</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Segmented: small blast radius</text>
<rect x="340" y="40" width="80" height="36" rx="8" fill="#fed7aa"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">WEB-P taken</text>
<rect x="440" y="40" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="63" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="540" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="580" y="63" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="390" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="430" y="143" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="510" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="550" y="143" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<line x1="420" y1="58" x2="440" y2="58" stroke="#16a34a" stroke-width="2"/>
<text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">only the needed path stays open</text>
</svg><p class="cap">Same intruder, same first VM. The only difference is how many doors are open behind it.</p></div>

<h3>Lab 1 walkthrough: see the flat network</h3>
<p>In Lab 1 you are the defender at Narmada. Imagine WEB-P (10.10.10.10) has been taken over. You will look, not change anything. Open the console, go to <b>Tools</b>, choose source WEB-P, destination DB-P, service sql, and run <b>Traceflow</b>. Traceflow asks the policy a question: "what would happen to this flow?" It sends no packet and changes no counters. Then use <b>Send test traffic</b> on the same flow. Test traffic counts a hit on whichever rule decided.</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
<span class="hl">No rule matched: default rule -&gt; ALLOW</span>
<span class="hl">Result: ALLOW by the default rule</span></pre>
<p>Read it like a detective. Each line names a rule and says why it did not match: "source yes, destination no" means the sender fits the rule but the receiver does not. The rule "Web to app (prod)" fits WEB-P as source, but its destination is the app group and its service is h&#116;tps, so it does not apply to a sql flow to DB-P. "App to DB (prod)" has the right destination and service but the wrong source. No rule talks about web to database, so the <b>default rule</b> decides, and it says allow. A taken-over web server can reach the database. That is the flat network, shown in one result line.</p>
<p>After the test traffic, the hit counter for the default rule increases. That counter is useful evidence: if the default rule has many hits, many flows are being allowed by accident rather than on purpose.</p>

<div class="eg"><p><b>Worked example.</b> Count the doors. Narmada has 6 VMs. If every VM may reach every other VM on every service, each VM has 5 peers, so there are 6 x 5 = 30 directed paths. The application needs only 4 of them (WEB-P to APP-P, APP-P to DB-P, and the same two in dev). The other 26 paths are open for no business reason. Each one is a door an intruder might use.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading "ALLOW by the default rule" as "fine, it works": it works because nobody blocked it, not because someone approved it. (2) Believing Traceflow generates traffic: it only evaluates policy. (3) Hardening by switching the default to deny first: that blocks needed flows too. Chapter 4 shows the right order.</p></div>
<div class="exam"><p><b>Exam trap.</b> On a fresh install the default rule is permissive. "Default allow" is the starting point, not a recommended end state. The recommendation is to add specific allow rules and then move the default to drop or reject.</p></div>

<div class="scn"><h4>The web server that could see the database</h4><p>A Narmada analyst reviewed flow logs and saw WEB-P opening sql connections to DB-P at night. The web application never needs that. It turned out to be a developer's debugging shortcut, but it showed the risk: had WEB-P been taken over, the same path would have exposed customer records. The analyst ran a Traceflow, found "ALLOW by the default rule", and raised a ticket to add an explicit deny.</p><p><b>Lesson:</b> unexplained flows allowed by the default rule are the first thing to review.</p></div>

<div class="iv"><p class="q">"What is lateral movement and how do you reduce it?"</p><p>Strong answer: after one workload is compromised, an intruder tries to reach other workloads from inside. A flat network with default allow makes that easy. You reduce it by limiting the blast radius: allow only required flows between workloads, separate environments, log important rules, and be able to isolate a suspect VM fast. Keep it defensive and mention flow logs as the detection source.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most data-center traffic is east-west, because applications are built from many cooperating parts.</li>
<li>Lateral movement is an intruder reaching other workloads from one taken-over workload.</li>
<li>Flat network plus default allow means a large blast radius.</li>
<li>Traceflow shows, rule by rule, why a flow was allowed or denied, without sending traffic.</li>
<li>In Lab 1 no rule covers WEB-P to DB-P on sql, so the default rule allows it.</li>
</ul></div>
`,hi:`
<h3>Zyada traffic building ke bahar jaata hi nahi</h3>
<p>Jab customer "Place order" par click karta hai, ek request data center mein aati hai. Andar, wahi ek click darjano calls shuru kar sakta hai: web tier app tier se poochta hai, app tier database, billing service, cache aur logging service se poochta hai. Modern applications kai chhote parts se bani hoti hain jo din bhar ek doosre se baat karte hain. Isi wajah se data center ka zyada traffic <b>east-west</b> hota hai. Jo teams ise measure karti hain woh aksar paati hain ki east-west sabhi bytes ka bada hissa hai. Exact share company par depend karta hai; trend ki direction saaf hai.</p>
<p>Yeh attackers ke liye achhi khabar hai aur us design ke liye buri khabar jo sirf front door dekhta hai.</p>

<h3>Lateral movement, defender ki kursi se</h3>
<p><b>Lateral movement</b> woh cheez hai jise defender tab kehta hai jab ek intruder, jo ek workload par control rakhta hai, network ke andar doosre workloads tak pahunchne lagta hai. Pehla foothold ek web VM ho sakta hai jisme unpatched component ho ya chori hui credential. Akela foothold asli nuksan nahi hai. Nuksan tab badhta hai jab woh VM baaki sab se freely baat kar sake.</p>
<p>Hum ise sirf defender ki side se padhenge: yeh kya possible banata hai, logs mein kaisa dikhta hai, aur kaunse controls ise rokte hain.</p>
<h4>Yeh possible kyun hai: teen kamzoriyan</h4>
<dl class="terms">
<dt>Flat network</dt><dd>Aisa network jahan koi bhi workload kisi bhi doosre workload tak kisi bhi service par pahunch sakta hai. Andar koi boundary nahi, jaise bank jisme har darwaza khula hai.</dd>
<dt>Default allow</dt><dd>Aisa firewall jiska aakhri rule woh sab permit karta hai jo pehle ke kisi rule mein nahi aaya. Isliye jin flows ke baare mein kisi ne socha hi nahi, woh permitted hote hain.</dd>
<dt>Blast radius</dt><dd>Un cheezon ka set jinhe ek compromised workload reach kar sakta hai. Flat network aur default allow mein blast radius poora environment hota hai. Achha design blast radius ko sirf utna chhota karta hai jitna application ko sach mein chahiye.</dd>
</dl>

<h4>Indicators jinpar defender nazar rakh sakta hai</h4>
<ul>
<li>Koi server aise peers se baat karne lagta hai jinse usne pehle kabhi baat nahi ki, jaise web VM database connection khole jo application design ko chahiye hi nahi.</li>
<li>Ek VM thodi der mein bahut saari destinations ya bahut saare ports try karta hai (flow logs mein scanning pattern).</li>
<li>Aisi services par traffic jo us tier ko use nahi karni chahiye, jaise web server se doosre servers par remote-administration services.</li>
<li>Dev environment se prod ki taraf flows.</li>
</ul>
<h4>Controls jo ise limit karte hain</h4>
<ul>
<li>Sirf wahi flows allow karo jo application ko chahiye (allow-list thinking, chapter 4).</li>
<li>Environments alag rakho, taaki dev kabhi prod tak na pahunche.</li>
<li>Jo rules matter karte hain unhe log karo, taaki unusual flows nishaan chhodein.</li>
<li>Shak wale VM ko jaldi quarantine karo: use tag karo aur ek rule use isolate kare (aage ka module).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flat network aur segmented network mein blast radius">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Flat: bada blast radius</text>
<rect x="20" y="40" width="80" height="36" rx="8" fill="#fed7aa"/><text x="60" y="63" text-anchor="middle" class="svg-ink" font-size="12">WEB-P taken</text>
<rect x="120" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="220" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="70" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="110" y="143" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="190" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="230" y="143" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<line x1="100" y1="58" x2="120" y2="58" stroke="#c2410c" stroke-width="2"/><line x1="200" y1="58" x2="220" y2="58" stroke="#c2410c" stroke-width="2"/>
<line x1="60" y1="76" x2="105" y2="120" stroke="#c2410c" stroke-width="2"/><line x1="70" y1="76" x2="225" y2="120" stroke="#c2410c" stroke-width="2"/>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">har VM reachable hai</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Segmented: chhota blast radius</text>
<rect x="340" y="40" width="80" height="36" rx="8" fill="#fed7aa"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">WEB-P taken</text>
<rect x="440" y="40" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="63" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="540" y="40" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="580" y="63" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="390" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="430" y="143" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="510" y="120" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="550" y="143" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<line x1="420" y1="58" x2="440" y2="58" stroke="#16a34a" stroke-width="2"/>
<text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">sirf zaroori path khula rehta hai</text>
</svg><p class="cap">Wahi intruder, wahi pehla VM. Fark sirf itna hai ki uske peeche kitne darwaze khule hain.</p></div>

<h3>Lab 1 walkthrough: flat network dekho</h3>
<p>Lab 1 mein aap Narmada ke defender ho. Socho WEB-P (10.10.10.10) par kabza ho gaya hai. Aap sirf dekhoge, kuch badloge nahi. Console kholo, <b>Tools</b> par jao, source WEB-P, destination DB-P, service sql chuno aur <b>Traceflow</b> chalao. Traceflow policy se ek sawal poochta hai: "is flow ke saath kya hoga?" Woh koi packet nahi bhejta aur koi counter nahi badalta. Phir wahi flow par <b>Send test traffic</b> use karo. Test traffic us rule par hit count karta hai jisne decide kiya.</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
<span class="hl">No rule matched: default rule -&gt; ALLOW</span>
<span class="hl">Result: ALLOW by the default rule</span></pre>
<p>Ise detective ki tarah padho. Har line ek rule ka naam leti hai aur batati hai woh match kyun nahi hua: "source yes, destination no" ka matlab sender rule mein fit hota hai lekin receiver nahi. Rule "Web to app (prod)" mein WEB-P source fit hota hai, lekin uski destination app group hai aur service h&#116;tps hai, isliye woh DB-P ko jaane wale sql flow par lagu nahi hota. "App to DB (prod)" ki destination aur service sahi hain lekin source galat. Web se database ke baare mein koi rule hai hi nahi, isliye <b>default rule</b> decide karta hai, aur woh allow kehta hai. Taken-over web server database tak pahunch sakta hai. Yahi flat network hai, ek result line mein.</p>
<p>Test traffic ke baad default rule ka hit counter badhta hai. Yeh counter achha saboot hai: agar default rule ke bahut hits hain, to bahut saare flows jaan-boojhkar nahi, galti se allow ho rahe hain.</p>

<div class="eg"><p><b>Worked example.</b> Darwaze ginte hain. Narmada ke 6 VMs hain. Agar har VM har doosre VM tak har service par pahunch sakta hai, to har VM ke 5 peers hain, yaani 6 x 5 = 30 directed paths. Application ko sirf 4 chahiye (WEB-P se APP-P, APP-P se DB-P, aur dev mein wahi do). Baaki 26 paths bina kisi business reason ke khule hain. Har ek ek darwaza hai jise intruder use kar sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) "ALLOW by the default rule" ko "theek hai, chal raha hai" padhna: woh isliye chalta hai ki kisi ne block nahi kiya, isliye nahi ki kisi ne approve kiya. (2) Yeh maanna ki Traceflow traffic generate karta hai: woh sirf policy evaluate karta hai. (3) Pehle default ko deny karke hardening karna: isse zaroori flows bhi block ho jaate hain. Chapter 4 sahi order dikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fresh install par default rule permissive hota hai. "Default allow" shuruaati point hai, recommended end state nahi. Recommendation hai ki specific allow rules jodo aur phir default ko drop ya reject par le jao.</p></div>

<div class="scn"><h4>Web server jo database dekh sakta tha</h4><p>Narmada ke ek analyst ne flow logs review kiye aur dekha ki WEB-P raat ko DB-P par sql connections khol raha hai. Web application ko iski kabhi zaroorat nahi. Nikla ki yeh ek developer ka debugging shortcut tha, lekin isne risk dikha diya: agar WEB-P par kabza hota to wahi path customer records expose kar deta. Analyst ne Traceflow chalaya, "ALLOW by the default rule" dekha, aur ek explicit deny jodne ka ticket raise kiya.</p><p><b>Seekh:</b> default rule se allow hone wale unexplained flows sabse pehle review karo.</p></div>

<div class="iv"><p class="q">"Lateral movement kya hai aur ise kaise kam karte ho?"</p><p>Strong answer: ek workload compromise hone ke baad intruder andar se doosre workloads tak pahunchne ki koshish karta hai. Default allow wala flat network ise aasaan bana deta hai. Aap blast radius limit karke ise kam karte ho: workloads ke beech sirf zaroori flows allow karo, environments alag rakho, important rules log karo, aur shak wale VM ko jaldi isolate kar sako. Defensive rakho aur detection source ke taur par flow logs mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data-center ka zyada traffic east-west hota hai, kyunki applications kai cooperating parts se bani hoti hain.</li>
<li>Lateral movement matlab intruder ek taken-over workload se doosre workloads tak pahunchta hai.</li>
<li>Flat network plus default allow ka matlab bada blast radius.</li>
<li>Traceflow bina traffic bheje, rule by rule dikhata hai ki flow allow ya deny kyun hua.</li>
<li>Lab 1 mein WEB-P se DB-P sql ke liye koi rule nahi hai, isliye default rule allow karta hai.</li>
</ul></div>
`}};export{e as default};