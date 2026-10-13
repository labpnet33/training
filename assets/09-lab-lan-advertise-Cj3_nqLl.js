var e={id:`lab-lan-advertise`,h:{en:`Lab walkthrough: advertising the Bengaluru LAN (vs-lan-advertise)`,hi:`Lab walkthrough: Bengaluru LAN advertise karna (vs-lan-advertise)`},body:{en:`
<p>A shop cannot be found on the mall map if nobody ever painted its door number. In this lab the Bengaluru shop (Branch2) is open and connected to the mall corridors (the overlay is healthy), but its LAN interface was never configured, so the map has no entry for it. You will paint the door number and prove visitors from Delhi can find it.</p>

<h3>The situation</h3>
<p>Branch2 (Bengaluru, site-id 102) has working Internet, MPLS and LTE tunnels and an Established session to Controller-1. PC2 (10.1.2.10) cannot reach PC1 (10.1.1.10) in Delhi. The reason is not on the WAN at all.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="vs-lan-advertise topology">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="93" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.10</text>
<rect x="160" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="225" y="85" text-anchor="middle" class="svg-ink" font-size="13">Branch2</text><text x="225" y="103" text-anchor="middle" class="svg-muted" font-size="11">vni-0/3 unconfigured</text><text x="225" y="120" text-anchor="middle" class="svg-accent" font-size="11">want 10.1.2.1/24</text>
<rect x="340" y="75" width="120" height="40" rx="8" fill="#bae6fd"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="13">Controller-1</text>
<rect x="510" y="60" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="565" y="103" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.1/24</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="11">PC1 10.1.1.10</text>
<line x1="110" y1="95" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="290" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">overlay up, but no LAN prefix exists at Branch2</text>
</svg><p class="cap">The overlay is healthy; the missing piece is the LAN interface.</p></div>

<h3>Step 1: see the problem</h3>
<pre class="out">admin@Branch2-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.10/30
vni-0/1     up      up      172.31.2.2/30
vni-0/2     up      up      100.64.2.2/30
<span class="hl">vni-0/3     down    down    -</span>

admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      <span class="hl">-</span>
Branch3      103      10.1.3.0/24</pre>
<p>Two clues: the LAN port has no address and is down, and Delhi sees Branch2 as a site with <b>no LAN prefix</b>. The site exists (overlay fine), but there is nothing to route to.</p>

<h3>Step 2: configure the LAN interface</h3>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24
admin@Branch2-cli% set interfaces vni-0/3 enable true
admin@Branch2-cli% commit
Commit complete.
admin@Branch2-cli% exit</pre>
<p>Line by line: <code>set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24</code> gives the port the gateway address of the LAN (unit 0 is the logical interface, family inet means IPv4). <code>enable true</code> brings the port administratively up. <code>commit</code> applies and validates the change. Without commit nothing happens, and you can use <code>show | compare</code> before committing or <code>rollback</code> to discard.</p>
<div class="eg"><p><b>Why .1?</b> The course convention is: LAN 10.1.k.0/24 with the gateway .1 on the branch and the PC at .10. For branch 2: 10.1.2.0/24, gateway 10.1.2.1, PC2 10.1.2.10. If you typed 10.1.20.1/24 you would create a different prefix and PC2 would not match it.</p></div>

<h3>Step 3: verify that Delhi learned the prefix</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      <span class="hl">10.1.2.0/24</span>
Branch3      103      10.1.3.0/24</pre>
<p>What happened behind the scenes: the connected route 10.1.2.0/24 came into existence, Branch2 originated it to the Controller via MP-BGP, the Controller reflected it to Branch1 and Branch3, and Delhi imported it in the Acme tenant.</p>

<h3>Step 4: prove it end to end</h3>
<pre class="out">PC2&gt; ping 10.1.1.10
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=22 ms
64 bytes from 10.1.1.10: icmp_seq=2 ttl=63 time=22 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>A ping from the PC, not from the router, tests the whole path: PC gateway, overlay route, tunnel, remote LAN and the return path. Always finish with a user-side test.</p>

<h3>Think about what could still fail</h3>
<ul>
<li><b>Mask typo</b> (10.1.2.1/25): the PC at .10 still works but the advertised prefix is smaller, so other PCs in the /24 would be unreachable.</li>
<li><b>Forgot enable true</b>: the address is there but the port is down, so the connected route is not created.</li>
<li><b>Forgot commit</b>: the candidate configuration is not active.</li>
<li><b>Wrong organization or site-id</b>: the site would not appear at all (chapter 11).</li>
</ul>
<div class="warn"><p><b>Common mistakes.</b> Using the WAN interface vni-0/0 instead of vni-0/3; typing the PC address .10 as the interface address; testing only with a ping from the router, which uses its own source address.</p></div>
<div class="exam"><p><b>Exam trap.</b> A branch learns remote LANs only if <b>both</b> overlays are Established and both sites belong to the same organization. The local LAN interface must be configured for the site to advertise anything.</p></div>

<div class="scn"><h4>The shop without a door number</h4><p>A new store went live. Tunnels were green and the Controller showed Established, but the head office could not reach the store printers. The branch LAN interface had been left disabled from staging. One enable and an address later the prefix appeared on the head-office branch, and printing worked.</p><p><b>Lesson:</b> advertise what exists. No configured LAN interface, no prefix, no reachability.</p></div>
<div class="iv"><p class="q">"A branch overlay is up but its LAN is unreachable. What do you check first?"</p><p>I check whether the branch LAN interface is up with the right address and mask, then whether remote branches list its prefix in the sites table, and finally ping from a host behind the branch. If the prefix is missing the problem is at the origin; if it is present the problem is in return path, policy or the host.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected LAN prefix exists only when vni-0/3 is enabled and addressed; the branch then advertises it through MP-BGP.</li>
<li>Commands: address under unit 0 family inet, enable true, commit.</li>
<li>Verify on a remote branch with show orgs org Acme sd-wan sites.</li>
<li>Finish with a ping from the PC to prove the full path.</li>
<li>Follow the course convention: 10.1.k.0/24, gateway .1, PC .10.</li>
</ul></div>
`,hi:`
<p>Mall ke map par shop tab nahi milti jab kisi ne uska door number paint hi na kiya ho. Is lab mein Bengaluru ki shop (Branch2) khuli hai aur mall ke corridors se connected hai (overlay healthy hai), par uska LAN interface kabhi configure nahi hua, isliye map mein uski entry nahi hai. Aap door number paint karoge aur prove karoge ki Delhi ke visitors use dhundh sakte hain.</p>

<h3>Situation</h3>
<p>Branch2 (Bengaluru, site-id 102) ke Internet, MPLS aur LTE tunnels chal rahe hain aur Controller-1 se session Established hai. PC2 (10.1.2.10) Delhi ke PC1 (10.1.1.10) tak nahi pahunch pa raha. Wajah WAN par bilkul nahi hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="vs-lan-advertise topology">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="93" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.10</text>
<rect x="160" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="225" y="85" text-anchor="middle" class="svg-ink" font-size="13">Branch2</text><text x="225" y="103" text-anchor="middle" class="svg-muted" font-size="11">vni-0/3 unconfigured</text><text x="225" y="120" text-anchor="middle" class="svg-accent" font-size="11">chahiye 10.1.2.1/24</text>
<rect x="340" y="75" width="120" height="40" rx="8" fill="#bae6fd"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="13">Controller-1</text>
<rect x="510" y="60" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="565" y="103" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.1/24</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="11">PC1 10.1.1.10</text>
<line x1="110" y1="95" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="290" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">overlay up hai, par Branch2 par koi LAN prefix hai hi nahi</text>
</svg><p class="cap">Overlay healthy hai; missing piece LAN interface hai.</p></div>

<h3>Step 1: problem dekho</h3>
<pre class="out">admin@Branch2-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.10/30
vni-0/1     up      up      172.31.2.2/30
vni-0/2     up      up      100.64.2.2/30
<span class="hl">vni-0/3     down    down    -</span>

admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      <span class="hl">-</span>
Branch3      103      10.1.3.0/24</pre>
<p>Do clues: LAN port ka address nahi hai aur woh down hai, aur Delhi Branch2 ko <b>bina LAN prefix</b> ke site ki tarah dekhta hai. Site exist karti hai (overlay theek), par route karne ko kuch nahi.</p>

<h3>Step 2: LAN interface configure karo</h3>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24
admin@Branch2-cli% set interfaces vni-0/3 enable true
admin@Branch2-cli% commit
Commit complete.
admin@Branch2-cli% exit</pre>
<p>Line by line: <code>set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24</code> port ko LAN ka gateway address deta hai (unit 0 logical interface hai, family inet matlab IPv4). <code>enable true</code> port ko administratively up karta hai. <code>commit</code> change ko apply aur validate karta hai. Commit ke bina kuch nahi hota, aur commit se pehle <code>show | compare</code> ya discard karne ke liye <code>rollback</code> use kar sakte ho.</p>
<div class="eg"><p><b>.1 kyun?</b> Course convention: LAN 10.1.k.0/24, branch par gateway .1 aur PC .10. Branch 2 ke liye: 10.1.2.0/24, gateway 10.1.2.1, PC2 10.1.2.10. Agar aap 10.1.20.1/24 type karte to alag prefix banta aur PC2 usse match nahi karta.</p></div>

<h3>Step 3: verify karo ki Delhi ne prefix seekha</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      <span class="hl">10.1.2.0/24</span>
Branch3      103      10.1.3.0/24</pre>
<p>Parde ke peeche kya hua: connected route 10.1.2.0/24 bana, Branch2 ne use MP-BGP se Controller ko originate kiya, Controller ne Branch1 aur Branch3 ko reflect kiya, aur Delhi ne Acme tenant mein import kiya.</p>

<h3>Step 4: end to end prove karo</h3>
<pre class="out">PC2&gt; ping 10.1.1.10
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=22 ms
64 bytes from 10.1.1.10: icmp_seq=2 ttl=63 time=22 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Router se nahi, PC se ping poora path test karta hai: PC gateway, overlay route, tunnel, remote LAN aur return path. Hamesha user-side test se khatam karo.</p>

<h3>Socho aur kya fail ho sakta tha</h3>
<ul>
<li><b>Mask typo</b> (10.1.2.1/25): .10 wala PC chalta rahega par advertised prefix chhota hai, isliye /24 ke doosre PCs unreachable honge.</li>
<li><b>enable true bhool gaye</b>: address hai par port down hai, isliye connected route nahi banta.</li>
<li><b>commit bhool gaye</b>: candidate configuration active nahi hai.</li>
<li><b>Galat organization ya site-id</b>: site dikhegi hi nahi (chapter 11).</li>
</ul>
<div class="warn"><p><b>Common galtiyan.</b> vni-0/3 ki jagah WAN interface vni-0/0 use karna; PC ka address .10 interface address ki tarah type karna; sirf router se ping karke test karna, jo apna source address use karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Branch remote LANs tabhi seekhti hai jab <b>dono</b> overlays Established hon aur dono sites same organization ki hon. Site kuch advertise kare, iske liye local LAN interface configured hona chahiye.</p></div>

<div class="scn"><h4>Bina door number ki shop</h4><p>Ek naya store live hua. Tunnels green the aur Controller Established dikha raha tha, par head office store printers tak nahi pahunch pa raha tha. Branch LAN interface staging se disabled chhoda gaya tha. Ek enable aur ek address ke baad prefix head-office branch par aa gaya aur printing chalne lagi.</p><p><b>Seekh:</b> jo exist karta hai wahi advertise hota hai. LAN interface configured nahi, to prefix nahi, to reachability nahi.</p></div>
<div class="iv"><p class="q">"Branch ka overlay up hai par uska LAN unreachable hai. Sabse pehle kya check karoge?"</p><p>Pehle dekhta hoon ki branch LAN interface sahi address aur mask ke saath up hai ya nahi, phir remote branches uske prefix ko sites table mein list karte hain ya nahi, aur aakhir mein branch ke peeche ke host se ping. Prefix missing ho to problem origin par hai; present ho to problem return path, policy ya host mein hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected LAN prefix tabhi banta hai jab vni-0/3 enabled aur addressed ho; phir branch use MP-BGP se advertise karti hai.</li>
<li>Commands: unit 0 family inet ke under address, enable true, commit.</li>
<li>Remote branch par show orgs org Acme sd-wan sites se verify karo.</li>
<li>Poora path prove karne ke liye PC se ping par khatam karo.</li>
<li>Course convention follow karo: 10.1.k.0/24, gateway .1, PC .10.</li>
</ul></div>
`}};export{e as default};