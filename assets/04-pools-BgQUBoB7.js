var e={id:`pools`,h:{en:`Identity pools: UUID, MAC, WWNN, WWPN and IP`,hi:`Identity pools: UUID, MAC, WWNN, WWPN aur IP`},body:{en:`
<p>A telecom operator does not invent a new phone number every time someone buys a SIM. It owns blocks of numbers and hands out the next free one. <b>Identity pools</b> in UCS Manager work exactly like that: you define a block of values once, and every service profile that needs a MAC, WWPN or UUID takes the next free one. No spreadsheets, no duplicates.</p>

<h3>The five identity pools</h3>
<table class="cmp"><tr><th>Pool</th><th>Identity</th><th>Who cares about it</th><th>Where in UCSM</th></tr>
<tr><td><b>UUID suffix</b></td><td>128-bit server UUID = 16-hex-digit prefix + 16-hex-digit suffix</td><td>OS, licence servers, management tools</td><td>Servers ▸ Pools ▸ UUID Suffix Pools</td></tr>
<tr><td><b>MAC</b></td><td>48-bit address of each vNIC</td><td>Switches, DHCP reservations, firewalls</td><td>LAN ▸ Pools ▸ MAC Pools</td></tr>
<tr><td><b>WWNN</b></td><td>64-bit node name, one per server</td><td>Some arrays and FC tools</td><td>SAN ▸ Pools ▸ WWNN Pools</td></tr>
<tr><td><b>WWPN</b></td><td>64-bit port name, one per vHBA</td><td>SAN zoning and LUN masking</td><td>SAN ▸ Pools ▸ WWPN Pools</td></tr>
<tr><td><b>IP (ext-mgmt)</b></td><td>Out-of-band IP for each server's CIMC (KVM console, virtual media)</td><td>Operators opening the KVM</td><td>LAN ▸ Pools ▸ IP Pools</td></tr>
</table>
<p>A <b>server pool</b> is different: it groups physical blades rather than identities. You will use it in chapter 7.</p>

<h3>Conventions that save you at 3 a.m.</h3>
<ul>
<li><b>OUI 00:25:B5.</b> Cisco reserves the organisationally unique identifier 00:25:B5 for UCS pooled identities. MAC pools start with it (00:25:B5:...) and WWN pools embed it (20:00:00:25:B5:...). The GUI proposes it by default.</li>
<li><b>WWN ranges.</b> UCSM accepts WWNN/WWPN blocks only in 20:00:00:00:00:00:00:00 to 20:FF:FF:FF:FF:FF:FF:FF or 50:00:00:00:00:00:00:00 to 5F:FF:FF:FF:FF:FF:FF:FF.</li>
<li><b>Encode the fabric.</b> Use one MAC pool and one WWPN pool per fabric and put the fabric in a byte you can read: 0A for fabric A, 0B for fabric B. When a switch or MDS shows 00:25:B5:0B:00:07 you instantly know it is a fabric B vNIC.</li>
<li><b>Encode more if you need it.</b> Larger shops use the next bytes for site, domain or OS type, for example 00:25:B5:1A:... for data center 1 fabric A. Keep the scheme documented and identical across domains so pools never overlap.</li>
<li><b>Assignment order.</b> Set it to <b>Sequential</b> so the lowest free value is handed out first; the default lets UCSM choose. Sequential makes identities predictable, which is what the labs rely on.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reading an encoded WWPN">
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">20:00 : 00:25:B5 : 0A : 00:07</text>
<rect x="150" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="195" y="88" text-anchor="middle" class="svg-ink" font-size="12">20:00 NAA</text>
<rect x="250" y="60" width="110" height="46" rx="8" fill="#bae6fd"/><text x="305" y="88" text-anchor="middle" class="svg-ink" font-size="12">Cisco OUI</text>
<rect x="370" y="60" width="70" height="46" rx="8" fill="#fde68a"/><text x="405" y="88" text-anchor="middle" class="svg-ink" font-size="12">fabric</text>
<rect x="450" y="60" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="495" y="88" text-anchor="middle" class="svg-ink" font-size="12">index</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">MAC version: 00:25:B5 : 0A : 00:07 (fabric A, eighth address)</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">One glance tells you the fabric and the position in the pool</text>
</svg><p class="cap">A good identity scheme is readable by humans: vendor, fabric and index.</p></div>

<h3>Sizing a pool</h3>
<p>A pool block is defined by a first value and a size. Size is counted in decimal but the addresses are hexadecimal, so a block of 32 starting at 00:25:B5:0A:00:00 ends at 00:25:B5:0A:00:1F (0x1F = 31). Size every pool for the whole life of the domain, plus spares:</p>
<div class="eg"><p><b>Worked example.</b> A domain has 3 chassis × 8 blades = 24 servers, growing to 40. Each ESXi profile has 4 vNICs (2 on fabric A, 2 on fabric B) and 2 vHBAs (1 per fabric).</p>
<ul><li>MAC-A: 40 servers × 2 vNICs = 80, round up to <b>128</b> (00:25:B5:0A:00:00 to 00:25:B5:0A:00:7F). Same for MAC-B.</li>
<li>WWPN-A: 40 × 1 = 40, round up to <b>64</b>. Same for WWPN-B.</li>
<li>WWNN-POOL: 1 per server = 40, round up to <b>64</b>. UUID-POOL: <b>64</b>. ext-mgmt IP pool: 40 addresses plus spares in the OOB subnet, for example 10.10.99.101 to 10.10.99.164.</li></ul>
<p>Pools cost nothing, so oversize them. An empty pool stops new profiles from associating.</p></div>

<h3>Building the pools (the Lab 1 values)</h3>
<p>In the GUI: <b>LAN ▸ Pools ▸ MAC Pools ▸ Add</b>, give the name, first address and size. Do the same under <b>SAN ▸ Pools</b> for WWNN-POOL (20:00:00:25:B5:00:00:00), WWPN-A (20:00:00:25:B5:0A:00:00) and WWPN-B (20:00:00:25:B5:0B:00:00), and under <b>Servers ▸ Pools ▸ UUID Suffix Pools</b> for UUID-POOL (suffix from 0000-000000000001). The CLI does the same:</p>
<pre class="code"><span class="c">! MAC pool for fabric A, 32 addresses</span>
UCS-A# scope org /
UCS-A /org # create mac-pool MAC-A
UCS-A /org/mac-pool* # set assignment-order sequential
UCS-A /org/mac-pool* # create block 00:25:B5:0A:00:00 00:25:B5:0A:00:1F
UCS-A /org/mac-pool/block* # commit-buffer
<span class="c">! WWPN pool for fabric A</span>
UCS-A /org # create wwn-pool WWPN-A port-wwn-assignment
UCS-A /org/wwn-pool* # create block 20:00:00:25:B5:0A:00:00 20:00:00:25:B5:0A:00:1F
UCS-A /org/wwn-pool/block* # commit-buffer</pre>
<pre class="out">UCS-A /org # show mac-pool MAC-A
MAC Pool:
    Name     Size   Assigned
    -------- ------ --------
<span class="hl">    MAC-A    32     0</span></pre>
<p>Once templates exist, the first vHBA built from a template that uses WWPN-A receives 20:00:00:25:B5:0A:00:00, the lowest free value. That is the answer to the last task in Lab 1.</p>

<div class="warn"><p><b>Common mistakes.</b> Overlapping blocks between two UCS domains (two servers with the same MAC on one LAN). One shared WWPN pool for both fabrics, which makes troubleshooting slow. Tiny pools: the 13th profile fails with insufficient-resources. Leaving the UUID at "hardware default", so the UUID changes when the blade changes and licences break.</p></div>
<div class="exam"><p><b>Exam tip.</b> WWNN = one per server (node), WWPN = one per vHBA (port). Zoning and LUN masking use the <b>WWPN</b>. UCS pooled identities use OUI 00:25:B5.</p></div>

<div class="scn"><h4>The duplicate MAC that only broke at night</h4><p>A company merged two data centers and connected both UCS domains to the same pair of leaf switches. Every night at 01:00 one backup server lost its network for a few seconds. The leaf logs showed MAC 00:25:B5:0A:00:0C flapping between the port-channels of the two domains. Both domains had been built from the same runbook with identical pools, and the night backup job woke up the only two servers that actually shared that MAC. The engineer re-numbered the second domain's pools to 00:25:B5:2A:... and 00:25:B5:2B:..., then re-associated the affected profiles in a maintenance window.</p><p><b>Lesson:</b> pools must be unique across every domain that shares a Layer 2 network or a SAN; encode the domain in the identity.</p></div>

<div class="iv"><p class="q">"How would you design MAC and WWPN pools for a new UCS domain?"</p><p>Strong answer: use the Cisco OUI 00:25:B5, one pool per fabric, and encode fabric and domain in a readable byte (0A/0B, or 1A/1B for site 1). Size for the full lifetime with spares, set sequential assignment, keep WWPNs separate per fabric because zoning is per fabric, and make sure no two domains overlap. Mention UUID and ext-mgmt IP pools too, and that pool exhaustion shows up as insufficient-resources.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five identity pools: UUID suffix, MAC, WWNN, WWPN and IP (ext-mgmt for CIMC/KVM).</li>
<li>Use 00:25:B5, one MAC and one WWPN pool per fabric, and encode the fabric (0A/0B).</li>
<li>Size is decimal, addresses are hex: 32 addresses from :00 end at :1F.</li>
<li>Oversize pools and keep them unique across domains; an empty pool blocks association.</li>
<li>WWPNs are what the SAN zones and masks; keep them stable through pools.</li>
</ul></div>
`,hi:`
<p>Telecom operator har baar SIM bikne par naya phone number invent nahi karta. Uske paas numbers ke blocks hote hain aur woh agla free number de deta hai. UCS Manager mein <b>identity pools</b> bilkul aise hi kaam karte hain: aap values ka ek block ek baar define karte ho, aur har service profile jise MAC, WWPN ya UUID chahiye woh agla free le leta hai. Na spreadsheets, na duplicates.</p>

<h3>Paanch identity pools</h3>
<table class="cmp"><tr><th>Pool</th><th>Identity</th><th>Kisko farak padta hai</th><th>UCSM mein kahan</th></tr>
<tr><td><b>UUID suffix</b></td><td>128-bit server UUID = 16-hex-digit prefix + 16-hex-digit suffix</td><td>OS, licence servers, management tools</td><td>Servers ▸ Pools ▸ UUID Suffix Pools</td></tr>
<tr><td><b>MAC</b></td><td>Har vNIC ka 48-bit address</td><td>Switches, DHCP reservations, firewalls</td><td>LAN ▸ Pools ▸ MAC Pools</td></tr>
<tr><td><b>WWNN</b></td><td>64-bit node name, har server ka ek</td><td>Kuch arrays aur FC tools</td><td>SAN ▸ Pools ▸ WWNN Pools</td></tr>
<tr><td><b>WWPN</b></td><td>64-bit port name, har vHBA ka ek</td><td>SAN zoning aur LUN masking</td><td>SAN ▸ Pools ▸ WWPN Pools</td></tr>
<tr><td><b>IP (ext-mgmt)</b></td><td>Har server ke CIMC ka out-of-band IP (KVM console, virtual media)</td><td>KVM kholne wale operators</td><td>LAN ▸ Pools ▸ IP Pools</td></tr>
</table>
<p><b>Server pool</b> alag cheez hai: yeh identities nahi, physical blades ko group karta hai. Ise aap chapter 7 mein use karoge.</p>

<h3>Conventions jo raat 3 baje aapko bachaati hain</h3>
<ul>
<li><b>OUI 00:25:B5.</b> Cisco ne organisationally unique identifier 00:25:B5 UCS pooled identities ke liye reserve kiya hai. MAC pools isse shuru hote hain (00:25:B5:...) aur WWN pools ise embed karte hain (20:00:00:25:B5:...). GUI default mein yahi propose karta hai.</li>
<li><b>WWN ranges.</b> UCSM WWNN/WWPN blocks sirf 20:00:00:00:00:00:00:00 se 20:FF:FF:FF:FF:FF:FF:FF ya 50:00:00:00:00:00:00:00 se 5F:FF:FF:FF:FF:FF:FF:FF tak accept karta hai.</li>
<li><b>Fabric encode karo.</b> Har fabric ka ek MAC pool aur ek WWPN pool rakho aur fabric ko ek padhne layak byte mein daalo: fabric A ke liye 0A, fabric B ke liye 0B. Jab switch ya MDS 00:25:B5:0B:00:07 dikhaye to aap turant jaan jaate ho ki yeh fabric B ka vNIC hai.</li>
<li><b>Zaroorat ho to aur encode karo.</b> Badi companies agle bytes site, domain ya OS type ke liye use karti hain, jaise data center 1 fabric A ke liye 00:25:B5:1A:.... Scheme documented rakho aur har domain mein same, taaki pools kabhi overlap na hon.</li>
<li><b>Assignment order.</b> Ise <b>Sequential</b> par set karo taaki sabse chhoti free value pehle mile; default UCSM ko chunne deta hai. Sequential identities ko predictable banata hai, aur labs isi par depend karte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Encoded WWPN padhna">
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">20:00 : 00:25:B5 : 0A : 00:07</text>
<rect x="150" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="195" y="88" text-anchor="middle" class="svg-ink" font-size="12">20:00 NAA</text>
<rect x="250" y="60" width="110" height="46" rx="8" fill="#bae6fd"/><text x="305" y="88" text-anchor="middle" class="svg-ink" font-size="12">Cisco OUI</text>
<rect x="370" y="60" width="70" height="46" rx="8" fill="#fde68a"/><text x="405" y="88" text-anchor="middle" class="svg-ink" font-size="12">fabric</text>
<rect x="450" y="60" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="495" y="88" text-anchor="middle" class="svg-ink" font-size="12">index</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">MAC version: 00:25:B5 : 0A : 00:07 (fabric A, aathvan address)</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">Ek nazar mein fabric aur pool mein position pata chal jaati hai</text>
</svg><p class="cap">Achhi identity scheme insaan padh sakta hai: vendor, fabric aur index.</p></div>

<h3>Pool ka size tay karna</h3>
<p>Pool block ek first value aur ek size se define hota hai. Size decimal mein ginte hain lekin addresses hexadecimal hain, isliye 00:25:B5:0A:00:00 se shuru hone wala 32 ka block 00:25:B5:0A:00:1F par khatam hota hai (0x1F = 31). Har pool ko domain ki poori life ke liye size karo, spares ke saath:</p>
<div class="eg"><p><b>Worked example.</b> Ek domain mein 3 chassis × 8 blades = 24 servers hain, jo 40 tak badhenge. Har ESXi profile mein 4 vNICs (2 fabric A par, 2 fabric B par) aur 2 vHBAs (har fabric par 1) hain.</p>
<ul><li>MAC-A: 40 servers × 2 vNICs = 80, round up karke <b>128</b> (00:25:B5:0A:00:00 se 00:25:B5:0A:00:7F). MAC-B ke liye bhi same.</li>
<li>WWPN-A: 40 × 1 = 40, round up karke <b>64</b>. WWPN-B ke liye bhi same.</li>
<li>WWNN-POOL: har server ka 1 = 40, round up karke <b>64</b>. UUID-POOL: <b>64</b>. ext-mgmt IP pool: OOB subnet mein 40 addresses plus spares, jaise 10.10.99.101 se 10.10.99.164.</li></ul>
<p>Pools ka koi kharcha nahi, isliye unhe bada rakho. Khaali pool naye profiles ko associate hone se rok deta hai.</p></div>

<h3>Pools banana (Lab 1 ki values)</h3>
<p>GUI mein: <b>LAN ▸ Pools ▸ MAC Pools ▸ Add</b>, naam, first address aur size do. <b>SAN ▸ Pools</b> ke neeche WWNN-POOL (20:00:00:25:B5:00:00:00), WWPN-A (20:00:00:25:B5:0A:00:00) aur WWPN-B (20:00:00:25:B5:0B:00:00) ke liye yahi karo, aur <b>Servers ▸ Pools ▸ UUID Suffix Pools</b> ke neeche UUID-POOL (suffix 0000-000000000001 se) ke liye. CLI bhi yahi karta hai:</p>
<pre class="code"><span class="c">! Fabric A ka MAC pool, 32 addresses</span>
UCS-A# scope org /
UCS-A /org # create mac-pool MAC-A
UCS-A /org/mac-pool* # set assignment-order sequential
UCS-A /org/mac-pool* # create block 00:25:B5:0A:00:00 00:25:B5:0A:00:1F
UCS-A /org/mac-pool/block* # commit-buffer
<span class="c">! Fabric A ka WWPN pool</span>
UCS-A /org # create wwn-pool WWPN-A port-wwn-assignment
UCS-A /org/wwn-pool* # create block 20:00:00:25:B5:0A:00:00 20:00:00:25:B5:0A:00:1F
UCS-A /org/wwn-pool/block* # commit-buffer</pre>
<pre class="out">UCS-A /org # show mac-pool MAC-A
MAC Pool:
    Name     Size   Assigned
    -------- ------ --------
<span class="hl">    MAC-A    32     0</span></pre>
<p>Templates ban jaane ke baad, WWPN-A use karne wale template se bane pehle vHBA ko 20:00:00:25:B5:0A:00:00 milta hai, sabse chhoti free value. Yahi Lab 1 ke aakhri task ka jawab hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Do UCS domains ke beech overlapping blocks (ek LAN par same MAC wale do servers). Dono fabrics ke liye ek shared WWPN pool, jo troubleshooting slow kar deta hai. Chhote pools: 13va profile insufficient-resources ke saath fail hota hai. UUID ko "hardware default" par chhodna, jisse blade badalne par UUID badal jaata hai aur licences toot jaate hain.</p></div>
<div class="exam"><p><b>Exam tip.</b> WWNN = har server (node) ka ek, WWPN = har vHBA (port) ka ek. Zoning aur LUN masking <b>WWPN</b> use karte hain. UCS pooled identities OUI 00:25:B5 use karti hain.</p></div>

<div class="scn"><h4>Duplicate MAC jo sirf raat ko tootta tha</h4><p>Ek company ne do data centers merge kiye aur dono UCS domains ko same leaf switch pair se jod diya. Har raat 01:00 baje ek backup server ka network kuch seconds ke liye chala jaata tha. Leaf logs mein MAC 00:25:B5:0A:00:0C dono domains ke port-channels ke beech flap karta dikha. Dono domains same runbook se identical pools ke saath bane the, aur raat ka backup job sirf un do servers ko jagata tha jo sach mein woh MAC share karte the. Engineer ne doosre domain ke pools ko 00:25:B5:2A:... aur 00:25:B5:2B:... par re-number kiya, phir maintenance window mein affected profiles ko re-associate kiya.</p><p><b>Seekh:</b> pools har us domain mein unique hone chahiye jo ek Layer 2 network ya SAN share karta hai; domain ko identity mein encode karo.</p></div>

<div class="iv"><p class="q">"Naye UCS domain ke liye MAC aur WWPN pools kaise design karoge?"</p><p>Strong answer: Cisco OUI 00:25:B5 use karo, har fabric ka ek pool, aur fabric aur domain ko ek padhne layak byte mein encode karo (0A/0B, ya site 1 ke liye 1A/1B). Poori lifetime ke liye spares ke saath size karo, sequential assignment set karo, WWPNs ko har fabric ke liye alag rakho kyunki zoning per fabric hoti hai, aur pakka karo ki do domains overlap na hon. UUID aur ext-mgmt IP pools bhi mention karo, aur yeh ki pool exhaustion insufficient-resources ke roop mein dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch identity pools: UUID suffix, MAC, WWNN, WWPN aur IP (CIMC/KVM ke liye ext-mgmt).</li>
<li>00:25:B5 use karo, har fabric ka ek MAC aur ek WWPN pool, aur fabric encode karo (0A/0B).</li>
<li>Size decimal hai, addresses hex: :00 se 32 addresses :1F par khatam hote hain.</li>
<li>Pools bade rakho aur domains ke across unique; khaali pool association rok deta hai.</li>
<li>SAN WWPNs ko hi zone aur mask karta hai; unhe pools se stable rakho.</li>
</ul></div>
`}};export{e as default};