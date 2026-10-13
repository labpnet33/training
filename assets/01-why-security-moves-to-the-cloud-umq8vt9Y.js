var e={id:`why-cloud-security`,h:{en:`Why security moves to the cloud`,hi:`Security cloud mein kyun move ho rahi hai`},body:{en:`
<h3>What you will learn</h3>
<p>This track teaches you to run a cloud security service the way a Cloud Security Access Engineer does: send traffic to it, write policy, read logs and fix tickets. In this first module you learn the vocabulary and the portal. By the end of this chapter you can explain, in plain words, why companies stopped putting one big firewall at head office and started buying security as a cloud service.</p>
<p><b>Prerequisites:</b> you know what an IP address is, what a browser does when you type a website name, and the idea of a firewall as a gatekeeper. Nothing else. We build the rest from scratch.</p>

<h3>An analogy: one gate versus a checkpoint at every door</h3>
<p>Old offices were like a walled fort with one gate. Everyone worked inside, guards at the gate checked everything, and anyone outside the wall was a stranger. Today the staff are in three cities and at home, and the work lives on websites run by other companies. Making everybody walk back to the fort gate for every request is slow. A cloud security service puts a checkpoint near each person, and the same rule book is used at every checkpoint.</p>

<h3>Four words you must know</h3>
<dl class="terms">
<dt>Proxy</dt><dd>A middleman. Your browser asks the proxy to fetch a page, the proxy talks to the website and hands the answer back. Because it sits in the middle, it can allow, block or log the request. A proxy that protects users on their way out to the internet is called a <b>secure web gateway</b>.</dd>
<dt>Tunnel</dt><dd>Packets placed inside other packets so they can cross a network to a chosen endpoint. Think of a sealed courier bag travelling inside a delivery van.</dd>
<dt>DNS</dt><dd>The phone book of the internet. It turns a name such as news.example into an IP address. Many security decisions start from the name or its category.</dd>
<dt>TLS</dt><dd>The encryption used by HTTPS. The server shows a certificate to prove who it is, then both sides encrypt the conversation. Encryption protects privacy but also hides content from a firewall. Chapter 3 and module zs-sec return to this.</dd>
</dl>

<h3>The old design: backhaul everything to head office</h3>
<p>Sahyadri Logistics has Pune HQ, a Chennai branch and a Jaipur branch. In the old design every branch sent all internet traffic over a private link to Pune. One firewall and one proxy in the Pune server room inspected it, then released it to the internet. This worked while applications lived in the Pune server room.</p>
<p>It breaks in three ways. First, <b>applications moved</b> to websites on the internet, so the detour through Pune only adds delay. Second, <b>people moved</b>: vikram works from home and is not on any branch link. Third, <b>most traffic is encrypted</b>, and the old box could not afford to open all of it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Backhaul versus cloud security">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">Old: backhaul to HQ</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">Jaipur PC</text>
<rect x="110" y="110" width="80" height="40" rx="8" fill="#fde68a"/><text x="150" y="135" text-anchor="middle" class="svg-ink" font-size="12">Pune FW</text>
<rect x="210" y="40" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="250" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<line x1="70" y1="80" x2="125" y2="110" stroke="#64748b" stroke-width="2"/><line x1="175" y1="110" x2="235" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="150" y="185" text-anchor="middle" class="svg-muted" font-size="12">long detour, one box, no home users</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">New: security in the cloud</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="12">Jaipur PC</text>
<rect x="440" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="485" y="65" text-anchor="middle" class="svg-ink" font-size="12">Cloud security</text>
<rect x="550" y="40" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="585" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="340" y="110" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">vikram home</text>
<line x1="420" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="550" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="460" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">short path, one rule book, everyone covered</text>
</svg><p class="cap">The checkpoint moves from the Pune server room to a cloud edge near every user.</p></div>

<div class="eg"><p><b>Worked example.</b> A Jaipur user opens a software-as-a-service site. Direct, the round trip is about 25 ms. Backhauled, Jaipur to Pune adds about 45 ms and Pune to the site adds 25 ms: 70 ms for every request, and a page makes dozens. With a nearby cloud node the path stays close to the direct time plus a few milliseconds of inspection. These numbers are examples; yours depend on the circuits.</p></div>

<h3>The new design for Sahyadri</h3>
<p>Each location chooses a way to <b>forward</b> traffic to the cloud service: Pune uses an IPsec tunnel, Chennai a GRE tunnel, Jaipur a PAC file (an explicit proxy setting) and vikram a client program on his laptop. Module zs-fwd teaches these four. Policy no longer lives in the Pune firewall; it lives in one admin portal and applies to everybody.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Moving a site from backhaul to cloud security changes where its web traffic exits. Before, it left through the Pune firewall, which logged it. After, it leaves through a cloud node, and the Pune firewall sees only a tunnel. If you forget to forward a site, its traffic goes <b>direct</b>: no policy, no inspection and no logs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking cloud security means "no firewall at the site"; the edge firewall still exists and decides what may leave. (2) Believing the cloud service sees traffic that was never forwarded to it. (3) Mixing up a proxy (a middleman for one application protocol) with a tunnel (a carrier for any packets).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Does cloud security remove the need for a firewall?" No. The device at the site still protects the LAN; cloud security adds a shared checkpoint for internet and private-application access.</p></div>

<div class="scn"><h4>The Jaipur page that took ten seconds</h4><p>Sales in Jaipur complained that the quotation website was slow every afternoon. The engineer found all branch traffic crossing the Pune link, which was busy with backups. Moving Jaipur to the cloud service took the web traffic off that link. The same page now opened in under two seconds, and the Pune link became free for the ERP.</p><p><b>Lesson:</b> backhaul turns one busy link into everyone's bottleneck.</p></div>

<div class="iv"><p class="q">"Why are companies moving from data-centre firewalls to cloud security?"</p><p>Strong answer: applications and users are now outside the data centre, so backhauling traffic adds latency and cost and leaves home users out. A cloud service puts the checkpoint near the user and keeps one policy for all locations. Mention encryption: more traffic is TLS, so inspection capacity matters. Add that you still need an edge firewall at each site.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A proxy is a middleman; a tunnel is a carrier; DNS maps names to IPs; TLS encrypts HTTPS.</li>
<li>Backhaul sends all branch traffic to head office, which adds delay and ignores remote users.</li>
<li>Cloud security puts one shared checkpoint near every user, with one policy.</li>
<li>Sahyadri forwards Pune by IPsec, Chennai by GRE, Jaipur by PAC and vikram by client connector.</li>
<li>Traffic that is not forwarded goes direct and is completely unprotected.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh track aapko cloud security service chalana sikhata hai, jaise ek Cloud Security Access Engineer karta hai: traffic usko bhejna, policy likhna, logs padhna aur tickets fix karna. Is pehle module mein aap vocabulary aur portal seekhoge. Is chapter ke end tak aap simple words mein bata sakoge ki companies ne head office mein ek bada firewall rakhna chhodkar security ko cloud service ki tarah kyun lena shuru kiya.</p>
<p><b>Prerequisites:</b> aapko pata ho IP address kya hai, website ka naam type karne par browser kya karta hai, aur firewall ka idea ek gatekeeper ki tarah. Bas itna. Baaki sab hum zero se banayenge.</p>

<h3>Ek analogy: ek gate ya har darwaze par checkpoint</h3>
<p>Purane offices ek diwar wale fort jaise the jisme ek hi gate hota tha. Sab andar kaam karte the, gate par guards sab check karte the, aur diwar ke bahar jo hai woh ajnabi. Aaj staff teen shehron mein aur ghar par hai, aur kaam doosri companies ki websites par rehta hai. Har request ke liye sabko fort ke gate tak wapas bhejna slow hai. Cloud security service har insaan ke paas ek checkpoint rakhti hai, aur har checkpoint par wahi rule book chalti hai.</p>

<h3>Chaar words jo aapko aane chahiye</h3>
<dl class="terms">
<dt>Proxy</dt><dd>Ek beech ka aadmi. Aapka browser proxy se page mangta hai, proxy website se baat karta hai aur jawab wapas deta hai. Beech mein baitha hone ki wajah se woh request ko allow, block ya log kar sakta hai. Jo proxy users ko internet par jaate waqt protect karta hai usse <b>secure web gateway</b> kehte hain.</dd>
<dt>Tunnel</dt><dd>Packets ko doosre packets ke andar rakhna taaki woh network cross karke chuni hui endpoint tak pahunch sakein. Socho ek sealed courier bag delivery van ke andar ja raha hai.</dd>
<dt>DNS</dt><dd>Internet ki phone book. Yeh news.example jaise naam ko IP address mein badalta hai. Bahut saare security decisions naam ya uski category se shuru hote hain.</dd>
<dt>TLS</dt><dd>HTTPS mein use hone wali encryption. Server apna certificate dikhakar prove karta hai ki woh kaun hai, phir dono side conversation encrypt karte hain. Encryption privacy deti hai lekin firewall se content bhi chhupa deti hai. Chapter 3 aur module zs-sec isko phir uthayenge.</dd>
</dl>

<h3>Purana design: sab kuch head office wapas le jao</h3>
<p>Sahyadri Logistics ke paas Pune HQ, Chennai branch aur Jaipur branch hai. Purane design mein har branch apna poora internet traffic private link se Pune bhejta tha. Pune server room ka ek firewall aur ek proxy use inspect karta tha, phir internet par chhodta tha. Yeh tab tak chala jab tak applications Pune server room mein the.</p>
<p>Yeh teen tarah se toot-ta hai. Pehla, <b>applications move ho gayi</b> internet ki websites par, to Pune se ghumna sirf delay badhata hai. Doosra, <b>log move ho gaye</b>: vikram ghar se kaam karta hai aur kisi branch link par nahi hai. Teesra, <b>zyada traffic encrypted hai</b>, aur purana box sab kuch kholne ki capacity nahi rakhta tha.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Backhaul versus cloud security">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">Purana: HQ tak backhaul</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">Jaipur PC</text>
<rect x="110" y="110" width="80" height="40" rx="8" fill="#fde68a"/><text x="150" y="135" text-anchor="middle" class="svg-ink" font-size="12">Pune FW</text>
<rect x="210" y="40" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="250" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<line x1="70" y1="80" x2="125" y2="110" stroke="#64748b" stroke-width="2"/><line x1="175" y1="110" x2="235" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="150" y="185" text-anchor="middle" class="svg-muted" font-size="12">lamba detour, ek box, ghar ke users nahi</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Naya: cloud mein security</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="12">Jaipur PC</text>
<rect x="440" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="485" y="65" text-anchor="middle" class="svg-ink" font-size="12">Cloud security</text>
<rect x="550" y="40" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="585" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="340" y="110" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">vikram home</text>
<line x1="420" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="550" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="460" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">chhota path, ek rule book, sab covered</text>
</svg><p class="cap">Checkpoint Pune server room se hatkar har user ke paas cloud edge par aa gaya.</p></div>

<div class="eg"><p><b>Worked example.</b> Jaipur ka ek user software-as-a-service site kholta hai. Direct round trip lagbhag 25 ms hai. Backhaul mein Jaipur se Pune 45 ms aur Pune se site 25 ms jodta hai: har request ke liye 70 ms, aur ek page darjano requests karta hai. Paas ke cloud node ke saath path direct time ke kareeb rehta hai, bas inspection ke kuch milliseconds extra. Yeh numbers examples hain; aapke circuits par depend karte hain.</p></div>

<h3>Sahyadri ka naya design</h3>
<p>Har location cloud service tak traffic <b>forward</b> karne ka ek tareeka chunta hai: Pune IPsec tunnel use karta hai, Chennai GRE tunnel, Jaipur PAC file (explicit proxy setting) aur vikram apne laptop par ek client program. Module zs-fwd yeh chaaron sikhata hai. Policy ab Pune firewall mein nahi rehti; woh ek admin portal mein rehti hai aur sabpar lagti hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Site ko backhaul se cloud security par le jaane se uske web traffic ke nikalne ki jagah badal jaati hai. Pehle woh Pune firewall se nikalta tha, jo use log karta tha. Baad mein woh cloud node se nikalta hai, aur Pune firewall sirf ek tunnel dekhta hai. Agar aap kisi site ko forward karna bhool gaye, to uska traffic <b>direct</b> jaata hai: koi policy nahi, koi inspection nahi aur koi logs nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh sochna ki cloud security ka matlab hai "site par firewall nahi"; edge firewall abhi bhi hai aur decide karta hai ki kya bahar ja sakta hai. (2) Yeh maanna ki cloud service woh traffic dekhti hai jo kabhi usko forward hi nahi hua. (3) Proxy (ek application protocol ke liye beech ka aadmi) aur tunnel (kisi bhi packets ka carrier) ko mix kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kya cloud security se firewall ki zaroorat khatam ho jaati hai?" Nahi. Site ka device LAN ko protect karta rehta hai; cloud security internet aur private-application access ke liye ek shared checkpoint jodti hai.</p></div>

<div class="scn"><h4>Jaipur ka page jo das second leta tha</h4><p>Jaipur Sales ne shikayat ki ki quotation website har dopahar slow hoti hai. Engineer ne dekha ki saara branch traffic Pune link se guzar raha tha, jo backups ki wajah se busy tha. Jaipur ko cloud service par le jaane se web traffic us link se hat gaya. Wahi page ab do second se kam mein khulta tha, aur Pune link ERP ke liye free ho gaya.</p><p><b>Seekh:</b> backhaul ek busy link ko sabka bottleneck bana deta hai.</p></div>

<div class="iv"><p class="q">"Companies data-centre firewalls se cloud security par kyun ja rahi hain?"</p><p>Strong answer: applications aur users ab data centre ke bahar hain, to traffic backhaul karne se latency aur cost badhti hai aur ghar ke users chhoot jaate hain. Cloud service checkpoint ko user ke paas rakhti hai aur saari locations ke liye ek policy deti hai. Encryption mention karo: zyada traffic TLS hai, to inspection capacity matter karti hai. Yeh bhi jodo ki har site par edge firewall abhi bhi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Proxy beech ka aadmi hai; tunnel carrier hai; DNS names ko IPs se map karta hai; TLS HTTPS ko encrypt karta hai.</li>
<li>Backhaul saara branch traffic head office bhejta hai, jisse delay badhta hai aur remote users chhoot jaate hain.</li>
<li>Cloud security har user ke paas ek shared checkpoint rakhti hai, ek policy ke saath.</li>
<li>Sahyadri Pune ko IPsec, Chennai ko GRE, Jaipur ko PAC aur vikram ko client connector se forward karta hai.</li>
<li>Jo traffic forward nahi hota woh direct jaata hai aur bilkul unprotected hota hai.</li>
</ul></div>
`}};export{e as default};