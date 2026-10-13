var e={id:`source-nat-and-pat`,h:{en:`Static source NAT and dynamic source NAT (PAT)`,hi:`Static source NAT aur dynamic source NAT (PAT)`},body:{en:`
<p>In the last chapter you met the parts of a NAT rule. Now we use them for the most common job in every branch office: letting private hosts reach the Internet. This is the heart of lab fp-nat-1, Internet access with dynamic NAT.</p>

<h3>Analogy: one courier address for the whole office</h3>
<p>Imagine fifty employees ordering parcels. The courier only knows the office address. The mailroom writes a small token number on each parcel request, and when the parcel returns, the token tells the mailroom which employee gets it. Dynamic NAT works the same way: one public address, many hosts, and the <b>port number</b> is the token.</p>

<h3>Two flavours of source NAT</h3>
<table class="cmp"><tr><th></th><th>Dynamic (PAT)</th><th>Static</th></tr>
<tr><td>Mapping</td><td>Many private hosts to one address</td><td>One private host to one public address (1:1)</td></tr>
<tr><td>What differs per host</td><td>The source port chosen by the engine</td><td>Nothing; the port stays the same</td></tr>
<tr><td>Typical use</td><td>Staff browsing the Internet</td><td>A server that must always appear from the same public address</td></tr>
<tr><td>Who can start connections</td><td>Inside hosts only</td><td>Outbound by the host; inbound only with a matching Access rule and the right destination NAT</td></tr>
</table>
<p><b>PAT</b> means Port Address Translation: the translated address is shared, and ports make each connection unique. Dynamic is the mode that does PAT in this console.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Dynamic NAT port table">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="46" text-anchor="middle" class="svg-ink" font-size="13">Host A 10.1.1.10</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">port 40001</text>
<rect x="10" y="120" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="146" text-anchor="middle" class="svg-ink" font-size="13">Host B 10.1.1.11</text><text x="95" y="166" text-anchor="middle" class="svg-muted" font-size="12">port 40001</text>
<rect x="240" y="60" width="160" height="90" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">Engine</text><text x="320" y="114" text-anchor="middle" class="svg-accent" font-size="12">tracks each</text><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">connection</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="46" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2 : 50001</text><text x="545" y="66" text-anchor="middle" class="svg-muted" font-size="12">for Host A</text>
<rect x="460" y="120" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="146" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2 : 50002</text><text x="545" y="166" text-anchor="middle" class="svg-muted" font-size="12">for Host B</text>
<line x1="180" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><line x1="180" y1="150" x2="240" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="90" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="120" x2="460" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two hosts use the same source port; the engine gives each connection its own translated port. The port numbers in the picture are examples.</p></div>

<h3>What address do we translate to?</h3>
<p>In the translated address field you can choose an element (a host element holding a public address) or <b>interface-ip</b>, which means the address of the engine interface the traffic leaves from. For Pune, the WAN interface eth1 has 203.0.113.2/30, so a staff connection leaving eth1 gets 203.0.113.2 as source. Using interface-ip is the simplest choice when the ISP gave you one address and it is already on the interface. If the ISP routes extra addresses to you, you can use a separate host element instead; the lab text tells you which to use.</p>

<div class="eg"><p><b>Worked example (fp-nat-1).</b> Goal: Staff reach the Internet. Access rule: source net-staff, destination any, service HTTP and HTTPS and DNS (UDP), action allow. NAT rule: source net-staff, destination any, service any, type src, mode dynamic, translated address interface-ip. Then Install policy. STAFF-PC 10.1.1.10 opens a website: the ISP sees 203.0.113.2 as the source. The reply comes back to 203.0.113.2 and the engine uses its tracking entry to hand it to 10.1.1.10. Check the Logs page: the entry shows the connection allowed by your Access rule and the translation.</p></div>

<h3>Order of work for the lab</h3>
<ol>
<li>Confirm the default route on the engine points to the ISP gateway 203.0.113.1.</li>
<li>Write the Access rule first; without it nothing reaches NAT.</li>
<li>Add the dynamic NAT rule from net-staff to any, type src, translated interface-ip.</li>
<li>Use the Install policy bar. The lab passes only after Install.</li>
<li>Test from STAFF-PC and read the Logs page.</li>
</ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">NAT rule 2: Source net-staff | Destination any | Service any</span>
<span class="c">  NAT type: source, dynamic | Translated: interface-ip</span></pre>
<p>That block shows the shape of the rule only; in the console you fill the fields in the NAT rules editor. For exact field names in a real SMC, check the documentation for your NGFW version.</p>

<div class="warn"><p><b>Common mistake.</b> Writing the NAT rule but forgetting the Access rule (or the other way round). With the NAT rule only, the first packet is discarded. With the Access rule only, packets leave with 10.1.1.10 and the ISP drops them, or they are sent and no reply ever finds its way back.</p></div>

<div class="exam"><p><b>Exam trap.</b> Thinking dynamic NAT uses a pool of addresses one per host. Here, dynamic means many hosts share one address and ports separate them. Static is the 1:1 mode. Also remember that the translated address must be routable, which chapter 4 explains.</p></div>

<div class="scn"><h4>Half the branch cannot browse</h4><p>After the Pune go-live, Staff on 10.1.1.0/24 browsed normally but a new Guest network 10.1.9.0/24 had no Internet. The NAT rule had source net-staff only. The engineer created a net-guest element, added it to a second dynamic rule, added the matching Access rule, and used Install policy. Guests could browse straight away.</p><p><b>Lesson:</b> the Source field is a filter. A network that is not in the Source of any NAT rule leaves with its private address.</p></div>

<div class="iv"><p class="q">"How can a hundred hosts share one public IP address?"</p><p>Strong answer: with port address translation. The engine keeps a connection table that maps each inside address and port to the shared public address and a unique port. Replies are matched against this table. Mention that it needs stateful tracking and that static NAT is the 1:1 alternative for servers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic source NAT is PAT: many hosts share one address; ports make connections unique.</li>
<li>Static source NAT is 1:1 and keeps the port.</li>
<li>interface-ip translates to the address of the outgoing interface.</li>
<li>You need an Access rule and a NAT rule; each does a different job.</li>
<li>The Source field decides which networks get translated.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter mein aapne NAT rule ke parts dekhe. Ab hum unhe har branch office ke sabse common kaam ke liye use karte hain: private hosts ko Internet tak pahunchana. Yeh lab fp-nat-1, Internet access with dynamic NAT, ka dil hai.</p>

<h3>Analogy: poore office ke liye ek courier address</h3>
<p>Maan lo pachaas employees parcel order karte hain. Courier sirf office ka address jaanta hai. Mailroom har parcel request par chhota token number likhta hai, aur parcel wapas aane par token batata hai ki kis employee ko dena hai. Dynamic NAT bhi aise hi kaam karta hai: ek public address, kai hosts, aur <b>port number</b> hi token hai.</p>

<h3>Source NAT ke do flavour</h3>
<table class="cmp"><tr><th></th><th>Dynamic (PAT)</th><th>Static</th></tr>
<tr><td>Mapping</td><td>Kai private hosts se ek address</td><td>Ek private host se ek public address (1:1)</td></tr>
<tr><td>Har host mein kya alag</td><td>Engine ka chuna hua source port</td><td>Kuch nahi; port wahi rehta hai</td></tr>
<tr><td>Typical use</td><td>Staff ka Internet browsing</td><td>Aisa server jo hamesha ek hi public address se dikhna chahiye</td></tr>
<tr><td>Connections kaun shuru kare</td><td>Sirf inside hosts</td><td>Host outbound shuru karta hai; inbound sirf matching Access rule aur sahi destination NAT ke saath</td></tr>
</table>
<p><b>PAT</b> ka matlab Port Address Translation: translated address shared hota hai, aur ports har connection ko unique banate hain. Is console mein dynamic mode PAT karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Dynamic NAT port table">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="46" text-anchor="middle" class="svg-ink" font-size="13">Host A 10.1.1.10</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">port 40001</text>
<rect x="10" y="120" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="146" text-anchor="middle" class="svg-ink" font-size="13">Host B 10.1.1.11</text><text x="95" y="166" text-anchor="middle" class="svg-muted" font-size="12">port 40001</text>
<rect x="240" y="60" width="160" height="90" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">Engine</text><text x="320" y="114" text-anchor="middle" class="svg-accent" font-size="12">har connection</text><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">track karta hai</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="46" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2 : 50001</text><text x="545" y="66" text-anchor="middle" class="svg-muted" font-size="12">Host A ke liye</text>
<rect x="460" y="120" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="146" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2 : 50002</text><text x="545" y="166" text-anchor="middle" class="svg-muted" font-size="12">Host B ke liye</text>
<line x1="180" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><line x1="180" y1="150" x2="240" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="90" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="120" x2="460" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do hosts same source port use karte hain; engine har connection ko alag translated port deta hai. Picture ke port numbers examples hain.</p></div>

<h3>Kis address mein translate karein?</h3>
<p>Translated address field mein aap ek element (jisme public address ho wala host element) ya <b>interface-ip</b> chun sakte ho, jiska matlab hai us engine interface ka address jahan se traffic nikalta hai. Pune mein WAN interface eth1 ka address 203.0.113.2/30 hai, isliye eth1 se nikalne wale staff connection ka source 203.0.113.2 ban jaata hai. Jab ISP ne ek hi address diya ho aur woh interface par pehle se ho, interface-ip sabse simple choice hai. Agar ISP extra addresses aapko route karta hai to alag host element use kar sakte ho; lab text batata hai kaunsa use karna hai.</p>

<div class="eg"><p><b>Worked example (fp-nat-1).</b> Goal: Staff Internet tak pahunche. Access rule: source net-staff, destination any, service HTTP, HTTPS aur DNS (UDP), action allow. NAT rule: source net-staff, destination any, service any, type src, mode dynamic, translated address interface-ip. Phir Install policy. STAFF-PC 10.1.1.10 website kholta hai: ISP ko source 203.0.113.2 dikhta hai. Reply 203.0.113.2 par aata hai aur engine apni tracking entry se use 10.1.1.10 ko deta hai. Logs page dekho: entry mein aapke Access rule se allowed connection aur translation dikhte hain.</p></div>

<h3>Lab ke liye kaam ka order</h3>
<ol>
<li>Confirm karo ki engine ka default route ISP gateway 203.0.113.1 ki taraf hai.</li>
<li>Pehle Access rule likho; uske bina kuch NAT tak nahi pahunchta.</li>
<li>net-staff se any tak dynamic NAT rule add karo, type src, translated interface-ip.</li>
<li>Install policy bar use karo. Lab Install ke baad hi pass hota hai.</li>
<li>STAFF-PC se test karo aur Logs page padho.</li>
</ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">NAT rule 2: Source net-staff | Destination any | Service any</span>
<span class="c">  NAT type: source, dynamic | Translated: interface-ip</span></pre>
<p>Yeh block sirf rule ka shape dikhata hai; console mein aap NAT rules editor ke fields bharte ho. Real SMC ke exact field names ke liye apne NGFW version ki documentation check karo.</p>

<div class="warn"><p><b>Common mistake.</b> NAT rule likhna par Access rule bhool jaana (ya ulta). Sirf NAT rule ho to pehla packet discard ho jaata hai. Sirf Access rule ho to packet 10.1.1.10 ke saath nikalta hai aur ISP use drop kar deta hai, ya bhej diya jaata hai par reply ka raasta kabhi nahi milta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Yeh sochna ki dynamic NAT har host ke liye alag address ka pool use karta hai. Yahan dynamic ka matlab hai kai hosts ek address share karte hain aur ports unhe alag karte hain. Static 1:1 mode hai. Yaad rakho ki translated address routable hona chahiye, jo chapter 4 samjhata hai.</p></div>

<div class="scn"><h4>Aadhi branch browse nahi kar paa rahi</h4><p>Pune go-live ke baad 10.1.1.0/24 ka Staff normal browse kar raha tha lekin naye Guest network 10.1.9.0/24 ko Internet nahi mil raha tha. NAT rule mein source sirf net-staff tha. Engineer ne net-guest element banaya, doosre dynamic rule mein add kiya, matching Access rule add kiya, aur Install policy kiya. Guests turant browse karne lage.</p><p><b>Lesson:</b> Source field ek filter hai. Jo network kisi NAT rule ke Source mein nahi, woh apne private address ke saath nikalta hai.</p></div>

<div class="iv"><p class="q">"Sau hosts ek public IP address kaise share kar sakte hain?"</p><p>Strong answer: port address translation se. Engine connection table rakhta hai jo har inside address aur port ko shared public address aur unique port se map karta hai. Replies is table se match hote hain. Mention karo ki stateful tracking chahiye aur servers ke liye static NAT 1:1 alternative hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic source NAT PAT hai: kai hosts ek address share karte hain; ports connections ko unique banate hain.</li>
<li>Static source NAT 1:1 hai aur port same rakhta hai.</li>
<li>interface-ip outgoing interface ke address mein translate karta hai.</li>
<li>Access rule aur NAT rule dono chahiye; dono alag kaam karte hain.</li>
<li>Source field decide karta hai kaunse networks translate honge.</li>
</ul></div>
`}};export{e as default};