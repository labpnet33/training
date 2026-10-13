var e={id:`why-nat-firewall`,h:{en:`Why NAT on a firewall: the big picture`,hi:`Firewall par NAT kyun: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to explain how the Cisco ASA translates addresses since software 8.3, tell <b>auto NAT</b> (object NAT) from <b>manual NAT</b> (twice NAT), and predict which rule wins using the <b>three NAT sections</b>. You will configure dynamic PAT for users, <b>static NAT</b> to publish a whole server, <b>static PAT</b> (port forwarding) on the outside interface address, <b>identity NAT</b> to exempt VPN traffic, and twice NAT that translates source and destination together. You will read <code>show nat detail</code>, <code>show xlate</code>, <code>show conn</code> and the NAT phases of <code>packet-tracer</code>, apply the <b>real-IP rule</b> when you write ACLs, and fix the classic faults. The same NAT engine runs inside Secure Firewall Threat Defense, so everything here carries over to the Threat Defense modules and to the NAT items of the CCNP Security SCOR and SNCF blueprints.</p>
<p><b>Prerequisites.</b> From the <b>sec-asa-basics</b> module you need interfaces, <code>nameif</code>, security levels, the default route and the simple interface PAT that gets users online. From <b>sec-asa-acl</b> you need network objects, <code>access-group</code> and a first look at the real-IP rule. From CCNA NAT (ccna-nat) you should know inside local and inside global. We build on all three and do not re-teach them.</p>

<h3>An analogy: the hotel front desk</h3>
<p>Think of a large hotel. Guests live in rooms with internal numbers, such as room 1042, that mean nothing outside the building. When a guest orders a taxi, the front desk phones the taxi company from the hotel's <b>main number</b> and notes in a register "the taxi for room 1042". When the taxi calls back, the desk looks at the register and connects the right room. That is <b>dynamic PAT</b>: many rooms share one public number, and the register is temporary.</p>
<p>The hotel restaurant is different. It has its <b>own listed phone number</b> in the city directory, and anyone can call it at any time without a guest calling first. That is <b>static NAT</b>: a permanent public identity for one internal server. And the spa, which has no number of its own, is reached by dialling the main number and pressing extension 22. That is <b>static PAT</b>, better known as <b>port forwarding</b>.</p>
<p>Finally, the security guard at the door (the access list) always checks the guest's <b>real room number</b>, never the public phone number. Keep that picture; it is the real-IP rule you will meet in every chapter.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab topology">
<rect x="250" y="100" width="140" height="60" rx="8" fill="#fed7aa"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA (ASA1)</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">NAT + ACL</text>
<rect x="20" y="40" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="95" y="78" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24 PC1</text>
<rect x="20" y="180" width="150" height="48" rx="8" fill="#ddd6fe"/><text x="95" y="200" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="95" y="218" text-anchor="middle" class="svg-muted" font-size="12">WEB .10  JUMP .20</text>
<rect x="470" y="100" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="13">ISP 203.0.113.1</text><text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">INET, PARTNER</text>
<line x1="170" y1="64" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="204" x2="250" y2="148" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="430" y="120" text-anchor="middle" class="svg-accent" font-size="12">outside (0)</text>
<text x="430" y="152" text-anchor="middle" class="svg-muted" font-size="12">.2 /29</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.0/29 public block</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">.1 ISP  .2 ASA  .3 WEB  .4-.6 free</text>
<text x="320" y="262" text-anchor="middle" class="svg-ink" font-size="12">INET 8.8.8.8 and PARTNER 198.51.100.10 sit behind the ISP</text>
</svg><p class="cap">The lab topology used in every chapter and every lab of this module.</p></div>

<h3>Why a firewall does NAT at all</h3>
<p>On a router, NAT is mostly about saving IPv4 addresses. On a firewall it does four jobs at once:</p>
<ul>
<li><b>Address conservation.</b> Hundreds of users in 10.0.1.0/24 share the outside address 203.0.113.2 with dynamic PAT.</li>
<li><b>Publishing services.</b> The web server 10.0.2.10 in the DMZ must answer on a public address, 203.0.113.3. Only a static translation lets the internet start a connection toward it.</li>
<li><b>Hiding topology.</b> Outsiders never see the internal numbering plan, which makes reconnaissance a little harder. This is a side effect, not a security control; the ACL and stateful inspection are what actually protect you.</li>
<li><b>Joining networks that should not meet.</b> Partners, mergers and VPNs often bring overlapping addresses. Twice NAT can translate both sides of a flow so that two 10.0.1.0/24 networks can talk.</li>
</ul>
<p>The firewall is the natural place for all of this because it already sits at the boundary, already tracks every connection in a state table, and already knows which interface is trusted.</p>

<h3>A short history that explains the exam</h3>
<p>Before software 8.3 the ASA used PIX-style commands (<code>static</code>, <code>global</code>, <code>nat 0</code>) and ACLs were written with <b>mapped</b> (public) addresses. Version 8.3 rebuilt NAT around <b>network objects</b>, introduced auto NAT and twice NAT, and changed ACLs to match <b>real</b> addresses. Every modern ASA and Threat Defense device uses the 8.3+ model. Many tickets still come from old configurations that were migrated by hand, which is exactly the ticket lab you will solve in chapter 11.</p>

<h3>The three labs you will complete</h3>
<table class="cmp"><tr><th>Lab</th><th>What you build</th><th>Chapter</th></tr>
<tr><td>Publish the web server with static NAT</td><td>WEB 10.0.2.10 as 203.0.113.3, HTTP and HTTPS only</td><td>5</td></tr>
<tr><td>Port forwarding on the interface address</td><td>JUMP 10.0.2.20 SSH as 203.0.113.2 port 2222, partner only</td><td>6</td></tr>
<tr><td>Ticket: the migrated rule uses the public IP</td><td>Prove with packet-tracer why the ACL never matches, fix it</td><td>11</td></tr></table>

<pre class="code"><span class="c">! Starting point in every lab (from sec-asa-basics)</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>

<div class="eg"><p><b>Worked example.</b> The ISP gave a /29: 203.0.113.0 to 203.0.113.7. The network address .0 and broadcast .7 are unusable, the ISP router takes .1 and the ASA outside interface takes .2. That leaves .3, .4, .5 and .6: four addresses for static NAT. Anything more must share an address with static PAT, which is why port forwarding matters so much for small sites.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing NAT is a firewall. A static NAT alone lets nothing in; an ACL alone cannot reach a private server that has no public address. Publishing always needs <b>both</b>: the translation and a permit for the real address.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which ASA version changed ACLs to use real IP addresses?" The answer is 8.3. Answers mentioning <code>nat-control</code> or <code>static (dmz,outside)</code> describe the old PIX-style syntax that no longer exists.</p></div>

<div class="scn"><h4>The website that NAT alone could not publish</h4><p>A junior engineer was asked to publish a new portal. He added a static NAT for the server, checked <code>show nat</code>, saw the rule, and closed the ticket. Customers still got timeouts. The senior engineer ran <code>packet-tracer</code>: the UN-NAT phase succeeded, but the ACCESS-LIST phase dropped the packet on the Implicit Rule because the outside interface had no permit for the server. One ACL line with the real address fixed it.</p><p><b>Lesson:</b> translation and permission are two separate decisions. Always check both.</p></div>

<div class="iv"><p class="q">"Why do we still need NAT on a firewall if it is not a security feature?"</p><p>A strong candidate lists the four jobs: conserving IPv4 with PAT, publishing servers with static NAT or port forwarding, joining overlapping networks with twice NAT, and exempting VPN traffic with identity NAT. Then add that security comes from the ACL and stateful inspection; topology hiding is only a side effect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic PAT lets many users share one address; static NAT gives a server a permanent public identity; static PAT shares one address by port.</li>
<li>NAT and the ACL are separate decisions: publishing needs a translation and a permit.</li>
<li>ASA 8.3 introduced object-based NAT, twice NAT and real-IP ACLs; Threat Defense uses the same engine.</li>
<li>The lab: inside 10.0.1.0/24, dmz 10.0.2.0/24, outside 203.0.113.2 in a /29 with .3 to .6 free.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In baarah chapters ke end tak aap samjha paoge ki Cisco ASA software 8.3 se addresses kaise translate karta hai, <b>auto NAT</b> (object NAT) aur <b>manual NAT</b> (twice NAT) ka fark bata paoge, aur <b>teen NAT sections</b> se predict kar paoge ki kaunsi rule jeetegi. Aap users ke liye dynamic PAT, poora server publish karne ke liye <b>static NAT</b>, outside interface address par <b>static PAT</b> (port forwarding), VPN traffic exempt karne ke liye <b>identity NAT</b>, aur source aur destination dono saath translate karne wala twice NAT configure karoge. Aap <code>show nat detail</code>, <code>show xlate</code>, <code>show conn</code> aur <code>packet-tracer</code> ke NAT phases padhoge, ACLs likhte waqt <b>real-IP rule</b> apply karoge, aur classic faults theek karoge. Yahi NAT engine Secure Firewall Threat Defense ke andar bhi chalta hai, isliye yahan ka sab kuch Threat Defense modules aur CCNP Security SCOR aur SNCF blueprints ke NAT items par bhi laagu hota hai.</p>
<p><b>Prerequisites.</b> <b>sec-asa-basics</b> module se aapko interfaces, <code>nameif</code>, security levels, default route aur woh simple interface PAT chahiye jo users ko online laata hai. <b>sec-asa-acl</b> se network objects, <code>access-group</code> aur real-IP rule ki pehli jhalak chahiye. CCNA NAT (ccna-nat) se aapko inside local aur inside global pata hona chahiye. Hum teeno par build karte hain aur unhe dobara nahi padhate.</p>

<h3>Ek analogy: hotel ka front desk</h3>
<p>Ek bade hotel ke baare mein socho. Guests internal numbers wale rooms mein rehte hain, jaise room 1042, jinka building ke bahar koi matlab nahi. Jab guest taxi mangwata hai, front desk hotel ke <b>main number</b> se taxi company ko phone karta hai aur register mein likhta hai "room 1042 ke liye taxi". Jab taxi wapas call karti hai, desk register dekhkar sahi room connect karta hai. Yahi <b>dynamic PAT</b> hai: bahut saare rooms ek public number share karte hain, aur register temporary hai.</p>
<p>Hotel ka restaurant alag hai. Uska city directory mein <b>apna listed phone number</b> hai, aur koi bhi kabhi bhi use call kar sakta hai bina kisi guest ke pehle call kiye. Yahi <b>static NAT</b> hai: ek internal server ki permanent public pehchaan. Aur spa, jiska apna number nahi, main number dial karke extension 22 dabane se milta hai. Yahi <b>static PAT</b> hai, jise <b>port forwarding</b> ke naam se jaana jaata hai.</p>
<p>Aakhir mein, darwaze par security guard (access list) hamesha guest ka <b>asli room number</b> check karta hai, public phone number kabhi nahi. Yeh picture yaad rakho; yahi real-IP rule hai jo aapko har chapter mein milega.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab topology">
<rect x="250" y="100" width="140" height="60" rx="8" fill="#fed7aa"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA (ASA1)</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">NAT + ACL</text>
<rect x="20" y="40" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="95" y="78" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24 PC1</text>
<rect x="20" y="180" width="150" height="48" rx="8" fill="#ddd6fe"/><text x="95" y="200" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="95" y="218" text-anchor="middle" class="svg-muted" font-size="12">WEB .10  JUMP .20</text>
<rect x="470" y="100" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="13">ISP 203.0.113.1</text><text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">INET, PARTNER</text>
<line x1="170" y1="64" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="204" x2="250" y2="148" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="430" y="120" text-anchor="middle" class="svg-accent" font-size="12">outside (0)</text>
<text x="430" y="152" text-anchor="middle" class="svg-muted" font-size="12">.2 /29</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.0/29 public block</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">.1 ISP  .2 ASA  .3 WEB  .4-.6 khaali</text>
<text x="320" y="262" text-anchor="middle" class="svg-ink" font-size="12">INET 8.8.8.8 aur PARTNER 198.51.100.10 ISP ke peeche hain</text>
</svg><p class="cap">Is module ke har chapter aur har lab mein use hone wali lab topology.</p></div>

<h3>Firewall NAT karta hi kyun hai</h3>
<p>Router par NAT zyada tar IPv4 addresses bachane ke liye hota hai. Firewall par yeh ek saath chaar kaam karta hai:</p>
<ul>
<li><b>Address conservation.</b> 10.0.1.0/24 ke saikdon users dynamic PAT se outside address 203.0.113.2 share karte hain.</li>
<li><b>Services publish karna.</b> DMZ ka web server 10.0.2.10 ek public address, 203.0.113.3, par jawab de. Sirf static translation hi internet ko uski taraf connection shuru karne deti hai.</li>
<li><b>Topology chhupana.</b> Bahar wale kabhi internal numbering plan nahi dekhte, jisse reconnaissance thoda mushkil hota hai. Yeh side effect hai, security control nahi; asal mein aapko ACL aur stateful inspection bachate hain.</li>
<li><b>Un networks ko jodna jo milne nahi chahiye.</b> Partners, mergers aur VPNs aksar overlapping addresses laate hain. Twice NAT flow ke dono sides translate kar sakta hai taaki do 10.0.1.0/24 networks baat kar sakein.</li>
</ul>
<p>Firewall in sab ke liye natural jagah hai kyunki woh pehle se boundary par baitha hai, pehle se har connection ko state table mein track karta hai, aur pehle se jaanta hai ki kaunsa interface trusted hai.</p>

<h3>Chhota sa history jo exam samjhata hai</h3>
<p>Software 8.3 se pehle ASA PIX-style commands (<code>static</code>, <code>global</code>, <code>nat 0</code>) use karta tha aur ACLs <b>mapped</b> (public) addresses ke saath likhi jaati thi. Version 8.3 ne NAT ko <b>network objects</b> ke around dobara banaya, auto NAT aur twice NAT laaya, aur ACLs ko <b>real</b> addresses match karne ke liye badla. Har modern ASA aur Threat Defense device 8.3+ model use karta hai. Bahut saare tickets ab bhi haath se migrate kiye gaye purane configurations se aate hain, aur bilkul yahi ticket lab aap chapter 11 mein solve karoge.</p>

<h3>Teen labs jo aap complete karoge</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya banaoge</th><th>Chapter</th></tr>
<tr><td>Static NAT se web server publish karo</td><td>WEB 10.0.2.10 ko 203.0.113.3 ki tarah, sirf HTTP aur HTTPS</td><td>5</td></tr>
<tr><td>Interface address par port forwarding</td><td>JUMP 10.0.2.20 ka SSH 203.0.113.2 port 2222 par, sirf partner ke liye</td><td>6</td></tr>
<tr><td>Ticket: migrate hui rule public IP use karti hai</td><td>packet-tracer se saabit karo ki ACL kabhi match kyun nahi karti, theek karo</td><td>11</td></tr></table>

<pre class="code"><span class="c">! Har lab ka starting point (sec-asa-basics se)</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>

<div class="eg"><p><b>Worked example.</b> ISP ne ek /29 diya: 203.0.113.0 se 203.0.113.7. Network address .0 aur broadcast .7 use nahi ho sakte, ISP router .1 leta hai aur ASA outside interface .2 leta hai. Bache .3, .4, .5 aur .6: static NAT ke liye chaar addresses. Isse zyada ho to address ko static PAT se share karna padega, isliye chhoti sites ke liye port forwarding itna important hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki NAT firewall hai. Akela static NAT kuch bhi andar nahi aane deta; akeli ACL us private server tak nahi pahunch sakti jiska koi public address nahi. Publish karne ke liye hamesha <b>dono</b> chahiye: translation aur real address ke liye permit.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kis ASA version ne ACLs ko real IP addresses use karne ke liye badla?" Jawab 8.3 hai. <code>nat-control</code> ya <code>static (dmz,outside)</code> wale answers purane PIX-style syntax ki baat karte hain jo ab exist nahi karta.</p></div>

<div class="scn"><h4>Woh website jise akela NAT publish nahi kar paaya</h4><p>Ek junior engineer ko naya portal publish karne ko kaha gaya. Usne server ke liye static NAT add kiya, <code>show nat</code> check kiya, rule dekhi, aur ticket band kar diya. Customers ko ab bhi timeouts mile. Senior engineer ne <code>packet-tracer</code> chalaya: UN-NAT phase succeed hua, lekin ACCESS-LIST phase ne packet Implicit Rule par drop kiya kyunki outside interface par server ke liye koi permit nahi tha. Real address wali ek ACL line ne ise theek kar diya.</p><p><b>Seekh:</b> translation aur permission do alag decisions hain. Hamesha dono check karo.</p></div>

<div class="iv"><p class="q">"Agar NAT security feature nahi hai to firewall par hume NAT ki zaroorat kyun hai?"</p><p>Strong candidate chaar kaam list karta hai: PAT se IPv4 bachana, static NAT ya port forwarding se servers publish karna, twice NAT se overlapping networks jodna, aur identity NAT se VPN traffic exempt karna. Phir jodo ki security ACL aur stateful inspection se aati hai; topology chhupana sirf side effect hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic PAT bahut users ko ek address share karne deta hai; static NAT server ko permanent public pehchaan deta hai; static PAT ek address ko port se share karta hai.</li>
<li>NAT aur ACL alag decisions hain: publish karne ke liye translation aur permit dono chahiye.</li>
<li>ASA 8.3 ne object-based NAT, twice NAT aur real-IP ACLs introduce kiye; Threat Defense wahi engine use karta hai.</li>
<li>Lab: inside 10.0.1.0/24, dmz 10.0.2.0/24, outside 203.0.113.2 ek /29 mein, jahan .3 se .6 khaali hain.</li>
</ul></div>
`}};export{e as default};