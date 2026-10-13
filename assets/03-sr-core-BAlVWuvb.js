var e={id:`sr-core`,h:{en:`The SR core: IS-IS, SIDs and the label table`,hi:`SR core: IS-IS, SIDs aur label table`},body:{en:`
<p>A good road network needs signposts at every junction. In our provider, IS-IS does two jobs at once: it builds the map of the roads and it hands out the signposts, which are the prefix SIDs. With that done, PE1 can reach PE2 by pushing a single label.</p>

<h3>Configuration of one core router</h3>
<pre class="code"><span class="c">! P1, loopback 10.0.255.2, index 2</span>
interface Loopback0
 ip address 10.0.255.2 255.255.255.255
 ip router isis
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.2/32 index 2 range 1
  exit-address-family
router isis
 net 49.0100.0000.0000.0002.00
 is-type level-2-only
 metric-style wide
 segment-routing mpls
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point</pre>
<p>The loopback must be inside IS-IS (<code>ip router isis</code>); otherwise nobody learns the prefix and nobody learns its SID. The same pattern applies on every router, changing only the address, NET and index.</p>

<h3>The slow link</h3>
<p>The P2 to P3 link has IS-IS metric 100, other links the default. Shortest-path first therefore sends PE1 traffic towards PE2 over P1, the top path. The bottom path stays as the alternative, used only when the top path fails or is protected by TI-LFA.</p>

<h3>Reading the label table</h3>
<pre class="out">PE1# show mpls forwarding-table
Local  Outgoing  Prefix          Next hop
16002  Pop       10.0.255.2/32   10.0.12.2
16003  Pop       10.0.255.3/32   10.0.13.3
<span class="hl">16005  16005     10.0.255.5/32   10.0.12.2</span>
16004  16004     10.0.255.4/32   10.0.12.2</pre>
<p>Pop for P1 and P2 is "penultimate hop popping": the last transit router removes the label for the neighbour, so the egress does less work. For distant routers the label is swapped for the same value, which is the benefit of a common SRGB.</p>

<div class="eg"><b>Worked example.</b> PE1 sends to PE2: it looks up 16005 and sends the packet to P1 with label 16005. P1 sees 16005 on a prefix whose next hop is PE2, which is directly connected, so it pops and forwards. PE2 receives an unlabelled packet (or only the VPN label).</div>

<div class="warn"><b>Common mistake.</b> Leaving a loopback out of IS-IS. The router can ping its neighbours and BGP can still configure, but the neighbours have no route and no label to that loopback.</div>

<div class="exam"><b>Exam trap.</b> The prefix SID map is configured on the router that owns the loopback. Other routers learn it through IS-IS and never configure it for someone else's loopback.</div>

<div class="scn"><h4>The loopback that never joined</h4><p>PE2 was rebuilt and its Loopback0 came back without <code>ip router isis</code>. BGP stayed up on another path for a while, then flapped. On PE1 the route to 10.0.255.5 had disappeared. The engineer added the line, and within seconds IS-IS and the label returned.</p><p><b>Lesson:</b> after a rebuild, compare against a template that includes the loopback.</p></div>

<div class="iv"><p class="q">"How does a PE learn the label for another PE?"</p><p>Through IS-IS: the owning router advertises its prefix SID index; every other router adds it to its own SRGB base and installs the label. No LDP session is involved.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loopbacks must be in IS-IS to get labels.</li>
<li>Wide metrics and <code>segment-routing mpls</code> under IS-IS are mandatory.</li>
<li>The label table shows pop or swap with the same value.</li>
<li>Metric 100 on P2 to P3 makes the top path preferred.</li>
</ul></div>
`,hi:`
<p>Achhe road network ko har mod par signpost chahiye. Hamare provider mein IS-IS ek saath do kaam karta hai: sadkon ka naksha banata hai aur signposts, yaani prefix SIDs, baant-ta hai. Yeh ho jaaye to PE1 ek hi label push karke PE2 tak pahunch sakta hai.</p>

<h3>Ek core router ki configuration</h3>
<pre class="code"><span class="c">! P1, loopback 10.0.255.2, index 2</span>
interface Loopback0
 ip address 10.0.255.2 255.255.255.255
 ip router isis
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.2/32 index 2 range 1
  exit-address-family
router isis
 net 49.0100.0000.0000.0002.00
 is-type level-2-only
 metric-style wide
 segment-routing mpls
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point</pre>
<p>Loopback IS-IS ke andar hona chahiye (<code>ip router isis</code>); warna koi prefix nahi seekhta aur koi uska SID nahi seekhta. Yahi pattern har router par lagta hai, sirf address, NET aur index badalte hain.</p>

<h3>Dheema link</h3>
<p>P2 se P3 link ka IS-IS metric 100 hai, baaki links ka default. Isliye shortest-path first PE1 se PE2 ki traffic P1 ke raaste, upar wale path se, bhejta hai. Neeche wala path alternative rehta hai, jo sirf tab use hota hai jab upar wala path fail ho ya TI-LFA se protected ho.</p>

<h3>Label table padhna</h3>
<pre class="out">PE1# show mpls forwarding-table
Local  Outgoing  Prefix          Next hop
16002  Pop       10.0.255.2/32   10.0.12.2
16003  Pop       10.0.255.3/32   10.0.13.3
<span class="hl">16005  16005     10.0.255.5/32   10.0.12.2</span>
16004  16004     10.0.255.4/32   10.0.12.2</pre>
<p>P1 aur P2 ke liye Pop "penultimate hop popping" hai: aakhri transit router padosi ke liye label hata deta hai, taaki egress ka kaam kam ho. Door ke routers ke liye label wahi value se swap hota hai, jo common SRGB ka faayda hai.</p>

<div class="eg"><b>Worked example.</b> PE1 PE2 ko bhejta hai: woh 16005 dekhta hai aur packet P1 ko label 16005 ke saath bhejta hai. P1 dekhta hai ki 16005 ka next hop PE2 hai, jo directly connected hai, isliye pop karke forward karta hai. PE2 ko bina label wala packet (ya sirf VPN label) milta hai.</div>

<div class="warn"><b>Common mistake.</b> Loopback ko IS-IS se bahar chhod dena. Router padosiyon ko ping kar sakta hai aur BGP configure ho sakta hai, par padosiyon ke paas us loopback ka na route hota hai na label.</div>

<div class="exam"><b>Exam trap.</b> Prefix SID map us router par configure hota hai jo loopback ka maalik hai. Baaki routers use IS-IS se seekhte hain aur kisi aur ke loopback ke liye kabhi configure nahi karte.</div>

<div class="scn"><h4>Woh loopback jo kabhi join nahi hua</h4><p>PE2 dobara banaya gaya aur uska Loopback0 bina <code>ip router isis</code> ke wapas aaya. BGP kuch der doosre path par up raha, phir flap hua. PE1 par 10.0.255.5 ka route gaayab tha. Engineer ne line jodi, aur seconds mein IS-IS aur label wapas aa gaye.</p><p><b>Lesson:</b> rebuild ke baad aise template se compare karo jisme loopback shaamil ho.</p></div>

<div class="iv"><p class="q">"PE doosre PE ka label kaise seekhta hai?"</p><p>IS-IS se: maalik router apna prefix SID index advertise karta hai; har doosra router use apne SRGB base mein jodkar label install karta hai. Koi LDP session nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Labels ke liye loopbacks IS-IS mein hone chahiye.</li>
<li>Wide metrics aur IS-IS ke neeche <code>segment-routing mpls</code> zaroori hain.</li>
<li>Label table pop ya same value ka swap dikhati hai.</li>
<li>P2 se P3 par metric 100 upar wale path ko preferred banata hai.</li>
</ul></div>
`}};export{e as default};