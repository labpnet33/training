var e={id:`map-t-map-e`,h:{en:`MAP-T and MAP-E: stateless address-and-port mapping`,hi:`MAP-T aur MAP-E: stateless address-and-port mapping`},body:{en:`
<p>CGNAT, NAT64 and DS-Lite all keep a table of flows in a central box. That box must be sized for sessions, logs every flow and is a single point of shared fate. <b>MAP</b> (Mapping of Address and Port) takes a different approach: the mapping from an IPv4 address and port set to an IPv6 address is calculated from <b>rules</b>, so the provider keeps <b>no per-flow state</b> for IPv4-to-IPv4 traffic. There are two data-plane flavours: <b>MAP-E</b> (RFC 7597, encapsulation) and <b>MAP-T</b> (RFC 7599, translation). They share the same rule set.</p>

<h3>The core idea: sharing an IPv4 address by port ranges</h3>
<p>Give one public IPv4 address to several subscribers, but give each subscriber a <b>different range of ports</b>. A subscriber's IPv4 address and port set is fixed by configuration. Because the mapping is known in advance, any MAP border relay can compute where to send a return packet from the destination address and port alone, with no table.</p>
<p>The port set is described by a <b>PSID</b> (Port Set Identifier). A few port bits identify the subscriber, and the remaining bits give the usable ports. The port-set parameter <b>a</b> keeps the first group of ports (the system or well-known range) out of use, so a block excludes ports below 1024 by default.</p>
<div class="eg"><p><b>Worked example.</b> A rule prefix is 192.0.2.0/24 for IPv4 and each public address is shared by 16 subscribers. Four bits of PSID mean 2 to the power 4 = 16 sharing ratio. Subscriber with PSID 5 gets the ports whose PSID bits equal 5, so roughly 1/16 of 64,000 ports, about 4,000 ports, scattered in a defined pattern. The subscriber CPE does NAT44 only inside that port set, and the provider can compute the same set from the rule.</p></div>

<h3>The rule vocabulary</h3>
<dl class="terms">
<dt>MAP domain</dt><dd>The set of CPEs and border relays using the same rules.</dd>
<dt>BMR (Basic Mapping Rule)</dt><dd>Maps a rule IPv6 prefix to an IPv4 prefix. The CPE uses it to compute its own IPv4 address, PSID and port set from its delegated IPv6 prefix.</dd>
<dt>FMR (Forwarding Mapping Rule)</dt><dd>Lets one CPE reach another CPE in the same domain directly, with no border relay, by calculating the peer's IPv6 address.</dd>
<dt>DMR (Default Mapping Rule)</dt><dd>Sends traffic for IPv4 outside the domain to the border relay (BR). In MAP-T it holds the translation prefix; in MAP-E it holds the BR's IPv6 address.</dd>
<dt>BR (Border Relay)</dt><dd>The provider gateway between the MAP domain and the IPv4 Internet. Stateless for the MAP data path.</dd>
</dl>

<h3>MAP-E versus MAP-T</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MAP-E and MAP-T">
<rect x="20" y="20" width="285" height="150" rx="10" fill="#ddd6fe"/><text x="162" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAP-E (encapsulation)</text><text x="162" y="75" text-anchor="middle" class="svg-muted" font-size="12">IPv4 packet inside IPv6</text><text x="162" y="100" text-anchor="middle" class="svg-muted" font-size="12">+40 bytes overhead</text><text x="162" y="125" text-anchor="middle" class="svg-muted" font-size="12">IPv4 header preserved end to end</text><text x="162" y="150" text-anchor="middle" class="svg-muted" font-size="12">DMR = BR IPv6 address</text>
<rect x="335" y="20" width="285" height="150" rx="10" fill="#bbf7d0"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAP-T (translation)</text><text x="477" y="75" text-anchor="middle" class="svg-muted" font-size="12">header rewritten to IPv6</text><text x="477" y="100" text-anchor="middle" class="svg-muted" font-size="12">no extra encapsulation, native IPv6 packet</text><text x="477" y="125" text-anchor="middle" class="svg-muted" font-size="12">addresses embedded in IPv6</text><text x="477" y="150" text-anchor="middle" class="svg-muted" font-size="12">DMR = translation prefix</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Same rules, different data plane</text>
</svg><p class="cap">MAP-E tunnels; MAP-T translates.</p></div>
<ul>
<li><b>MAP-E</b> keeps the original IPv4 header in the payload. It adds 40 bytes, but it passes through the network unchanged and is simple to troubleshoot.</li>
<li><b>MAP-T</b> rewrites the packet as a native IPv6 packet (using the IPv4/IPv6 translation of RFC 6145 and RFC 6052-like address formats). There is no encapsulation overhead and the network can apply standard IPv6 treatment such as QoS and ACLs per flow, but fragmentation and ICMP translation are the price.</li>
</ul>

<h3>Why operators choose MAP</h3>
<ul>
<li><b>No per-flow state</b>, no per-flow logging. The mapping from IPv4 address and port to a subscriber is computed from the rules, which answers regulators.</li>
<li><b>Scales horizontally</b>: border relays are stateless, so anycast and ECMP work and any BR can handle any packet.</li>
<li>IPv6-only access and core, like DS-Lite and 464XLAT.</li>
</ul>
<p>The cost is that a subscriber has a fixed, small port range. Heavy users hit the limit sooner than with dynamic CGNAT, and the number of subscribers per address is a design decision that must be made up front. Inbound connections are possible only to the subscriber's port set, which makes limited port forwarding feasible.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>MAP is mainly implemented on CPE and on border relay platforms. A design record, not a CLI listing:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! MAP domain: rule IPv6 prefix 2001:db8:100::/40  &lt;-&gt;  rule IPv4 prefix 192.0.2.0/24</span>
<span class="c">! Sharing ratio 16 (PSID length 4), excluded ports below 1024</span>
<span class="c">! DMR (MAP-T): 64:ff9b::/96   |   DMR (MAP-E): BR address 2001:db8:ffff::2</span>
<span class="c">! BR announces the rule prefix and the DMR prefix into the IPv6 network</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Believing MAP is stateful; the BR does no flow tracking for the MAP traffic. Forgetting that the CPE still runs NAT44 within its port set; and choosing a sharing ratio too high for the subscriber profile.</p></div>
<div class="exam"><p><b>Exam trap.</b> MAP-E = encapsulation, MAP-T = translation, same BMR/FMR/DMR rules. DS-Lite is stateful with an AFTR; MAP is stateless. Both are IPv6-only access technologies.</p></div>

<div class="scn"><h4>Regulator asks who used a public address</h4><p>An operator running stateful CGNAT received a request to identify a subscriber from a public IPv4 address and port at a given time. It had to search a very large flow log. A neighbouring operator on MAP-T answered by calculating the PSID from the port and finding the subscriber from the rule, with no per-flow log needed.</p><p><b>Lesson:</b> deterministic mapping simplifies compliance and scale, at the cost of fixed port ranges.</p></div>

<div class="iv"><p class="q">"What is the difference between MAP-T and MAP-E, and why are they stateless?"</p><p>Both compute the IPv4 address and port set of each subscriber from rules (BMR, FMR, DMR), so no per-flow table is needed. MAP-E encapsulates IPv4 in IPv6; MAP-T translates the headers to IPv6. Mention PSID and port sets, and the trade-off of fixed port ranges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAP shares one IPv4 address among subscribers by assigning each a port set (PSID).</li>
<li>Rules: BMR, FMR, DMR; the Border Relay connects to the IPv4 Internet.</li>
<li>MAP-E encapsulates (adds 40 bytes); MAP-T translates.</li>
<li>No per-flow state or logs for the MAP path; BRs scale horizontally.</li>
<li>Trade-off: fixed port range per subscriber.</li>
</ul></div>
`,hi:`
<p>CGNAT, NAT64 aur DS-Lite teeno central box mein flows ka table rakhte hain. Us box ko sessions ke liye size karna padta hai, har flow log hota hai aur woh single point of shared fate hai. <b>MAP</b> (Mapping of Address and Port) alag approach leta hai: IPv4 address aur port set se IPv6 address ka mapping <b>rules</b> se calculate hota hai, isliye provider IPv4-to-IPv4 traffic ke liye <b>per-flow state nahi</b> rakhta. Do data-plane flavours hain: <b>MAP-E</b> (RFC 7597, encapsulation) aur <b>MAP-T</b> (RFC 7599, translation). Dono ek hi rule set share karte hain.</p>

<h3>Core idea: IPv4 address ko port ranges se share karna</h3>
<p>Ek public IPv4 address kai subscribers ko do, lekin har subscriber ko <b>alag port range</b> do. Subscriber ka IPv4 address aur port set configuration se fixed hota hai. Kyunki mapping pehle se pata hai, koi bhi MAP border relay sirf destination address aur port se return packet ka rasta nikal sakta hai, bina table ke.</p>
<p>Port set <b>PSID</b> (Port Set Identifier) se describe hota hai. Kuch port bits subscriber ko identify karte hain, aur baaki bits usable ports dete hain. Port-set parameter <b>a</b> ports ke pehle group (system ya well-known range) ko use se bahar rakhta hai, isliye block by default 1024 se neeche ke ports ko exclude karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Rule prefix IPv4 ke liye 192.0.2.0/24 hai aur har public address 16 subscribers share karte hain. PSID ke chaar bits ka matlab 2 ki power 4 = 16 sharing ratio. PSID 5 wale subscriber ko woh ports milte hain jinke PSID bits 5 ke barabar hain, yaani 64,000 ports ka lagbhag 1/16, takreeban 4,000 ports, defined pattern mein bikhre hue. Subscriber CPE sirf us port set ke andar NAT44 karta hai, aur provider rule se wahi set compute kar sakta hai.</p></div>

<h3>Rule vocabulary</h3>
<dl class="terms">
<dt>MAP domain</dt><dd>CPEs aur border relays ka set jo same rules use karte hain.</dd>
<dt>BMR (Basic Mapping Rule)</dt><dd>Rule IPv6 prefix ko IPv4 prefix se map karta hai. CPE ise use karke apne delegated IPv6 prefix se apna IPv4 address, PSID aur port set compute karta hai.</dd>
<dt>FMR (Forwarding Mapping Rule)</dt><dd>Ek CPE ko same domain ke doosre CPE tak direct, border relay ke bina, pahunchne deta hai, peer ka IPv6 address calculate karke.</dd>
<dt>DMR (Default Mapping Rule)</dt><dd>Domain ke bahar ke IPv4 ka traffic border relay (BR) ko bhejta hai. MAP-T mein ismein translation prefix hota hai; MAP-E mein BR ka IPv6 address.</dd>
<dt>BR (Border Relay)</dt><dd>MAP domain aur IPv4 Internet ke beech provider gateway. MAP data path ke liye stateless.</dd>
</dl>

<h3>MAP-E versus MAP-T</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MAP-E aur MAP-T">
<rect x="20" y="20" width="285" height="150" rx="10" fill="#ddd6fe"/><text x="162" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAP-E (encapsulation)</text><text x="162" y="75" text-anchor="middle" class="svg-muted" font-size="12">IPv4 packet IPv6 ke andar</text><text x="162" y="100" text-anchor="middle" class="svg-muted" font-size="12">+40 bytes overhead</text><text x="162" y="125" text-anchor="middle" class="svg-muted" font-size="12">IPv4 header end to end preserved</text><text x="162" y="150" text-anchor="middle" class="svg-muted" font-size="12">DMR = BR IPv6 address</text>
<rect x="335" y="20" width="285" height="150" rx="10" fill="#bbf7d0"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAP-T (translation)</text><text x="477" y="75" text-anchor="middle" class="svg-muted" font-size="12">header IPv6 mein rewrite</text><text x="477" y="100" text-anchor="middle" class="svg-muted" font-size="12">extra encapsulation nahi, native IPv6 packet</text><text x="477" y="125" text-anchor="middle" class="svg-muted" font-size="12">addresses IPv6 mein embedded</text><text x="477" y="150" text-anchor="middle" class="svg-muted" font-size="12">DMR = translation prefix</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Rules same, data plane alag</text>
</svg><p class="cap">MAP-E tunnel karta hai; MAP-T translate karta hai.</p></div>
<ul>
<li><b>MAP-E</b> original IPv4 header ko payload mein rakhta hai. Yeh 40 bytes jodta hai, lekin network se unchanged guzarta hai aur troubleshoot karna aasaan hai.</li>
<li><b>MAP-T</b> packet ko native IPv6 packet ke roop mein rewrite karta hai (RFC 6145 ka IPv4/IPv6 translation aur RFC 6052 jaise address formats). Encapsulation overhead nahi hota aur network per flow standard IPv6 treatment jaise QoS aur ACLs laga sakta hai, lekin fragmentation aur ICMP translation iski keemat hain.</li>
</ul>

<h3>Operators MAP kyun chunte hain</h3>
<ul>
<li><b>Per-flow state nahi</b>, per-flow logging nahi. IPv4 address aur port se subscriber tak mapping rules se compute hota hai, jo regulators ko jawab deta hai.</li>
<li><b>Horizontally scale hota hai</b>: border relays stateless hain, isliye anycast aur ECMP kaam karte hain aur koi bhi BR koi bhi packet handle kar sakta hai.</li>
<li>DS-Lite aur 464XLAT ki tarah IPv6-only access aur core.</li>
</ul>
<p>Keemat yeh hai ki subscriber ke paas fixed, chhoti port range hoti hai. Heavy users dynamic CGNAT se jaldi limit par pahunchte hain, aur per address subscribers ki ginti ek design decision hai jo pehle se leni padti hai. Inbound connections sirf subscriber ke port set tak possible hain, jisse limited port forwarding feasible hoti hai.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>MAP mukhya roop se CPE aur border relay platforms par implement hota hai. Design record, CLI listing nahi:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! MAP domain: rule IPv6 prefix 2001:db8:100::/40  &lt;-&gt;  rule IPv4 prefix 192.0.2.0/24</span>
<span class="c">! Sharing ratio 16 (PSID length 4), excluded ports below 1024</span>
<span class="c">! DMR (MAP-T): 64:ff9b::/96   |   DMR (MAP-E): BR address 2001:db8:ffff::2</span>
<span class="c">! BR announces the rule prefix and the DMR prefix into the IPv6 network</span></pre>

<div class="warn"><p><b>Common mistakes.</b> MAP ko stateful maanna; MAP traffic ke liye BR flow tracking nahi karta. Yeh bhoolna ki CPE apne port set ke andar abhi bhi NAT44 chalata hai; aur subscriber profile ke liye sharing ratio bahut zyaada chunna.</p></div>
<div class="exam"><p><b>Exam trap.</b> MAP-E = encapsulation, MAP-T = translation, same BMR/FMR/DMR rules. DS-Lite AFTR ke saath stateful hai; MAP stateless hai. Dono IPv6-only access technologies hain.</p></div>

<div class="scn"><h4>Regulator poochta hai public address kisne use kiya</h4><p>Stateful CGNAT chalane wale operator ko ek time par public IPv4 address aur port se subscriber identify karne ka request mila. Use bahut bade flow log mein search karna pada. Padosi operator ne, jo MAP-T par tha, port se PSID calculate karke rule se subscriber dhoondh liya, per-flow log ki zaroorat nahi padi.</p><p><b>Lesson:</b> deterministic mapping compliance aur scale simple karta hai, fixed port ranges ki keemat par.</p></div>

<div class="iv"><p class="q">"MAP-T aur MAP-E mein kya farq hai, aur woh stateless kyun hain?"</p><p>Dono har subscriber ka IPv4 address aur port set rules (BMR, FMR, DMR) se compute karte hain, isliye per-flow table nahi chahiye. MAP-E IPv4 ko IPv6 mein encapsulate karta hai; MAP-T headers ko IPv6 mein translate karta hai. PSID aur port sets batao, aur fixed port ranges ka trade-off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAP ek IPv4 address ko subscribers mein share karta hai, har ek ko port set (PSID) dekar.</li>
<li>Rules: BMR, FMR, DMR; Border Relay IPv4 Internet se jodta hai.</li>
<li>MAP-E encapsulate karta hai (40 bytes jodta hai); MAP-T translate karta hai.</li>
<li>MAP path ke liye per-flow state ya logs nahi; BRs horizontally scale hote hain.</li>
<li>Trade-off: har subscriber ke liye fixed port range.</li>
</ul></div>
`}};export{e as default};