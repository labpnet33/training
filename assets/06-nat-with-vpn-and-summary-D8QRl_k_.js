var e={id:`nat-with-vpn-and-summary`,h:{en:`NAT with VPN, summary and exam checklist`,hi:`NAT ke saath VPN, summary aur exam checklist`},body:{en:`
<p>The last topic joins NAT with VPN, which you will build in the VPN module. Here we only need the one rule that causes the most "tunnel is up but nothing works" tickets.</p>

<h3>Analogy: the sealed courier bag</h3>
<p>A company sends documents to its head office in a sealed bag, but only documents with the right sender code go in the bag. If the mailroom first changes the sender code on the document to the shop public code, the sorter no longer recognises it as bag material and sends it by ordinary post. The tunnel is a sealed bag; NAT changing the source is the mailroom changing the code.</p>

<h3>What happens</h3>
<p>The VPN here is policy-based. Traffic enters the tunnel only when the Access rule has VPN set to apply or enforce, the source is in the local protected networks, and the destination is in the remote protected networks. NAT is applied <b>before</b> encapsulation. If dynamic NAT changes the source from 10.1.1.10 to the WAN address first, the source is no longer in the protected network list, so the traffic does not match the tunnel and goes out to the Internet unprotected (and the far end never sees it).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NAT before VPN">
<rect x="10" y="20" width="290" height="70" rx="8" fill="#fed7aa"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">Without exception</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 becomes 203.0.113.2, misses tunnel</text>
<rect x="340" y="20" width="290" height="70" rx="8" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">With no-NAT rule on top</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 stays, enters tunnel</text>
<rect x="10" y="120" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">NAT rule 1: src net-staff, dst remote network, type none</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">NAT rule 2: src net-staff, dst any, dynamic to interface-ip</text>
</svg><p class="cap">A no-NAT rule above the general rule keeps the original source so the traffic can match the VPN.</p></div>

<h3>The fix: a no-NAT rule above</h3>
<ol>
<li>In the NAT rules editor, add a rule with source the local protected network, destination the remote protected network, NAT type none.</li>
<li>Place it above the dynamic Internet rule (first match wins).</li>
<li>Check the Access rule has VPN apply or enforce.</li>
<li>Use the Install policy bar on both engines and retest.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> HQ network 10.8.0.0/16 and Pune Staff 10.1.1.0/24 use a tunnel. Pune dynamic NAT covers net-staff to any. Staff ping HQ and get no reply. Logs show the connection leaving through eth1 as 203.0.113.2, not encapsulated. Add the no-NAT rule above, install, and the ping goes through the tunnel. The network values are examples.</p></div>

<div class="warn"><p><b>Common mistake.</b> Placing the no-NAT rule below the dynamic rule. Also forgetting that BOTH engines need the VPN installed and that the peer gateway must be reachable.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blaming the tunnel when it is up. A VPN that is up but silent is often NAT changing the source before encapsulation.</p></div>

<div class="scn"><h4>Tunnel up, ping silent</h4><p>The Pune branch tunnel showed established, yet HQ servers never answered Staff. Logs showed the traffic exiting plainly with the WAN source. The engineer added the no-NAT rule above the dynamic one, installed, and the replies arrived.</p><p><b>Lesson:</b> "up" only means the tunnel exists, not that your traffic uses it.</p></div>

<div class="iv"><p class="q">"The VPN is up but traffic does not flow. What do you check about NAT?"</p><p>Strong answer: whether source NAT changes the address before the VPN match. Add a no-NAT rule above the general rule for local to remote networks, ensure the Access rule applies VPN, and install on both sides.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>You should be able to:</b></p>
<ul>
<li>Name the parts of a NAT rule: Source, Destination, Service, NAT type, translated address.</li>
<li>Explain first match, the no-NAT exception, and that sub-policies hold no NAT rules.</li>
<li>Build dynamic source NAT to interface-ip (fp-nat-1).</li>
<li>Publish WEB1 172.16.20.20 with destination NAT and an Access rule on the public address (fp-nat-2).</li>
<li>State the order: Access on original addresses, NAT after allow, then routing.</li>
<li>Fix contact after NAT with a Location-specific contact address (fp-nat-3).</li>
<li>Add a no-NAT rule so VPN traffic keeps its source.</li>
<li>Remember every change counts only after Install policy.</li>
</ul>
<dl class="terms">
<dt>NAT</dt><dd>Rewrites addresses and ports in packets.</dd>
<dt>PAT</dt><dd>Many hosts share one address, ports separate them.</dd>
<dt>Destination NAT</dt><dd>Publishes a private server on a public address.</dd>
<dt>Contact address</dt><dd>The translated address of an SMC component.</dd>
<dt>Location</dt><dd>A group of components that reach each other without NAT.</dd>
</dl>
<p><b>Most tested facts:</b> Access rules see original addresses. NAT follows allow and precedes routing. First NAT match wins. Translated addresses must be routable. Same Location uses the control IP; otherwise Location-specific, Default, untranslated. This is independent training; check Forcepoint training pages before booking any exam.</p>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT is applied before VPN encapsulation.</li>
<li>Source NAT can make traffic miss the tunnel.</li>
<li>A no-NAT rule above the general rule keeps the original source.</li>
<li>Install on both engines.</li>
<li>Walk the order: Access, NAT, routing, install.</li>
</ul></div>
`,hi:`
<p>Aakhri topic NAT ko VPN se jodta hai, jo aap VPN module mein banaoge. Yahan hume sirf ek rule chahiye jo sabse zyada "tunnel up hai par kuch kaam nahi kar raha" tickets ki wajah hai.</p>

<h3>Analogy: sealed courier bag</h3>
<p>Ek company head office ko documents sealed bag mein bhejti hai, lekin bag mein sirf sahi sender code wale documents jaate hain. Agar mailroom pehle document ka sender code dukaan ke public code se badal de, to sorter use bag material nahi pehchanta aur normal post se bhej deta hai. Tunnel sealed bag hai; NAT jo source badalta hai woh mailroom ka code badalna hai.</p>

<h3>Kya hota hai</h3>
<p>Yahan VPN policy-based hai. Traffic tunnel mein tabhi jaata hai jab Access rule mein VPN apply ya enforce ho, source local protected networks mein ho, aur destination remote protected networks mein ho. NAT encapsulation se <b>pehle</b> lagta hai. Agar dynamic NAT source 10.1.1.10 ko pehle WAN address mein badal de, to source protected network list mein nahi rehta, isliye traffic tunnel se match nahi karta aur unprotected Internet par chala jaata hai (aur doosra end use kabhi nahi dekhta).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VPN se pehle NAT">
<rect x="10" y="20" width="290" height="70" rx="8" fill="#fed7aa"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">Exception ke bina</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 se 203.0.113.2, tunnel miss</text>
<rect x="340" y="20" width="290" height="70" rx="8" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">Upar no-NAT rule ke saath</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 rehta hai, tunnel mein jaata hai</text>
<rect x="10" y="120" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">NAT rule 1: src net-staff, dst remote network, type none</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">NAT rule 2: src net-staff, dst any, dynamic to interface-ip</text>
</svg><p class="cap">General rule ke upar no-NAT rule original source rakhta hai, taaki traffic VPN se match kar sake.</p></div>

<h3>Fix: upar no-NAT rule</h3>
<ol>
<li>NAT rules editor mein rule add karo: source local protected network, destination remote protected network, NAT type none.</li>
<li>Use dynamic Internet rule ke upar rakho (first match jeetta hai).</li>
<li>Check karo ki Access rule mein VPN apply ya enforce hai.</li>
<li>Dono engines par Install policy bar use karo aur dobara test karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> HQ network 10.8.0.0/16 aur Pune Staff 10.1.1.0/24 tunnel use karte hain. Pune ka dynamic NAT net-staff se any ko cover karta hai. Staff HQ ko ping karta hai aur reply nahi aata. Logs mein connection eth1 se 203.0.113.2 ke roop mein nikalta dikhta hai, encapsulated nahi. Upar no-NAT rule add karo, install karo, aur ping tunnel se chala jaata hai. Network values examples hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> No-NAT rule ko dynamic rule ke neeche rakhna. Aur yeh bhoolna ki DONO engines par VPN installed hona chahiye aur peer gateway reachable hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tunnel up hai phir bhi tunnel ko blame karna. VPN jo up hai par chup hai, aksar NAT encapsulation se pehle source badalne ki wajah se hota hai.</p></div>

<div class="scn"><h4>Tunnel up, ping chup</h4><p>Pune branch ka tunnel established dikha raha tha, phir bhi HQ servers ne Staff ko kabhi jawab nahi diya. Logs mein traffic WAN source ke saath plain nikalta dikha. Engineer ne dynamic rule ke upar no-NAT rule add kiya, install kiya, aur replies aane lage.</p><p><b>Lesson:</b> "up" ka matlab sirf tunnel hai, yeh nahi ki aapka traffic use use kar raha hai.</p></div>

<div class="iv"><p class="q">"VPN up hai par traffic nahi chal raha. NAT ke baare mein kya check karoge?"</p><p>Strong answer: kya source NAT VPN match se pehle address badal raha hai. Local se remote networks ke liye general rule ke upar no-NAT rule add karo, Access rule mein VPN apply ho, aur dono side install karo.</p></div>

<h3>Summary aur exam checklist</h3>
<p><b>Aap yeh kar paane chahiye:</b></p>
<ul>
<li>NAT rule ke parts batana: Source, Destination, Service, NAT type, translated address.</li>
<li>First match, no-NAT exception, aur sub-policies mein NAT rules na hona samjhana.</li>
<li>interface-ip par dynamic source NAT banana (fp-nat-1).</li>
<li>WEB1 172.16.20.20 ko destination NAT aur public address par Access rule se publish karna (fp-nat-2).</li>
<li>Order batana: original addresses par Access, allow ke baad NAT, phir routing.</li>
<li>NAT ke baad contact ko Location-specific contact address se fix karna (fp-nat-3).</li>
<li>VPN traffic ka source rakhne ke liye no-NAT rule add karna.</li>
<li>Yaad rakhna ki har change Install policy ke baad hi count hota hai.</li>
</ul>
<dl class="terms">
<dt>NAT</dt><dd>Packets mein addresses aur ports rewrite karta hai.</dd>
<dt>PAT</dt><dd>Kai hosts ek address share karte hain, ports alag karte hain.</dd>
<dt>Destination NAT</dt><dd>Private server ko public address par publish karta hai.</dd>
<dt>Contact address</dt><dd>SMC component ka translated address.</dd>
<dt>Location</dt><dd>Components ka group jo bina NAT ek doosre tak pahunchte hain.</dd>
</dl>
<p><b>Sabse zyada pooche jaane wale facts:</b> Access rules original addresses dekhte hain. NAT allow ke baad aur routing se pehle hota hai. Pehla NAT match jeetta hai. Translated addresses routable hone chahiye. Same Location control IP use karta hai; warna Location-specific, Default, untranslated. Yeh independent training hai; koi bhi exam book karne se pehle Forcepoint ke training pages check karo.</p>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT VPN encapsulation se pehle lagta hai.</li>
<li>Source NAT traffic ko tunnel miss karwa sakta hai.</li>
<li>General rule ke upar no-NAT rule original source rakhta hai.</li>
<li>Dono engines par install karo.</li>
<li>Order chalo: Access, NAT, routing, install.</li>
</ul></div>
`}};export{e as default};