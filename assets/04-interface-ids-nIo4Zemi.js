var e={id:`interface-ids`,h:{en:`Interface IDs: EUI-64 versus privacy addresses`,hi:`Interface IDs: EUI-64 vs privacy addresses`},body:{en:`
<p>A house address has two parts: the street (shared by every house on it) and the house number (unique on that street). In IPv6 the <b>prefix</b> is the street and the <b>interface ID</b> (IID) is the house number. On a /64 the interface ID is the last 64 bits. The prefix comes from the router or the network plan; this chapter is about where the house number comes from.</p>

<h3>Four ways to get an interface ID</h3>
<table class="cmp"><tr><th>Method</th><th>How the 64 bits are chosen</th><th>Typical use</th></tr>
<tr><td><b>Manual</b></td><td>An engineer types it, such as <code>::1</code> or <code>::10</code></td><td>Routers, servers, anything that needs a fixed, easy address</td></tr>
<tr><td><b>EUI-64</b></td><td>Built from the 48-bit MAC address</td><td>Router interfaces, older hosts, link-local addresses on network gear</td></tr>
<tr><td><b>Stable random</b> (semantically opaque)</td><td>A hash of the prefix and a secret: stable on this network, different on every other network</td><td>The stable address of modern hosts</td></tr>
<tr><td><b>Temporary (privacy)</b></td><td>Random, replaced regularly (often daily)</td><td>Outgoing connections from laptops and phones</td></tr>
</table>
<p>DHCPv6 can also hand out whole addresses, which you will see in chapter 6.</p>

<h3>EUI-64 step by step</h3>
<p><b>EUI-64</b> stretches a 48-bit MAC into a 64-bit interface ID in three steps:</p>
<ol>
<li>Split the MAC into two halves of 24 bits.</li>
<li>Insert <code>fffe</code> in the middle.</li>
<li><b>Flip the 7th bit</b> of the first byte (the Universal/Local bit). In hex this means the second digit changes by 2: <code>00</code>→<code>02</code>, <code>52</code>→<code>50</code>, <code>a4</code>→<code>a6</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EUI-64 steps">
<rect x="20" y="15" width="260" height="36" rx="6" fill="#e2e8f0"/><text x="150" y="38" text-anchor="middle" class="svg-ink" font-size="13">MAC 00:50:7f:06:6d:01</text>
<rect x="20" y="75" width="120" height="36" rx="6" fill="#bae6fd"/><text x="80" y="98" text-anchor="middle" class="svg-ink" font-size="13">0050:7f</text>
<rect x="150" y="75" width="80" height="36" rx="6" fill="#fde68a"/><text x="190" y="98" text-anchor="middle" class="svg-ink" font-size="13">ff:fe</text>
<rect x="240" y="75" width="120" height="36" rx="6" fill="#bae6fd"/><text x="300" y="98" text-anchor="middle" class="svg-ink" font-size="13">06:6d01</text>
<text x="380" y="98" class="svg-muted" font-size="12">1. split  2. insert fffe</text>
<rect x="20" y="135" width="340" height="36" rx="6" fill="#bbf7d0"/><text x="190" y="158" text-anchor="middle" class="svg-ink" font-size="13">0250:7fff:fe06:6d01</text>
<text x="380" y="158" class="svg-muted" font-size="12">3. flip 7th bit: 00 becomes 02</text>
<text x="20" y="205" class="svg-accent" font-size="13">Address: 2001:db8:acad:10:250:7fff:fe06:6d01</text>
</svg><p class="cap">EUI-64 for PC1 in the lab: the fffe in the middle is the giveaway that an address was built from a MAC.</p></div>

<div class="eg"><p><b>Worked example from the lab.</b> PC1's MAC is <code>00:50:7f:06:6d:01</code>. Split: <code>00507f</code> | <code>066d01</code>. Insert fffe: <code>0050:7fff:fe06:6d01</code>. Flip the 7th bit: <code>00</code> becomes <code>02</code>, giving <code>0250:7fff:fe06:6d01</code>. With the office prefix the address is <code>2001:db8:acad:10:250:7fff:fe06:6d01</code>, exactly what the PC shows after SLAAC:</p></div>
<pre class="out">PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : <span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01/64 (SLAAC)</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
GATEWAY           : FE80::5054:CFF:FE04:4B01
MAC               : 00:50:7f:06:6d:01</pre>
<p>Now do the router: its MAC is <code>52:54:0c:04:4b:01</code>. Insert fffe and flip the bit (<code>52</code>→<code>50</code>) to get <code>5054:cff:fe04:4b01</code>. Its link-local is therefore <code>fe80::5054:cff:fe04:4b01</code>, the gateway PC1 learned. The link-local address uses the same interface ID with the <code>fe80::/64</code> prefix.</p>

<h3>The privacy problem with EUI-64</h3>
<p>An EUI-64 interface ID never changes, because the MAC never changes. A laptop that joins the office, a coffee shop and a hotel would show the <b>same last 64 bits</b> everywhere, so any website could track it across networks, and the MAC (which reveals the manufacturer) is visible in every packet's source address. That is why modern operating systems do not use EUI-64 for global addresses by default.</p>
<ul>
<li><b>Temporary addresses</b> (privacy extensions): the host generates random interface IDs and uses them for outgoing connections, replacing them regularly. Old ones stay valid for a while so open sessions do not break.</li>
<li><b>Stable random addresses</b>: the host also keeps one address that does not change on this network (useful for incoming connections and logs) but is different on every network, so it cannot be used to track the device.</li>
</ul>
<p>A laptop may therefore show a link-local, a stable global and one or more temporary global addresses at the same time. On Windows, <code>ipconfig</code> lists them as "IPv6 Address" and "Temporary IPv6 Address"; on Linux, <code>ip -6 addr show</code> marks temporary ones with <code>temporary</code>.</p>

<h3>Duplicate Address Detection (DAD)</h3>
<p>Whatever method builds the address, the host must check that nobody else uses it before it starts using it. While the check runs the address is <b>tentative</b>. The host sends a Neighbor Solicitation for its own address, from the unspecified address <code>::</code>, to that address's solicited-node group. If anyone answers, the address is a <b>duplicate</b> and is not used. Chapter 5 shows these messages.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to flip the 7th bit when working out EUI-64 by hand. Flipping the wrong bit (it is the second-lowest bit of the first byte, worth 2). Expecting to find a PC in logs by its MAC-based address when the PC uses privacy addresses: search the neighbour table by MAC instead.</p></div>

<div class="exam"><p><b>Exam traps.</b> An address containing <code>ff:fe</code> in the middle of the interface ID was built with EUI-64. EUI-64 creates a 64-bit ID from a 48-bit MAC by inserting <b>FFFE</b>, not FFFF. Privacy (temporary) addresses exist to stop <b>tracking</b>; they do not encrypt anything.</p></div>

<div class="scn"><h4>Which laptop was that?</h4><p>The security team saw suspicious outbound connections from <code>2001:db8:acad:10:9c3e:41ab:77d2:e018</code> and asked the network team which laptop it was. The DHCP server had no record, because the office used SLAAC, and the address was a temporary privacy address that had already been replaced. The engineer looked up the address in the router's neighbour cache with <code>show ipv6 neighbors</code>, found the MAC, and traced the MAC to a switch port. The team then started exporting neighbour tables to the logging server every few minutes.</p><p><b>Lesson:</b> with SLAAC and privacy addresses, the neighbour cache (address to MAC) is your audit trail, so collect it.</p></div>

<div class="iv"><p class="q">"How does EUI-64 work, and why do modern hosts avoid it for global addresses?"</p><p>Strong answer: split the 48-bit MAC in half, insert FFFE, flip the Universal/Local (7th) bit, and use the result as the 64-bit interface ID. Because it is derived from a fixed MAC, the same ID follows the device to every network and exposes the vendor, which allows tracking. Hosts now use a stable random ID per network plus temporary addresses for outgoing traffic. Routers still commonly use EUI-64 or manual IDs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>On a /64 the last 64 bits are the interface ID: manual, EUI-64, stable random or temporary.</li>
<li>EUI-64: split the MAC, insert FFFE, flip the 7th bit (00 becomes 02, 52 becomes 50).</li>
<li>EUI-64 IDs never change and allow tracking; privacy extensions use random, changing IDs.</li>
<li>Hosts often have several global addresses at once: stable plus temporary.</li>
<li>Every new address is tentative until Duplicate Address Detection confirms nobody else uses it.</li>
</ul></div>
`,hi:`
<p>Ghar ke address ke do hisse hote hain: gali (jo us gali ke har ghar ki common hai) aur ghar ka number (jo us gali mein unique hai). IPv6 mein <b>prefix</b> gali hai aur <b>interface ID</b> (IID) ghar ka number. /64 par interface ID aakhri 64 bits hota hai. Prefix router ya network plan se aata hai; yeh chapter is baare mein hai ki ghar ka number kahan se aata hai.</p>

<h3>Interface ID paane ke chaar tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>64 bits kaise chune jaate hain</th><th>Typical use</th></tr>
<tr><td><b>Manual</b></td><td>Engineer khud type karta hai, jaise <code>::1</code> ya <code>::10</code></td><td>Routers, servers, jise bhi fixed aur aasaan address chahiye</td></tr>
<tr><td><b>EUI-64</b></td><td>48-bit MAC address se banta hai</td><td>Router interfaces, purane hosts, network gear ke link-local addresses</td></tr>
<tr><td><b>Stable random</b> (semantically opaque)</td><td>Prefix aur ek secret ka hash: is network par stable, har doosre network par alag</td><td>Modern hosts ka stable address</td></tr>
<tr><td><b>Temporary (privacy)</b></td><td>Random, regularly badalta hai (aksar roz)</td><td>Laptops aur phones ke outgoing connections</td></tr>
</table>
<p>DHCPv6 bhi poore addresses de sakta hai, jo aap chapter 6 mein dekhoge.</p>

<h3>EUI-64 step by step</h3>
<p><b>EUI-64</b> 48-bit MAC ko teen steps mein 64-bit interface ID mein kheenchta hai:</p>
<ol>
<li>MAC ko 24-24 bits ke do hisson mein todo.</li>
<li>Beech mein <code>fffe</code> daalo.</li>
<li>Pehle byte ka <b>7th bit flip karo</b> (Universal/Local bit). Hex mein iska matlab hai doosra digit 2 se badalta hai: <code>00</code>→<code>02</code>, <code>52</code>→<code>50</code>, <code>a4</code>→<code>a6</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EUI-64 ke steps">
<rect x="20" y="15" width="260" height="36" rx="6" fill="#e2e8f0"/><text x="150" y="38" text-anchor="middle" class="svg-ink" font-size="13">MAC 00:50:7f:06:6d:01</text>
<rect x="20" y="75" width="120" height="36" rx="6" fill="#bae6fd"/><text x="80" y="98" text-anchor="middle" class="svg-ink" font-size="13">0050:7f</text>
<rect x="150" y="75" width="80" height="36" rx="6" fill="#fde68a"/><text x="190" y="98" text-anchor="middle" class="svg-ink" font-size="13">ff:fe</text>
<rect x="240" y="75" width="120" height="36" rx="6" fill="#bae6fd"/><text x="300" y="98" text-anchor="middle" class="svg-ink" font-size="13">06:6d01</text>
<text x="380" y="98" class="svg-muted" font-size="12">1. todo  2. fffe daalo</text>
<rect x="20" y="135" width="340" height="36" rx="6" fill="#bbf7d0"/><text x="190" y="158" text-anchor="middle" class="svg-ink" font-size="13">0250:7fff:fe06:6d01</text>
<text x="380" y="158" class="svg-muted" font-size="12">3. 7th bit flip: 00 bana 02</text>
<text x="20" y="205" class="svg-accent" font-size="13">Address: 2001:db8:acad:10:250:7fff:fe06:6d01</text>
</svg><p class="cap">Lab ke PC1 ka EUI-64: beech ka fffe bata deta hai ki address MAC se bana hai.</p></div>

<div class="eg"><p><b>Lab se worked example.</b> PC1 ka MAC <code>00:50:7f:06:6d:01</code> hai. Todo: <code>00507f</code> | <code>066d01</code>. fffe daalo: <code>0050:7fff:fe06:6d01</code>. 7th bit flip karo: <code>00</code> ban jata hai <code>02</code>, to milta hai <code>0250:7fff:fe06:6d01</code>. Office prefix ke saath address hai <code>2001:db8:acad:10:250:7fff:fe06:6d01</code>, bilkul wahi jo SLAAC ke baad PC dikhata hai:</p></div>
<pre class="out">PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : <span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01/64 (SLAAC)</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
GATEWAY           : FE80::5054:CFF:FE04:4B01
MAC               : 00:50:7f:06:6d:01</pre>
<p>Ab router ka karo: uska MAC <code>52:54:0c:04:4b:01</code> hai. fffe daalo aur bit flip karo (<code>52</code>→<code>50</code>), milta hai <code>5054:cff:fe04:4b01</code>. Isliye uska link-local <code>fe80::5054:cff:fe04:4b01</code> hai, wahi gateway jo PC1 ne seekha. Link-local address same interface ID ko <code>fe80::/64</code> prefix ke saath use karta hai.</p>

<h3>EUI-64 ki privacy problem</h3>
<p>EUI-64 interface ID kabhi nahi badalta, kyunki MAC kabhi nahi badalta. Jo laptop office, coffee shop aur hotel ke network join karta hai, woh har jagah <b>same aakhri 64 bits</b> dikhayega, to koi bhi website use networks ke paar track kar sakti hai, aur MAC (jo manufacturer bata deta hai) har packet ke source address mein dikhta hai. Isiliye modern operating systems default mein global addresses ke liye EUI-64 use nahi karte.</p>
<ul>
<li><b>Temporary addresses</b> (privacy extensions): host random interface IDs banata hai aur unhe outgoing connections ke liye use karta hai, regularly badalte hue. Purane kuch der valid rehte hain taaki khule sessions na toote.</li>
<li><b>Stable random addresses</b>: host ek aisa address bhi rakhta hai jo is network par nahi badalta (incoming connections aur logs ke liye useful) lekin har network par alag hota hai, isliye device track nahi hota.</li>
</ul>
<p>Isliye ek laptop ek saath link-local, ek stable global aur ek ya zyada temporary global addresses dikha sakta hai. Windows par <code>ipconfig</code> unhe "IPv6 Address" aur "Temporary IPv6 Address" ke roop mein dikhata hai; Linux par <code>ip -6 addr show</code> temporary walon ko <code>temporary</code> se mark karta hai.</p>

<h3>Duplicate Address Detection (DAD)</h3>
<p>Address kisi bhi method se bane, use karne se pehle host ko check karna padta hai ki koi aur use to nahi kar raha. Jab tak check chal raha hai, address <b>tentative</b> rehta hai. Host apne hi address ke liye Neighbor Solicitation bhejta hai, unspecified address <code>::</code> se, us address ke solicited-node group ko. Agar koi jawab de, to address <b>duplicate</b> hai aur use nahi hota. Chapter 5 yeh messages dikhata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Haath se EUI-64 nikalte waqt 7th bit flip karna bhool jaana. Galat bit flip karna (yeh pehle byte ka neeche se doosra bit hai, value 2). Jab PC privacy addresses use kar raha ho tab logs mein use MAC-based address se dhoondhna: iski jagah neighbour table mein MAC se dhoondho.</p></div>

<div class="exam"><p><b>Exam traps.</b> Jis address ke interface ID ke beech mein <code>ff:fe</code> hai, woh EUI-64 se bana hai. EUI-64 48-bit MAC mein <b>FFFE</b> daal kar 64-bit ID banata hai, FFFF nahi. Privacy (temporary) addresses <b>tracking</b> rokne ke liye hain; woh kuch encrypt nahi karte.</p></div>

<div class="scn"><h4>Woh kaunsa laptop tha?</h4><p>Security team ne <code>2001:db8:acad:10:9c3e:41ab:77d2:e018</code> se suspicious outbound connections dekhe aur network team se poocha ki yeh kaunsa laptop hai. DHCP server par koi record nahi tha, kyunki office SLAAC use karta tha, aur address ek temporary privacy address tha jo pehle hi badal chuka tha. Engineer ne router ke neighbour cache mein <code>show ipv6 neighbors</code> se address dhoondha, MAC mila, aur MAC ko switch port tak trace kiya. Phir team ne har kuch minute mein neighbour tables logging server par export karna shuru kiya.</p><p><b>Seekh:</b> SLAAC aur privacy addresses ke saath neighbour cache (address se MAC) hi aapka audit trail hai, isliye use collect karo.</p></div>

<div class="iv"><p class="q">"EUI-64 kaise kaam karta hai, aur modern hosts global addresses ke liye ise kyun avoid karte hain?"</p><p>Strong answer: 48-bit MAC ko aadha todo, FFFE daalo, Universal/Local (7th) bit flip karo, aur result ko 64-bit interface ID ki tarah use karo. Kyunki yeh fixed MAC se banta hai, same ID device ke saath har network par jaata hai aur vendor bhi bata deta hai, jisse tracking hoti hai. Hosts ab har network ke liye ek stable random ID aur outgoing traffic ke liye temporary addresses use karte hain. Routers ab bhi aam taur par EUI-64 ya manual IDs use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>/64 par aakhri 64 bits interface ID hain: manual, EUI-64, stable random ya temporary.</li>
<li>EUI-64: MAC todo, FFFE daalo, 7th bit flip karo (00 bana 02, 52 bana 50).</li>
<li>EUI-64 IDs kabhi nahi badalte aur tracking allow karte hain; privacy extensions random, badalte IDs use karte hain.</li>
<li>Hosts ke paas aksar ek saath kai global addresses hote hain: stable plus temporary.</li>
<li>Har naya address tab tak tentative hai jab tak Duplicate Address Detection confirm na kare ki koi aur use nahi kar raha.</li>
</ul></div>
`}};export{e as default};