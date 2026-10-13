var e={id:`supernetting-lab`,h:{en:`Supernetting and a full walkthrough of the office build`,hi:`Supernetting aur office build ka poora walkthrough`},body:{en:`
<p>Subnetting cuts a block into smaller pieces. <b>Supernetting</b> (also called summarisation or aggregation) does the opposite: it joins contiguous networks into one shorter prefix. Fewer routes mean smaller routing tables and faster convergence. In this chapter you learn the rule, then follow the complete first lab step by step: gateways, uplink, default route and summary route.</p>

<h3>How to summarise</h3>
<p>Write the networks in binary and count the leading bits that are identical in all of them. That count is the summary prefix length. Example: the three Nashik networks are 10.50.0.0/25, 10.50.0.128/26 and 10.50.0.192/30. The first three octets are identical, and in the last octet the highest bit changes (0 and 1 appear), so only the first 24 bits are shared. The summary is <b>10.50.0.0/24</b>.</p>
<p>A second example for practice: 172.16.4.0/24, 172.16.5.0/24, 172.16.6.0/24 and 172.16.7.0/24. The third octets are 4 to 7: 00000100, 00000101, 00000110 and 00000111. The first six bits (000001) are shared, so the prefix is 16 + 6 = 22 and the summary is <b>172.16.4.0/22</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Summarising networks that are not contiguous. 172.16.4.0/24 and 172.16.6.0/24 summarise to 172.16.4.0/23 only if .5 is also yours; otherwise the summary would advertise addresses you do not own and attract traffic into a black hole.</p></div>

<h3>The lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Nashik topology">
<rect x="260" y="10" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">R1 (edge)</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="11">lo0 198.51.100.1</text>
<rect x="260" y="110" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">SW1 (EX)</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="11">irb.10  irb.20</text>
<rect x="100" y="205" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="175" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.50.0.20/25</text><text x="175" y="241" text-anchor="middle" class="svg-muted" font-size="11">VLAN SALES</text>
<rect x="390" y="205" width="150" height="44" rx="8" fill="#fde68a"/><text x="465" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC2 10.50.0.140/26</text><text x="465" y="241" text-anchor="middle" class="svg-muted" font-size="11">VLAN ENG</text>
<line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="290" y1="154" x2="175" y2="205" stroke="#64748b" stroke-width="2"/><line x1="350" y1="154" x2="465" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="332" y="86" class="svg-accent" font-size="12">10.50.0.192/30 (.194 R1, .193 SW1)</text>
</svg><p class="cap">R1 and SW1 share the /30 uplink. SW1 holds the two VLAN gateways.</p></div>

<h3>Step 1: the gateways</h3>
<pre class="code">lab@SW1&gt; configure
lab@SW1# set interfaces irb unit 10 family inet address 10.50.0.1/25
lab@SW1# set interfaces irb unit 20 family inet address 10.50.0.129/26
lab@SW1# set vlans SALES l3-interface irb.10
lab@SW1# set vlans ENG l3-interface irb.20</pre>

<h3>Step 2: the routed uplink</h3>
<p>R1 already has 10.50.0.194/30 on ge-0/0/0. SW1 takes the other usable address, .193. A routed port on EX uses <code>family inet</code> instead of <code>ethernet-switching</code>:</p>
<pre class="code">lab@SW1# set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.193/30
lab@SW1# commit
lab@SW1# run ping 10.50.0.194 count 3
PING 10.50.0.194 (10.50.0.194): 56 data bytes
64 bytes from 10.50.0.194: icmp_seq=0 ttl=64 time=0.9 ms
--- 10.50.0.194 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss</pre>

<h3>Step 3: routing in both directions</h3>
<p>SW1 does not know the outside world, so it needs a <b>default route</b> to R1. R1 does not know the office subnets, so it needs a route back. One summary route covers all three:</p>
<pre class="code"><span class="c">! on SW1</span>
set routing-options static route 0.0.0.0/0 next-hop 10.50.0.194
<span class="c">! on R1</span>
set routing-options static route 10.50.0.0/24 next-hop 10.50.0.193</pre>
<pre class="out">lab@R1&gt; show route 10.50.0.0/24
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
<span class="hl">10.50.0.0/24        *[Static/5] 00:00:31
                    &gt;  to 10.50.0.193 via ge-0/0/0.0</span></pre>

<h3>Step 4: verify end to end</h3>
<p>From PC1 and PC2: <code>ping 198.51.100.1</code> must succeed. If a ping fails, the question "which direction is broken?" decides what to check: the outbound path needs the default route on SW1, the return path needs the summary on R1.</p>

<div class="eg"><p><b>Longest match in practice.</b> R1 now has 10.50.0.0/24 (Static) and 10.50.0.192/30 (Direct). To reach 10.50.0.193 it uses <b>10.50.0.192/30</b>, the longer and more specific prefix. To reach PC1 at 10.50.0.20 only the /24 matches. We study this rule fully in the next chapter.</p></div>

<div class="scn"><h4>One route instead of forty</h4><p>A company with 40 small branch /24 networks 10.60.0.0 to 10.60.39.0 allocated sequentially advertised each one to headquarters. Routing tables were large and changes reached every router. The team reallocated the space in aligned blocks and summarised each region: 10.60.0.0/21, 10.60.8.0/21 and so on. Headquarters needed only a handful of routes and a flapping branch no longer disturbed everybody.</p><p><b>Lesson:</b> plan addresses in aligned, contiguous blocks so that they summarise.</p></div>

<div class="iv"><p class="q">"Why summarise routes, and what is the risk?"</p><p>Summaries shrink routing tables, reduce update load and hide flaps. The risk is summarising addresses you do not fully own, which can black-hole traffic; the more specific routes inside, where they exist, still win by longest match.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supernetting joins contiguous networks into a shorter prefix; count the shared leading bits.</li>
<li>10.50.0.0/25 + /26 + /30 summarise to 10.50.0.0/24; 172.16.4-7.0/24 summarise to 172.16.4.0/22.</li>
<li>A routed uplink on EX uses family inet; irb units plus l3-interface build VLAN gateways.</li>
<li>Traffic needs a route in both directions: default on SW1, summary on R1.</li>
<li>Verify with ping from the PCs and show route.</li>
</ul></div>
`,hi:`
<p>Subnetting ek block ko chhote tukdon mein kaatti hai. <b>Supernetting</b> (summarisation ya aggregation bhi kehte hain) ulta karti hai: lagaataar networks ko ek chhote prefix mein jodti hai. Kam routes ka matlab chhoti routing table aur tez convergence. Is chapter mein aap rule seekhoge, phir poora pehla lab step by step follow karoge: gateways, uplink, default route aur summary route.</p>

<h3>Summarise kaise karein</h3>
<p>Networks ko binary mein likho aur ginno ki shuru ke kitne bits sab mein same hain. Wahi ginti summary prefix length hai. Example: teen Nashik networks hain 10.50.0.0/25, 10.50.0.128/26 aur 10.50.0.192/30. Pehle teen octets same hain, aur aakhri octet mein sabse upar ka bit badalta hai (0 aur 1 dono aate hain), to sirf pehle 24 bits shared hain. Summary hai <b>10.50.0.0/24</b>.</p>
<p>Practice ke liye doosra example: 172.16.4.0/24, 172.16.5.0/24, 172.16.6.0/24 aur 172.16.7.0/24. Third octets 4 se 7: 00000100, 00000101, 00000110 aur 00000111. Pehle chhe bits (000001) shared hain, to prefix 16 + 6 = 22 hai aur summary <b>172.16.4.0/22</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Aise networks ko summarise karna jo contiguous nahi hain. 172.16.4.0/24 aur 172.16.6.0/24 sirf tab 172.16.4.0/23 mein summarise hote hain jab .5 bhi aapka ho; warna summary woh addresses advertise karegi jo aapke nahi hain aur traffic ko black hole mein kheench legi.</p></div>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Nashik topology">
<rect x="260" y="10" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">R1 (edge)</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="11">lo0 198.51.100.1</text>
<rect x="260" y="110" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">SW1 (EX)</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="11">irb.10  irb.20</text>
<rect x="100" y="205" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="175" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.50.0.20/25</text><text x="175" y="241" text-anchor="middle" class="svg-muted" font-size="11">VLAN SALES</text>
<rect x="390" y="205" width="150" height="44" rx="8" fill="#fde68a"/><text x="465" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC2 10.50.0.140/26</text><text x="465" y="241" text-anchor="middle" class="svg-muted" font-size="11">VLAN ENG</text>
<line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="290" y1="154" x2="175" y2="205" stroke="#64748b" stroke-width="2"/><line x1="350" y1="154" x2="465" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="332" y="86" class="svg-accent" font-size="12">10.50.0.192/30 (.194 R1, .193 SW1)</text>
</svg><p class="cap">R1 aur SW1 /30 uplink share karte hain. SW1 ke paas dono VLAN gateways hain.</p></div>

<h3>Step 1: gateways</h3>
<pre class="code">lab@SW1&gt; configure
lab@SW1# set interfaces irb unit 10 family inet address 10.50.0.1/25
lab@SW1# set interfaces irb unit 20 family inet address 10.50.0.129/26
lab@SW1# set vlans SALES l3-interface irb.10
lab@SW1# set vlans ENG l3-interface irb.20</pre>

<h3>Step 2: routed uplink</h3>
<p>R1 par pehle se ge-0/0/0 par 10.50.0.194/30 hai. SW1 doosra usable address, .193, leta hai. EX par routed port <code>ethernet-switching</code> ki jagah <code>family inet</code> use karta hai:</p>
<pre class="code">lab@SW1# set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.193/30
lab@SW1# commit
lab@SW1# run ping 10.50.0.194 count 3
PING 10.50.0.194 (10.50.0.194): 56 data bytes
64 bytes from 10.50.0.194: icmp_seq=0 ttl=64 time=0.9 ms
--- 10.50.0.194 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss</pre>

<h3>Step 3: dono directions mein routing</h3>
<p>SW1 bahar ki duniya nahi jaanta, to use R1 ki taraf <b>default route</b> chahiye. R1 office subnets nahi jaanta, to use wapas ka route chahiye. Ek summary route teeno ko cover karta hai:</p>
<pre class="code"><span class="c">! SW1 par</span>
set routing-options static route 0.0.0.0/0 next-hop 10.50.0.194
<span class="c">! R1 par</span>
set routing-options static route 10.50.0.0/24 next-hop 10.50.0.193</pre>
<pre class="out">lab@R1&gt; show route 10.50.0.0/24
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
<span class="hl">10.50.0.0/24        *[Static/5] 00:00:31
                    &gt;  to 10.50.0.193 via ge-0/0/0.0</span></pre>

<h3>Step 4: end to end verify</h3>
<p>PC1 aur PC2 se: <code>ping 198.51.100.1</code> successful hona chahiye. Ping fail ho to "kaunsi direction toot-ti hai?" sawal tay karta hai kya check karna hai: bahar jaane ke liye SW1 par default route, wapas aane ke liye R1 par summary.</p>

<div class="eg"><p><b>Longest match practice mein.</b> R1 ke paas ab 10.50.0.0/24 (Static) aur 10.50.0.192/30 (Direct) hain. 10.50.0.193 tak pahunchne ke liye woh <b>10.50.0.192/30</b> use karta hai, jo lamba aur zyada specific prefix hai. PC1 (10.50.0.20) tak pahunchne ke liye sirf /24 match karta hai. Is rule ko agle chapter mein poori tarah dekhenge.</p></div>

<div class="scn"><h4>Chalis ki jagah ek route</h4><p>Ek company ne chalis chhote branch /24 networks 10.60.0.0 se 10.60.39.0 tak sequentially diye aur har ek headquarters ko advertise kiya. Routing tables bade the aur har change har router tak pahunchta tha. Team ne space ko aligned blocks mein dobara allocate kiya aur har region summarise kiya: 10.60.0.0/21, 10.60.8.0/21 aur aise. Headquarters ko sirf kuch routes chahiye the aur ek flapping branch ab sabko disturb nahi karta tha.</p><p><b>Lesson:</b> addresses ko aligned, contiguous blocks mein plan karo taaki woh summarise ho sakein.</p></div>

<div class="iv"><p class="q">"Routes summarise kyun karte hain, aur risk kya hai?"</p><p>Summaries routing tables chhoti karti hain, update load kam karti hain aur flaps chhupa deti hain. Risk hai aise addresses summarise karna jo poori tarah aapke nahi hain, jisse traffic black-hole ho sakta hai; andar ke more specific routes, jahan hain, longest match se phir bhi jeette hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supernetting contiguous networks ko chhote prefix mein jodti hai; shared leading bits gino.</li>
<li>10.50.0.0/25 + /26 + /30 = 10.50.0.0/24; 172.16.4-7.0/24 = 172.16.4.0/22.</li>
<li>EX par routed uplink family inet use karta hai; irb units aur l3-interface se VLAN gateways bante hain.</li>
<li>Traffic ko dono directions mein route chahiye: SW1 par default, R1 par summary.</li>
<li>PCs se ping aur show route se verify karo.</li>
</ul></div>
`}};export{e as default};