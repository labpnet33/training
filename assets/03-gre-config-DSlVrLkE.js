var e={id:`gre-config`,h:{en:`Configuring a GRE tunnel (gr-0/0/0) step by step`,hi:`GRE tunnel (gr-0/0/0) step by step configure karna`},body:{en:`
<p>Now we build the first lab. Lucknow (R1) and Kanpur (R3) sit on opposite sides of a provider router called ISP. The provider only routes public addresses. Our job is a GRE tunnel between 203.0.113.1 and 203.0.113.9. Before the tunnel exists, the underlay must work, so we start there.</p>

<h3>Step 0: the underlay already works</h3>
<p>Each edge router has a WAN address on <code>ge-0/0/0</code> and a static default route towards the ISP. You can prove it first:</p>
<pre class="code"><span class="c">! R1: underlay check before any tunnel exists</span>
lab@R1&gt; show route 203.0.113.9
<span class="c">! expect the default route 0.0.0.0/0 via 203.0.113.2 (the ISP)</span></pre>
<pre class="out">inet.0: 10 destinations, 10 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">0.0.0.0/0          *[Static/5] 00:00:35
                    &gt;  to 203.0.113.2 via ge-0/0/0.0</span></pre>
<p>This is the lookup that the tunnel's outer packets will use. It goes out of <code>ge-0/0/0.0</code>, never through the tunnel. Keep that in mind for chapter 8.</p>

<h3>Step 1: configure R1</h3>
<pre class="code"><span class="c">! R1 (Lucknow)</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.1
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.9
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.1/30
commit</pre>
<ul>
<li><code>gr-0/0/0</code> is the physical-looking GRE interface. Junos creates it automatically on many platforms. On an MX-series router it comes from a PIC with tunnel services (<code>set chassis fpc 0 pic 0 tunnel-services bandwidth 1g</code>), which is why you may meet that line in real networks.</li>
<li><code>unit 0</code> is the logical interface you configure.</li>
<li><code>172.31.6.1/30</code> is the <b>overlay</b> address. A /30 gives exactly two usable addresses for a point-to-point link.</li>
</ul>

<h3>Step 2: the mirror image on R3</h3>
<pre class="code"><span class="c">! R3 (Kanpur): source and destination swapped, overlay .2</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.9
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.1
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.2/30
commit</pre>

<h3>Step 3: verify</h3>
<p>Ping across the overlay first, then read the interface detail:</p>
<pre class="out">lab@R1&gt; ping 172.31.6.2 count 3
PING 172.31.6.2 (172.31.6.2): 56 data bytes
64 bytes from 172.31.6.2: icmp_seq=0 ttl=64 time=2.000 ms
64 bytes from 172.31.6.2: icmp_seq=1 ttl=64 time=2.300 ms
64 bytes from 172.31.6.2: icmp_seq=2 ttl=64 time=2.600 ms
--- 172.31.6.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; show interfaces gr-0/0/0.0 detail
  Logical interface gr-0/0/0.0 (Index 340) (SNMP ifIndex 530)
    <span class="hl">Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header 203.0.113.9:203.0.113.1:47:df:64:0000000000000000 Encapsulation: GRE-NULL</span>
    <span class="hl">Tunnel source 203.0.113.1, destination 203.0.113.9, IP protocol 47 (GRE), TTL 64</span>
    <span class="hl">Tunnel state: Up (destination reachable via ge-0/0/0.0)</span>
    Protocol inet, MTU: 1476
      Addresses, Flags: Is-Preferred Is-Primary
        Destination: 172.31.6.0/30, Local: 172.31.6.1, Broadcast: 172.31.6.3</pre>

<h3>Reading the IP-Header field</h3>
<p>The long field after <code>IP-Header</code> reads <b>destination : source : protocol : flags : TTL : ...</b>. So <code>203.0.113.9:203.0.113.1:47:df:64</code> means: send to 203.0.113.9, from 203.0.113.1, IP protocol 47 (GRE), the Don't Fragment flag is set, and the TTL is 64. You can read the whole tunnel definition from this one line, which is handy in an exam.</p>
<p>Also look at the line <b>Tunnel state</b>. It tells you the tunnel destination is reachable and which underlay interface Junos will use. If you ever see the destination resolved through the tunnel itself, that is the recursive-routing trouble of chapter 8.</p>

<div class="eg"><p><b>Worked example.</b> You read <code>IP-Header 198.51.100.7:198.51.100.2:47:df:64</code> on a router. Source is 198.51.100.2, destination is 198.51.100.7, and the 47 says GRE. If the far router shows the same line with the two addresses swapped, the pair is correct.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>family inet address</code>. Without an overlay address the unit may come up, but there is nothing to ping or to run OSPF on. Another classic: pointing the destination at the ISP address (203.0.113.2) instead of the far router (203.0.113.9). The tunnel looks fine locally and never works end to end.</p></div>
<div class="exam"><p><b>Exam trap.</b> The unit is Up as soon as the tunnel destination is routable. It does not prove the far end exists. Only keepalives (next chapters) or a ping across the overlay prove two-way operation.</p></div>

<div class="scn"><h4>Up/up but no ping</h4><p>A new Kanpur branch showed <code>gr-0/0/0.0 up up</code> on R1, yet the ping to 172.31.6.2 timed out. The team compared both ends and found R3 had been configured with the overlay address but its tunnel source was a typo in the last octet, so R3 never accepted packets sent to 203.0.113.9. After correcting the source the ping succeeded at once.</p><p><b>Lesson:</b> a local Up state is not proof. Compare the IP-Header line on both routers.</p></div>

<div class="iv"><p class="q">"Show me the configuration for a GRE tunnel between two routers."</p><p>Set <code>tunnel source</code> to a local underlay address and <code>tunnel destination</code> to the far router's address under <code>interfaces gr-0/0/0 unit 0</code>, add a <code>family inet address</code> from a /30 for the overlay, and mirror it on the other router. Verify with <code>show interfaces gr-0/0/0.0 detail</code> and a ping across the overlay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check the underlay route to the destination first.</li>
<li>Tunnel source and destination go under <code>gr-0/0/0 unit 0</code>; mirror them on the far router.</li>
<li>The overlay address is a /30 on the tunnel unit.</li>
<li>The IP-Header field reads destination:source:protocol:flags:TTL.</li>
<li>A tunnel unit Up only means the destination is routable.</li>
</ul></div>
`,hi:`
<p>Ab hum pehla lab banate hain. Lucknow (R1) aur Kanpur (R3) ek provider router ISP ke dono taraf hain. Provider sirf public addresses route karta hai. Hamara kaam 203.0.113.1 aur 203.0.113.9 ke beech GRE tunnel banana hai. Tunnel banne se pehle underlay kaam karna chahiye, isliye wahin se shuru karte hain.</p>

<h3>Step 0: underlay pehle se kaam kar raha hai</h3>
<p>Har edge router ke <code>ge-0/0/0</code> par WAN address hai aur ISP ki taraf static default route. Pehle yeh saabit kar sakte ho:</p>
<pre class="code"><span class="c">! R1: tunnel se pehle underlay check</span>
lab@R1&gt; show route 203.0.113.9
<span class="c">! expect: default route 0.0.0.0/0 via 203.0.113.2 (ISP)</span></pre>
<pre class="out">inet.0: 10 destinations, 10 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">0.0.0.0/0          *[Static/5] 00:00:35
                    &gt;  to 203.0.113.2 via ge-0/0/0.0</span></pre>
<p>Tunnel ke outer packets yahi lookup use karenge. Yeh <code>ge-0/0/0.0</code> se nikalta hai, tunnel ke through kabhi nahi. Chapter 8 ke liye yeh yaad rakho.</p>

<h3>Step 1: R1 configure karo</h3>
<pre class="code"><span class="c">! R1 (Lucknow)</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.1
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.9
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.1/30
commit</pre>
<ul>
<li><code>gr-0/0/0</code> physical jaisa dikhne wala GRE interface hai. Kai platforms par Junos ise khud bana deta hai. MX-series router par yeh tunnel services wale PIC se aata hai (<code>set chassis fpc 0 pic 0 tunnel-services bandwidth 1g</code>), isliye real networks mein yeh line mil sakti hai.</li>
<li><code>unit 0</code> woh logical interface hai jo aap configure karte ho.</li>
<li><code>172.31.6.1/30</code> <b>overlay</b> address hai. /30 point-to-point link ke liye theek do usable addresses deta hai.</li>
</ul>

<h3>Step 2: R3 par mirror image</h3>
<pre class="code"><span class="c">! R3 (Kanpur): source aur destination ulte, overlay .2</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.9
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.1
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.2/30
commit</pre>

<h3>Step 3: verify karo</h3>
<p>Pehle overlay par ping karo, phir interface detail padho:</p>
<pre class="out">lab@R1&gt; ping 172.31.6.2 count 3
PING 172.31.6.2 (172.31.6.2): 56 data bytes
64 bytes from 172.31.6.2: icmp_seq=0 ttl=64 time=2.000 ms
64 bytes from 172.31.6.2: icmp_seq=1 ttl=64 time=2.300 ms
64 bytes from 172.31.6.2: icmp_seq=2 ttl=64 time=2.600 ms
--- 172.31.6.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; show interfaces gr-0/0/0.0 detail
  Logical interface gr-0/0/0.0 (Index 340) (SNMP ifIndex 530)
    <span class="hl">Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header 203.0.113.9:203.0.113.1:47:df:64:0000000000000000 Encapsulation: GRE-NULL</span>
    <span class="hl">Tunnel source 203.0.113.1, destination 203.0.113.9, IP protocol 47 (GRE), TTL 64</span>
    <span class="hl">Tunnel state: Up (destination reachable via ge-0/0/0.0)</span>
    Protocol inet, MTU: 1476
      Addresses, Flags: Is-Preferred Is-Primary
        Destination: 172.31.6.0/30, Local: 172.31.6.1, Broadcast: 172.31.6.3</pre>

<h3>IP-Header field padhna</h3>
<p><code>IP-Header</code> ke baad ka lamba field <b>destination : source : protocol : flags : TTL : ...</b> padhta hai. To <code>203.0.113.9:203.0.113.1:47:df:64</code> ka matlab: 203.0.113.9 ko bhejo, 203.0.113.1 se, IP protocol 47 (GRE), Don't Fragment flag set hai, aur TTL 64 hai. Is ek line se poora tunnel definition padh sakte ho, jo exam mein kaam aata hai.</p>
<p><b>Tunnel state</b> line bhi dekho. Yeh batati hai ki tunnel destination reachable hai aur Junos kaunsa underlay interface use karega. Kabhi destination tunnel ke through hi resolve dikhe to yeh chapter 8 ki recursive-routing problem hai.</p>

<div class="eg"><p><b>Worked example.</b> Router par <code>IP-Header 198.51.100.7:198.51.100.2:47:df:64</code> dikhta hai. Source 198.51.100.2, destination 198.51.100.7, aur 47 matlab GRE. Far router par wahi line dono addresses ulte ke saath dikhe to jodi sahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>family inet address</code> bhool jaana. Overlay address ke bina unit up aa sakta hai, lekin ping karne ya OSPF chalane ko kuch nahi hota. Ek aur classic: destination ko far router (203.0.113.9) ki jagah ISP address (203.0.113.2) par point kar dena. Tunnel local par theek dikhta hai aur end to end kabhi kaam nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel destination routable hote hi unit Up ho jaata hai. Yeh saabit nahi karta ki far end maujood hai. Do-taraf ka kaam sirf keepalives (aage ke chapters) ya overlay par ping se saabit hota hai.</p></div>

<div class="scn"><h4>Up/up lekin ping nahi</h4><p>Naye Kanpur branch par R1 par <code>gr-0/0/0.0 up up</code> dikha, phir bhi 172.31.6.2 ka ping timeout hua. Team ne dono ends compare kiye to R3 par overlay address to tha lekin tunnel source mein aakhri octet ka typo tha, isliye R3 ne 203.0.113.9 par bheje gaye packets kabhi accept nahi kiye. Source theek karte hi ping turant chal gaya.</p><p><b>Lesson:</b> local Up state saboot nahi hai. Dono routers par IP-Header line compare karo.</p></div>

<div class="iv"><p class="q">"Do routers ke beech GRE tunnel ki configuration dikhao."</p><p><code>interfaces gr-0/0/0 unit 0</code> ke neeche <code>tunnel source</code> ko local underlay address par aur <code>tunnel destination</code> ko far router ke address par set karo, overlay ke liye /30 se <code>family inet address</code> jodo, aur doosre router par mirror karo. <code>show interfaces gr-0/0/0.0 detail</code> aur overlay par ping se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle destination tak ka underlay route check karo.</li>
<li>Tunnel source aur destination <code>gr-0/0/0 unit 0</code> ke neeche jaate hain; far router par mirror karo.</li>
<li>Overlay address tunnel unit par /30 hota hai.</li>
<li>IP-Header field destination:source:protocol:flags:TTL padhta hai.</li>
<li>Tunnel unit Up ka matlab sirf destination routable hai.</li>
</ul></div>
`}};export{e as default};