var e={id:`overview`,h:{en:`Layer 2 security: what you will learn and the big picture`,hi:`Layer 2 security: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn.</b> This module teaches you to defend the access layer of a campus network built on Juniper EX switches. You will protect the spanning tree, limit MAC learning, stop rogue DHCP servers, block ARP and IP spoofing, tame broadcast storms, encrypt a link with MACsec and filter Ethernet frames. These are the Layer 2 security objectives of JNCIS-ENT (JN0-351 and JN0-352), and the same tools a real campus engineer uses every week.</p>
<p><b>Prerequisites.</b> You should know VLANs, trunk and access ports, and basic RSTP (see the JNCIS STP module). You should be comfortable with the Junos candidate and commit workflow from JNCIA.</p>

<h3>Analogy: an office building with a reception desk</h3>
<p>Think of the access switch as the ground floor of an office. Anyone can walk up to a wall socket, just like anyone can plug a cable into a switch port. Without controls, a visitor can bring their own router, pretend to be someone else, shout so loudly that nobody can work, or listen at the door. Layer 2 security is the set of building rules: a visitor badge check (BPDU protection), a limit on how many badges one person may carry (MAC limiting), one official reception for new arrivals (DHCP snooping), a guest list at every desk (DAI and IP source guard), a noise limiter (storm control), a sealed corridor (MACsec) and a rulebook for what each person may say (firewall filters).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layer 2 threats and controls">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rogue switch / BPDU</text>
<rect x="20" y="75" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC flooding</text>
<rect x="20" y="130" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">Rogue DHCP, ARP, IP spoof</text>
<rect x="20" y="185" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="13">Storms, eavesdropping</text>
<rect x="440" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">BPDU / root / loop protect</text>
<rect x="440" y="75" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="13">interface-mac-limit</text>
<rect x="440" y="130" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">dhcp-security, DAI, IPSG</text>
<rect x="440" y="185" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="13">storm control, MACsec</text>
<line x1="200" y1="40" x2="440" y2="40" stroke="#64748b" stroke-width="2"/><line x1="200" y1="95" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="200" y1="150" x2="440" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="320" y="33" text-anchor="middle" class="svg-accent" font-size="12">stopped by</text>
</svg><p class="cap">Each Layer 2 threat has a matching Junos control.</p></div>

<h3>Why Layer 2 needs its own security</h3>
<p>Switches are built to be plug-and-play. Spanning tree trusts every BPDU it hears, the MAC table learns every source address it sees, DHCP trusts the first server that answers and ARP trusts every reply. None of these protocols have authentication by default. That is fine in a locked server room, but dangerous on a user port in a corridor. An attacker or even an innocent user with a home router needs no special tool to cause an outage.</p>
<ul>
<li><b>Control-plane attacks:</b> a switch with priority 0 takes over as root bridge and your traffic now flows through a laptop.</li>
<li><b>Table attacks:</b> thousands of fake source MACs fill the switching table so the switch floods traffic like a hub.</li>
<li><b>Address attacks:</b> a rogue DHCP server hands out a wrong gateway; a spoofed ARP reply puts a host in the middle.</li>
<li><b>Volume problems:</b> a loop or a faulty NIC creates a broadcast storm.</li>
<li><b>Wire exposure:</b> frames on an inter-building link can be tapped.</li>
</ul>

<h3>The module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th><th>Lab device names</th></tr>
<tr><td>2</td><td>Protecting the spanning tree</td><td>DIS1, DIS2, ASW1, ROGUE, LABSW</td></tr>
<tr><td>3</td><td>MAC limiting and storm control</td><td>ACC, DESK</td></tr>
<tr><td>4 - 5</td><td>DHCP snooping, DAI, IP source guard</td><td>CORE, ACC, DHCPSRV, HOMERTR</td></tr>
<tr><td>6</td><td>MACsec</td><td>CORE, ACC</td></tr>
<tr><td>7</td><td>Ethernet-switching filters</td><td>ACC</td></tr>
<tr><td>8</td><td>Troubleshooting a hardening change</td><td>CORE, ACC, DESK</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A campus has three buildings. In each access switch you decide: user ports are untrusted, uplinks are trusted. Edge ports get BPDU protection, a MAC limit of 3 and storm control at 5 percent. VLANs with users get DHCP security. Uplinks between buildings get MACsec. That one-page policy is repeated on every switch and becomes your <i>baseline</i>.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Turning every protection on at once and then not knowing which one broke the network. Enable one control at a time, verify, commit, then move on. Chapter 8 shows what happens when you do not.</p></div>
<div class="exam"><p><b>Exam trap.</b> Features are not interchangeable. Root protection reacts to <i>superior</i> BPDUs, BPDU protection to <i>any</i> BPDU on an edge port, and loop protection to the <i>absence</i> of BPDUs. The exam loves to swap them.</p></div>

<div class="scn"><h4>The visitor with the mini switch</h4><p>At a branch office a visitor plugged a small unmanaged-looking switch, which actually ran RSTP with default settings, into a user port. It had a lower MAC than the real root candidate, so the whole floor re-converged around it for ten seconds and VoIP calls dropped. The same week the team enabled BPDU protection on all edge ports. The next time a switch was plugged in, only that single port was disabled and a log message told the engineer exactly which one.</p><p><b>Lesson:</b> small, cheap controls on edge ports turn a network-wide outage into a one-port event.</p></div>

<div class="iv"><p class="q">"What are the main Layer 2 attacks and how do you defend against them on Juniper switches?"</p><p>Group them: spanning-tree manipulation (BPDU, root and loop protection), table exhaustion (MAC limiting), address spoofing (DHCP snooping, DAI, IP source guard), volume (storm control), and wire security (MACsec). Add that you apply them as a baseline per port role: untrusted access, trusted uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 protocols trust every neighbour by default; user ports need explicit controls.</li>
<li>Each threat has one matching Junos feature; know which reacts to what.</li>
<li>Think in port roles: untrusted access ports, trusted uplinks.</li>
<li>Enable and verify one control at a time.</li>
<li>These topics map to JNCIS-ENT Layer 2 security objectives.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh module aapko Juniper EX switches par bane campus network ke access layer ko defend karna sikhata hai. Aap spanning tree ki hifazat karoge, MAC learning limit karoge, rogue DHCP servers roknge, ARP aur IP spoofing block karoge, broadcast storms ko kaabu karoge, MACsec se link encrypt karoge aur Ethernet frames filter karoge. Yeh JNCIS-ENT (JN0-351 aur JN0-352) ke Layer 2 security objectives hain, aur wahi tools hain jo ek real campus engineer har hafte use karta hai.</p>
<p><b>Prerequisites.</b> Aapko VLANs, trunk aur access ports, aur basic RSTP aana chahiye (JNCIS STP module dekho). JNCIA se Junos candidate aur commit workflow ka comfort hona chahiye.</p>

<h3>Analogy: reception wala office building</h3>
<p>Access switch ko office ki ground floor samjho. Koi bhi wall socket tak jaa sakta hai, bilkul waise hi jaise koi bhi switch port mein cable laga sakta hai. Controls ke bina visitor apna router laga sakta hai, kisi aur ka naam le sakta hai, itna shor kar sakta hai ki koi kaam na kar sake, ya darwaze par sunn sakta hai. Layer 2 security building ke rules ka set hai: visitor badge check (BPDU protection), ek aadmi kitne badge rakh sakta hai uski limit (MAC limiting), naye aane walon ke liye ek official reception (DHCP snooping), har desk par guest list (DAI aur IP source guard), noise limiter (storm control), sealed corridor (MACsec) aur har insaan kya bol sakta hai uski rulebook (firewall filters).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layer 2 threats aur controls">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rogue switch / BPDU</text>
<rect x="20" y="75" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC flooding</text>
<rect x="20" y="130" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">Rogue DHCP, ARP, IP spoof</text>
<rect x="20" y="185" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="13">Storms, eavesdropping</text>
<rect x="440" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">BPDU / root / loop protect</text>
<rect x="440" y="75" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="13">interface-mac-limit</text>
<rect x="440" y="130" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">dhcp-security, DAI, IPSG</text>
<rect x="440" y="185" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="13">storm control, MACsec</text>
<line x1="200" y1="40" x2="440" y2="40" stroke="#64748b" stroke-width="2"/><line x1="200" y1="95" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="200" y1="150" x2="440" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="320" y="33" text-anchor="middle" class="svg-accent" font-size="12">rokta hai</text>
</svg><p class="cap">Har Layer 2 threat ka ek matching Junos control hai.</p></div>

<h3>Layer 2 ko apni security kyun chahiye</h3>
<p>Switches plug-and-play ke liye bane hain. Spanning tree har BPDU par bharosa karta hai, MAC table har source address learn karta hai, DHCP pehle jawab dene wale server par bharosa karta hai aur ARP har reply par. In protocols mein default se authentication nahi hota. Locked server room mein theek hai, lekin corridor ke user port par khatarnak. Attacker ya ghar ka router lagane wala masoom user bhi bina kisi special tool ke outage la sakta hai.</p>
<ul>
<li><b>Control-plane attacks:</b> priority 0 wala switch root bridge ban jaata hai aur aapka traffic ek laptop se guzarta hai.</li>
<li><b>Table attacks:</b> hazaaron fake source MACs switching table bhar dete hain aur switch hub ki tarah flood karne lagta hai.</li>
<li><b>Address attacks:</b> rogue DHCP server galat gateway deta hai; spoofed ARP reply host ko beech mein bitha deta hai.</li>
<li><b>Volume problems:</b> loop ya kharab NIC broadcast storm banata hai.</li>
<li><b>Wire exposure:</b> imaraton ke beech ke link ke frames tap ho sakte hain.</li>
</ul>

<h3>Module ka map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th><th>Lab device names</th></tr>
<tr><td>2</td><td>Spanning tree ki hifazat</td><td>DIS1, DIS2, ASW1, ROGUE, LABSW</td></tr>
<tr><td>3</td><td>MAC limiting aur storm control</td><td>ACC, DESK</td></tr>
<tr><td>4 - 5</td><td>DHCP snooping, DAI, IP source guard</td><td>CORE, ACC, DHCPSRV, HOMERTR</td></tr>
<tr><td>6</td><td>MACsec</td><td>CORE, ACC</td></tr>
<tr><td>7</td><td>Ethernet-switching filters</td><td>ACC</td></tr>
<tr><td>8</td><td>Hardening change ka troubleshooting</td><td>CORE, ACC, DESK</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek campus mein teen buildings hain. Har access switch mein aap tay karte ho: user ports untrusted, uplinks trusted. Edge ports par BPDU protection, MAC limit 3 aur 5 percent storm control. Users wale VLANs par DHCP security. Buildings ke beech uplinks par MACsec. Yeh ek page ki policy har switch par dohraayi jaati hai aur aapka <i>baseline</i> ban jaati hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Saari protections ek saath on kar dena aur phir pata na chalna ki kaunsi ne network tora. Ek-ek control on karo, verify karo, commit karo, phir agla. Chapter 8 dikhata hai ki aisa na karne par kya hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Features ek doosre ki jagah nahi lete. Root protection <i>superior</i> BPDUs par react karti hai, BPDU protection edge port par <i>kisi bhi</i> BPDU par, aur loop protection BPDUs ke <i>na aane</i> par. Exam inhe aksar ulta-pulta karta hai.</p></div>

<div class="scn"><h4>Mini switch wala visitor</h4><p>Ek branch office mein visitor ne ek chhota switch user port mein laga diya, jo asal mein default settings ke saath RSTP chala raha tha. Uska MAC asli root candidate se chhota tha, isliye poori floor uske aas-paas re-converge hui aur das second ke liye VoIP calls gir gayin. Usi hafte team ne saare edge ports par BPDU protection on kar diya. Agli baar jab switch lagaya gaya to sirf wahi ek port disable hua aur log message ne bata diya ki kaunsa port.</p><p><b>Lesson:</b> edge ports par chhote, sasste controls poore network ke outage ko ek-port ki ghatna bana dete hain.</p></div>

<div class="iv"><p class="q">"Main Layer 2 attacks kaunse hain aur Juniper switches par unse kaise bachte ho?"</p><p>Groups mein batao: spanning-tree manipulation (BPDU, root aur loop protection), table exhaustion (MAC limiting), address spoofing (DHCP snooping, DAI, IP source guard), volume (storm control), aur wire security (MACsec). Yeh bhi jodo ki aap port role ke hisaab se baseline lagate ho: untrusted access, trusted uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 protocols default mein har neighbour par bharosa karte hain; user ports ko explicit controls chahiye.</li>
<li>Har threat ka ek matching Junos feature hai; jaano kaun kis par react karta hai.</li>
<li>Port roles mein socho: untrusted access ports, trusted uplinks.</li>
<li>Ek-ek control on karo aur verify karo.</li>
<li>Yeh topics JNCIS-ENT ke Layer 2 security objectives se jude hain.</li>
</ul></div>
`}};export{e as default};