var e={id:`enabling-ospf`,h:{en:`Enabling OSPF on Junos: interfaces, areas and passive`,hi:`Junos par OSPF enable karna: interfaces, areas aur passive`},body:{en:`
<p>Junos configures OSPF differently from some other vendors. You do not type a list of networks. Instead you list <b>logical interfaces</b> inside an <b>area</b>. OSPF then runs on each listed interface and advertises that interface's subnet. This is easier to read and harder to get wrong once you understand it.</p>

<h3>The four ingredients</h3>
<ol>
<li><b>A working interface.</b> The port must be up and the unit must have an IP address. A disabled port or one with no cable never forms a neighbour.</li>
<li><b>A router ID.</b> Set it under <code>routing-options</code>, using the loopback address by convention.</li>
<li><b>An area.</b> A group of routers that share a database. Area 0 (written 0.0.0.0 in Junos output) is the <b>backbone</b>. A small network is one single area 0.</li>
<li><b>The interface in that area.</b> Use the full logical name with the unit: <code>ge-0/0/0.0</code>, never just <code>ge-0/0/0</code>.</li>
</ol>

<h3>Worked example: bringing R1 into the Indore network</h3>
<p>R3 and R4 already run OSPF in area 0. R1 has two uplinks (ge-0/0/0 to R2, ge-0/0/1 to R3), a staff LAN on ge-0/0/2 (192.168.40.0/24) and a loopback 10.255.4.1/32.</p>
<pre class="code">set routing-options router-id 10.255.4.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0
set protocols ospf area 0.0.0.0 interface ge-0/0/2.0 passive
set protocols ospf area 0.0.0.0 interface lo0.0 passive
commit</pre>
<p>The same thing shown as a hierarchy, which is what you see with <code>show protocols ospf</code>:</p>
<pre class="out">lab@R1-INDORE&gt; show configuration protocols ospf
area 0.0.0.0 {
    interface ge-0/0/0.0;
    interface ge-0/0/1.0;
    interface ge-0/0/2.0 {
        passive;
    }
    interface lo0.0 {
        passive;
    }
}
</pre>
<p>R2 gets the same pattern with router ID 10.255.4.2: its ge-0/0/0.0 (towards R1) and ge-0/0/1.0 (towards R4) as normal OSPF interfaces, and lo0.0 passive.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Active versus passive interfaces">
<rect x="230" y="60" width="180" height="80" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 (area 0)</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">RID 10.255.4.1</text>
<rect x="10" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/0.0 active</text>
<rect x="10" y="130" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="12">R3</text><text x="85" y="168" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/1.0 active</text>
<rect x="470" y="20" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="12">Staff LAN 192.168.40.0/24</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/2.0 passive</text>
<rect x="470" y="130" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="152" text-anchor="middle" class="svg-ink" font-size="12">Loopback 10.255.4.1/32</text><text x="550" y="168" text-anchor="middle" class="svg-muted" font-size="10">lo0.0 passive</text>
<line x1="160" y1="45" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="160" y1="155" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="470" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="410" y1="120" x2="470" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Solid lines: OSPF hellos are sent. Dashed lines: passive, subnet advertised but no hellos.</p></div>

<h3>What passive means</h3>
<p>A <b>passive</b> interface advertises its subnet into OSPF but sends no hellos and forms no neighbour. Use it on:</p>
<ul>
<li>the <b>loopback</b>, which has no neighbours anyway, so that the router ID address is reachable by everyone;</li>
<li>every <b>LAN that holds only hosts</b>, such as the staff LAN, so that nobody can attach a rogue router that joins OSPF, and so that no useless hello traffic leaves towards the PCs.</li></ul>
<p>Do not set passive on a link to another router, or the adjacency will never form.</p>

<h3>Verifying and the route that appears</h3>
<pre class="out">lab@R4-INDORE&gt; show route protocol ospf
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.4.12.0/30       *[OSPF/10] 00:01:06, metric 2
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
10.4.13.0/30       *[OSPF/10] 00:01:40, metric 2
                    &gt;  to 10.4.34.1 via ge-0/0/1.0
10.255.4.1/32      *[OSPF/10] 00:00:26, metric 2
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
                       to 10.4.34.1 via ge-0/0/1.0
10.255.4.2/32      *[OSPF/10] 00:01:06, metric 1
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
10.255.4.3/32      *[OSPF/10] 00:01:40, metric 1
                    &gt;  to 10.4.34.1 via ge-0/0/1.0
<span class="hl">192.168.40.0/24    *[OSPF/10] 00:00:26, metric 3</span>
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
                       to 10.4.34.1 via ge-0/0/1.0
224.0.0.5/32       *[OSPF/10] 00:01:40, metric 1
                       MultiRecv
</pre>
<p>The route 224.0.0.5/32 with MultiRecv is the router listening for OSPF multicast. Seeing it proves OSPF is enabled. The staff LAN arrives with two next hops because both paths cost the same. From the PC, <code>ping 172.16.44.10</code> proves the whole chain.</p>

<h3>Useful related commands</h3>
<ul>
<li><code>set protocols ospf area 0 interface all</code> would enable every interface. It is convenient in a lab but dangerous in production because new ports join OSPF automatically.</li>
<li><code>show configuration | display set</code> prints the configuration as set commands.</li>
<li><code>run show ospf neighbor</code> lets you run an operational command from configuration mode.</li>
<li><code>delete protocols ospf area 0.0.0.1</code> removes an area stanza, as in the Indore monitoring lab fix.</li></ul>

<div class="warn"><p><b>Common mistakes.</b> Writing <code>interface ge-0/0/0</code> without the unit .0. Forgetting to mark the LAN passive, so hello packets leak to hosts. Forgetting <code>router-id</code>, so the ID changes unpredictably. Putting a router link in a different area than the neighbour uses.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos enables OSPF per interface inside an area, not with network statements and wildcard masks. The backbone is area 0 / 0.0.0.0. Passive interfaces are still advertised. The OSPF configuration lives under <code>protocols ospf</code>, and the router ID under <code>routing-options</code>.</p></div>

<div class="scn"><h4>The LAN nobody could reach</h4><p>An engineer added OSPF to a new router and every neighbour came up Full, but PCs on the new LAN could not be reached from other sites. The LAN interface had never been placed in any OSPF area, so its subnet was not advertised. Adding <code>set protocols ospf area 0 interface ge-0/0/2.0 passive</code> made the route appear everywhere within seconds.</p><p><b>Lesson:</b> a Full neighbour proves the link works; the LAN still has to be in OSPF to be advertised.</p></div>

<div class="iv"><p class="q">"How do you enable OSPF in Junos and what does passive do?"</p><p>Set the router ID under routing-options, then place each logical interface in an area under protocols ospf, for example area 0.0.0.0 interface ge-0/0/0.0. Passive advertises the interface subnet without sending hellos or forming neighbours; use it for loopbacks and host LANs. Verify with show ospf interface, show ospf neighbor and show route protocol ospf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos lists logical interfaces (with unit) inside an area; there are no network statements.</li>
<li>Set the router ID under routing-options, from the loopback.</li>
<li>passive advertises a subnet without hellos: use on loopbacks and host LANs.</li>
<li>Area 0 equals 0.0.0.0, the backbone.</li>
<li>Verify with show ospf neighbor, show route protocol ospf and a ping.</li>
</ul></div>
`,hi:`
<p>Junos OSPF ko kuch doosre vendors se alag tarah configure karta hai. Aap networks ki list type nahi karte. Iski jagah aap <b>logical interfaces</b> ko ek <b>area</b> ke andar list karte ho. OSPF phir har listed interface par chalta hai aur us interface ka subnet advertise karta hai. Ek baar samajh lo to yeh padhna aasaan aur galti karna mushkil hai.</p>

<h3>Chaar ingredients</h3>
<ol>
<li><b>Chalta hua interface.</b> Port up ho aur unit par IP address ho. Disabled port ya bina cable wala port kabhi neighbour nahi banata.</li>
<li><b>Router ID.</b> <code>routing-options</code> ke neeche set karo, convention se loopback address.</li>
<li><b>Area.</b> Routers ka group jo database share karta hai. Area 0 (Junos output mein 0.0.0.0) <b>backbone</b> hai. Chhota network ek hi area 0 hota hai.</li>
<li><b>Us area mein interface.</b> Poora logical naam unit ke saath: <code>ge-0/0/0.0</code>, sirf <code>ge-0/0/0</code> nahi.</li>
</ol>

<h3>Worked example: R1 ko Indore network mein laana</h3>
<p>R3 aur R4 pehle se area 0 mein OSPF chala rahe hain. R1 ke paas do uplinks (ge-0/0/0 R2 ko, ge-0/0/1 R3 ko), ge-0/0/2 par staff LAN (192.168.40.0/24) aur loopback 10.255.4.1/32 hai.</p>
<pre class="code">set routing-options router-id 10.255.4.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0
set protocols ospf area 0.0.0.0 interface ge-0/0/2.0 passive
set protocols ospf area 0.0.0.0 interface lo0.0 passive
commit</pre>
<p>Wahi hierarchy ke roop mein, jo <code>show protocols ospf</code> se dikhta hai:</p>
<pre class="out">lab@R1-INDORE&gt; show configuration protocols ospf
area 0.0.0.0 {
    interface ge-0/0/0.0;
    interface ge-0/0/1.0;
    interface ge-0/0/2.0 {
        passive;
    }
    interface lo0.0 {
        passive;
    }
}
</pre>
<p>R2 ko router ID 10.255.4.2 ke saath wahi pattern milta hai: ge-0/0/0.0 (R1 ki taraf) aur ge-0/0/1.0 (R4 ki taraf) normal OSPF interfaces, aur lo0.0 passive.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Active versus passive interfaces">
<rect x="230" y="60" width="180" height="80" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 (area 0)</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">RID 10.255.4.1</text>
<rect x="10" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/0.0 active</text>
<rect x="10" y="130" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="12">R3</text><text x="85" y="168" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/1.0 active</text>
<rect x="470" y="20" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="12">Staff LAN 192.168.40.0/24</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="10">ge-0/0/2.0 passive</text>
<rect x="470" y="130" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="152" text-anchor="middle" class="svg-ink" font-size="12">Loopback 10.255.4.1/32</text><text x="550" y="168" text-anchor="middle" class="svg-muted" font-size="10">lo0.0 passive</text>
<line x1="160" y1="45" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="160" y1="155" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="470" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="410" y1="120" x2="470" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Solid lines: OSPF hellos bhejte hain. Dashed lines: passive, subnet advertise hota hai lekin hellos nahi.</p></div>

<h3>Passive ka matlab</h3>
<p><b>Passive</b> interface apna subnet OSPF mein advertise karta hai lekin hellos nahi bhejta aur neighbour nahi banata. Isse use karo:</p>
<ul>
<li><b>loopback</b> par, jiska koi neighbour hota hi nahi, taaki router ID wala address sabko reachable ho;</li>
<li>har <b>LAN par jisme sirf hosts hain</b>, jaise staff LAN, taaki koi rogue router attach karke OSPF join na kar sake, aur PCs ki taraf bekaar hello traffic na jaaye.</li></ul>
<p>Doosre router ke link par passive mat lagao, warna adjacency kabhi nahi banegi.</p>

<h3>Verify karna aur jo route dikhta hai</h3>
<pre class="out">lab@R4-INDORE&gt; show route protocol ospf
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.4.12.0/30       *[OSPF/10] 00:01:06, metric 2
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
10.4.13.0/30       *[OSPF/10] 00:01:40, metric 2
                    &gt;  to 10.4.34.1 via ge-0/0/1.0
10.255.4.1/32      *[OSPF/10] 00:00:26, metric 2
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
                       to 10.4.34.1 via ge-0/0/1.0
10.255.4.2/32      *[OSPF/10] 00:01:06, metric 1
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
10.255.4.3/32      *[OSPF/10] 00:01:40, metric 1
                    &gt;  to 10.4.34.1 via ge-0/0/1.0
<span class="hl">192.168.40.0/24    *[OSPF/10] 00:00:26, metric 3</span>
                    &gt;  to 10.4.24.1 via ge-0/0/0.0
                       to 10.4.34.1 via ge-0/0/1.0
224.0.0.5/32       *[OSPF/10] 00:01:40, metric 1
                       MultiRecv
</pre>
<p>MultiRecv wala route 224.0.0.5/32 router ka OSPF multicast sunna hai. Yeh dikhna saabit karta hai ki OSPF enabled hai. Staff LAN do next hops ke saath aata hai kyunki dono paths ka cost barabar hai. PC se <code>ping 172.16.44.10</code> poori chain saabit karta hai.</p>

<h3>Kaam ke related commands</h3>
<ul>
<li><code>set protocols ospf area 0 interface all</code> har interface enable kar deta hai. Lab mein convenient hai lekin production mein khatarnak kyunki naye ports apne aap OSPF join karte hain.</li>
<li><code>show configuration | display set</code> configuration ko set commands ke roop mein print karta hai.</li>
<li><code>run show ospf neighbor</code> configuration mode se operational command chalane deta hai.</li>
<li><code>delete protocols ospf area 0.0.0.1</code> area stanza hata deta hai, jaise Indore monitoring lab fix mein.</li></ul>

<div class="warn"><p><b>Common mistakes.</b> Unit .0 ke bina <code>interface ge-0/0/0</code> likhna. LAN ko passive karna bhool jaana, jisse hello packets hosts tak leak hote hain. <code>router-id</code> bhool jaana, jisse ID unpredictably badalta hai. Router link ko neighbour ke area se alag area mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos OSPF ko area ke andar per interface enable karta hai, network statements aur wildcard masks se nahi. Backbone area 0 / 0.0.0.0 hai. Passive interfaces phir bhi advertise hote hain. OSPF configuration <code>protocols ospf</code> ke neeche rehti hai, aur router ID <code>routing-options</code> ke neeche.</p></div>

<div class="scn"><h4>Woh LAN jis tak koi nahi pahunch paya</h4><p>Ek engineer ne naye router par OSPF lagaya aur har neighbour Full ho gaya, lekin naye LAN ke PCs doosre sites se reachable nahi the. LAN interface kisi OSPF area mein rakha hi nahi gaya tha, isliye uska subnet advertise nahi hua. <code>set protocols ospf area 0 interface ge-0/0/2.0 passive</code> lagane se route seconds mein har jagah dikhne laga.</p><p><b>Lesson:</b> Full neighbour saabit karta hai ki link kaam karta hai; LAN ko advertise hone ke liye phir bhi OSPF mein hona padta hai.</p></div>

<div class="iv"><p class="q">"Junos mein OSPF kaise enable karte ho aur passive kya karta hai?"</p><p>Router ID routing-options ke neeche set karo, phir har logical interface ko protocols ospf ke neeche area mein rakho, jaise area 0.0.0.0 interface ge-0/0/0.0. Passive interface subnet ko hellos bhejne ya neighbour banane ke bina advertise karta hai; loopbacks aur host LANs ke liye use karo. show ospf interface, show ospf neighbor aur show route protocol ospf se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos area ke andar logical interfaces (unit ke saath) list karta hai; network statements nahi hote.</li>
<li>Router ID routing-options ke neeche set karo, loopback se.</li>
<li>passive hellos ke bina subnet advertise karta hai: loopbacks aur host LANs par use karo.</li>
<li>Area 0 matlab 0.0.0.0, backbone.</li>
<li>show ospf neighbor, show route protocol ospf aur ping se verify karo.</li>
</ul></div>
`}};export{e as default};