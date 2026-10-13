var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Two label stack"><rect x="20" y="40" width="90" height="46" rx="8" fill="#bae6fd"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">PE1 push</text><rect x="270" y="40" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="315" y="68" text-anchor="middle" class="svg-ink" font-size="13">P swap/pop</text><rect x="530" y="40" width="90" height="46" rx="8" fill="#bae6fd"/><text x="575" y="68" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><line x1="110" y1="63" x2="270" y2="63" stroke="#64748b" stroke-width="2"/><line x1="360" y1="63" x2="530" y2="63" stroke="#64748b" stroke-width="2"/><rect x="125" y="95" width="130" height="26" rx="4" fill="#fde68a"/><text x="190" y="113" text-anchor="middle" class="svg-ink" font-size="11">`+t+`</text><rect x="125" y="125" width="130" height="26" rx="4" fill="#bbf7d0"/><text x="190" y="143" text-anchor="middle" class="svg-ink" font-size="11">`+n+`</text><rect x="385" y="110" width="130" height="26" rx="4" fill="#bbf7d0"/><text x="450" y="128" text-anchor="middle" class="svg-ink" font-size="11">`+n+`</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">`+r+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`mpbgp-vpnv4-labels`,h:{en:`MP-BGP VPNv4 and the two-label stack`,hi:`MP-BGP VPNv4 aur do-label stack`},body:{en:`
<p>VRFs are separate tables on each PE. Something must carry customer routes <i>between</i> PEs. That is <b>MP-BGP</b> (multiprotocol BGP): the same BGP, extended to carry more than IPv4 unicast. The VPN address family is <b>VPNv4</b>: RD plus IPv4 prefix, with extended communities (the RTs) and a <b>VPN label</b>.</p>

<h3>Configuration (lab 1, task 3)</h3>
<p>The iBGP session between the PE loopbacks already exists (from the BGP module). You activate the new address family on it:</p>
<pre class="code">router bgp 65000
 neighbor 10.0.255.3 remote-as 65000
 neighbor 10.0.255.3 update-source Loopback0
 <span class="c">!</span>
 address-family vpnv4
  neighbor 10.0.255.3 activate
  neighbor 10.0.255.3 send-community extended
 exit-address-family</pre>
<ul>
<li><b>activate</b> turns on the VPNv4 address family for that neighbour. Without it, the session carries no VPN routes.</li>
<li><b>send-community extended</b> carries the RTs. Without it the receiving PE gets routes with no RT and imports nothing. (On IOS XE, activating VPNv4 normally adds this automatically; it is explicit in the lab's fault because the broken PE had it removed.)</li>
<li>The next hop of VPNv4 routes is the PE's <b>loopback</b>, the BGP session source address. That is why PE loopbacks need LSPs.</li>
</ul>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.3      4       65000 ...  1</pre>
<p>The last column is the number of VPNv4 prefixes received from PE2.</p>

<h3>Reading the VPNv4 table</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all
     Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65000:1 (default for vrf CUST_A)
 *&gt;  172.16.1.0/24    192.168.1.2              0             0 65101 i
 *&gt;i 172.16.2.0/24    <span class="hl">10.0.255.3</span>               0    100      0 65102 i</pre>
<p>Both customer prefixes appear under RD 65000:1. The local one (172.16.1.0/24) has next hop CE1; the remote one has next hop 10.0.255.3, PE2's loopback, as <i>i</i> (iBGP). The VRF table then shows them with distances 20 (eBGP from the CE) and 200 (iBGP from PE2), as in chapter 1.</p>

<h3>The VPN label</h3>
<p>Each PE allocates a <b>VPN label</b> for the routes it exports and sends it in the VPNv4 update. The remote PE pushes this label on packets for that route, so the egress PE knows which VRF to look in without a lookup in the global table:</p>
<pre class="out">PE1# show bgp vpnv4 unicast all labels
   Network          Next Hop        In label/Out label
Route Distinguisher: 65000:1 (default for vrf CUST_A)
   172.16.1.0/24    192.168.1.2     <span class="hl">19</span>/nolabel
   172.16.2.0/24    10.0.255.3      nolabel/<span class="hl">19</span>

PE2# show bgp vpnv4 unicast all labels
   172.16.1.0/24    10.0.255.1      nolabel/19
   172.16.2.0/24    192.168.2.2     19/nolabel</pre>
<p>Read "In label/Out label": for PE1's own customer prefix 172.16.1.0/24 PE1 allocated <b>19</b> (the label it expects to receive from the core). For the remote prefix 172.16.2.0/24, the out label is 19, the label allocated by PE2. Both PEs happened to allocate 19; the numbers are local to each router.</p>

@@D@@

<h3>The two-label stack</h3>
<p>PE1 builds a packet for 172.16.2.10 with two labels:</p>
<ol>
<li><b>Outer (transport) label</b>: from LDP, to reach PE2's loopback 10.0.255.3. In the lab PE1's LFIB has <code>16  17  10.0.255.3/32  Gi0/0  10.0.12.2</code> (local 16, outgoing 17).</li>
<li><b>Inner (VPN) label</b>: 19, from the VPNv4 update. Selects the VRF at PE2.</li>
</ol>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           ...  Outgoing   Next Hop
16         17         10.0.255.3/32    ...  Gi0/0      10.0.12.2

P# show mpls forwarding-table
17         Pop Label  10.0.255.3/32    ...  Gi0/1      10.0.23.3</pre>
<p>The P router never looks inside: it sees label 17 and, as the penultimate hop, pops it (Pop Label). PE2 receives only the VPN label 19. This is why the lab capture question expects <b>2</b> labels on the PE1 to P hop, and only the VPN label on the P to PE2 hop.</p>

<div class="eg"><p><b>Worked example: follow a packet.</b> PC1 (172.16.1.10) pings PC2 (172.16.2.10). CE1 sends to PE1 in VRF CUST_A. PE1 finds 172.16.2.0/24 via 10.0.255.3 with VPN label 19, and the LSP to 10.0.255.3 with label 17. It pushes [17 | 19]. P swaps/pops 17. PE2 reads 19, finds the VRF CUST_A, and forwards the IP packet to CE2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>activate</code> in the vpnv4 family. Not sending extended communities. Using the VPN neighbour address from a link instead of a loopback. Forgetting that PE loopbacks (the BGP next hops) must have LSPs.</p></div>
<div class="exam"><p><b>Exam trap.</b> MP-BGP VPNv4 extends the <i>same</i> BGP session: no new session is needed, but the address family must be activated. Next hop self for VPNv4 is the PE loopback; the VPN label is a BGP-signalled label, not LDP.</p></div>

<div class="scn"><h4>VPNv4 routes arrive with no RT</h4><p>A PE reported "0 imported routes" even though PE2 advertised 40 prefixes. show bgp vpnv4 unicast all showed the prefixes but they were not in the VRF. The sending PE had send-community extended removed during a template change. Adding it back made the RTs reappear and the routes import.</p><p><b>Lesson:</b> VPNv4 without extended communities carries routes that nobody imports.</p></div>

<div class="iv"><p class="q">"What is carried in a VPNv4 update, and what does the packet look like?"</p><p>RD plus IPv4 prefix, extended communities with the RTs, the PE loopback as next hop and a VPN label. The packet then carries an outer LDP label to the remote PE loopback and an inner VPN label that selects the VRF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Activate the vpnv4 address family on the existing iBGP session.</li>
<li>send-community extended carries the route targets.</li>
<li>VPNv4 next hop is the PE loopback; the VPN label is BGP-assigned.</li>
<li>Packet: outer LDP label + inner VPN label across the core.</li>
<li>P routers swap or pop the outer label; they never see customer routes.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 pushes two labels; the P router pops the outer one.`,`outer: LDP 17`,`inner: VPN 19`,`PE1 to P carries 2 labels; P to PE2 carries 1`)),hi:`
<p>VRFs har PE par alag tables hain. Kisi ko customer routes PEs ke <i>beech</i> le jaana hai. Woh <b>MP-BGP</b> (multiprotocol BGP) hai: wahi BGP, IPv4 unicast se zyada carry karne ke liye extend kiya hua. VPN address family <b>VPNv4</b> hai: RD plus IPv4 prefix, extended communities (RTs) aur ek <b>VPN label</b> ke saath.</p>

<h3>Configuration (lab 1, task 3)</h3>
<p>PE loopbacks ke beech iBGP session pehle se hai (BGP module se). Aap us par naya address family activate karte ho:</p>
<pre class="code">router bgp 65000
 neighbor 10.0.255.3 remote-as 65000
 neighbor 10.0.255.3 update-source Loopback0
 <span class="c">!</span>
 address-family vpnv4
  neighbor 10.0.255.3 activate
  neighbor 10.0.255.3 send-community extended
 exit-address-family</pre>
<ul>
<li><b>activate</b> us neighbour ke liye VPNv4 address family on karta hai. Iske bina session koi VPN route carry nahi karta.</li>
<li><b>send-community extended</b> RTs carry karta hai. Iske bina receiving PE ko routes bina RT ke milte hain aur kuch import nahi hota. (IOS XE par vpnv4 activate karne se yeh aam taur par automatically jud jaata hai; lab ke fault mein explicit hai kyunki broken PE se hata diya gaya tha.)</li>
<li>VPNv4 routes ka next hop PE ka <b>loopback</b> hota hai, BGP session ka source address. Isiliye PE loopbacks ko LSPs chahiye.</li>
</ul>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.3      4       65000 ...  1</pre>
<p>Aakhri column PE2 se mile VPNv4 prefixes ki ginti hai.</p>

<h3>VPNv4 table padhna</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all
     Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65000:1 (default for vrf CUST_A)
 *&gt;  172.16.1.0/24    192.168.1.2              0             0 65101 i
 *&gt;i 172.16.2.0/24    <span class="hl">10.0.255.3</span>               0    100      0 65102 i</pre>
<p>Dono customer prefixes RD 65000:1 ke neeche dikhte hain. Local wale (172.16.1.0/24) ka next hop CE1 hai; remote wale ka next hop 10.0.255.3, PE2 ka loopback, <i>i</i> (iBGP) ke roop mein. VRF table unhe distances 20 (CE se eBGP) aur 200 (PE2 se iBGP) ke saath dikhati hai, jaise chapter 1 mein.</p>

<h3>VPN label</h3>
<p>Har PE apne export kiye routes ke liye ek <b>VPN label</b> allocate karta hai aur use VPNv4 update mein bhejta hai. Remote PE us route ke packets par yeh label push karta hai, taaki egress PE bina global table lookup ke jaan le ki kaunsa VRF dekhna hai:</p>
<pre class="out">PE1# show bgp vpnv4 unicast all labels
   Network          Next Hop        In label/Out label
Route Distinguisher: 65000:1 (default for vrf CUST_A)
   172.16.1.0/24    192.168.1.2     <span class="hl">19</span>/nolabel
   172.16.2.0/24    10.0.255.3      nolabel/<span class="hl">19</span>

PE2# show bgp vpnv4 unicast all labels
   172.16.1.0/24    10.0.255.1      nolabel/19
   172.16.2.0/24    192.168.2.2     19/nolabel</pre>
<p>"In label/Out label" padho: PE1 ke apne customer prefix 172.16.1.0/24 ke liye PE1 ne <b>19</b> allocate kiya (woh label jo woh core se receive karne ki ummeed rakhta hai). Remote prefix 172.16.2.0/24 ke liye out label 19 hai, jo PE2 ne allocate kiya. Dono PEs ne 19 hi allocate kiya; numbers har router ke liye local hain.</p>

@@D@@

<h3>Do-label stack</h3>
<p>PE1 172.16.2.10 ke liye packet do labels ke saath banata hai:</p>
<ol>
<li><b>Outer (transport) label</b>: LDP se, PE2 ke loopback 10.0.255.3 tak pahunchne ke liye. Lab mein PE1 ki LFIB mein <code>16  17  10.0.255.3/32  Gi0/0  10.0.12.2</code> hai (local 16, outgoing 17).</li>
<li><b>Inner (VPN) label</b>: 19, VPNv4 update se. PE2 par VRF chunta hai.</li>
</ol>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           ...  Outgoing   Next Hop
16         17         10.0.255.3/32    ...  Gi0/0      10.0.12.2

P# show mpls forwarding-table
17         Pop Label  10.0.255.3/32    ...  Gi0/1      10.0.23.3</pre>
<p>P router andar kabhi nahi dekhta: woh label 17 dekhta hai aur penultimate hop hone ke naate use pop kar deta hai (Pop Label). PE2 ko sirf VPN label 19 milta hai. Isiliye lab capture question PE1 se P wale hop par <b>2</b> labels ki ummeed karta hai, aur P se PE2 wale hop par sirf VPN label.</p>

<div class="eg"><p><b>Worked example: packet follow karo.</b> PC1 (172.16.1.10) PC2 (172.16.2.10) ko ping karta hai. CE1 VRF CUST_A mein PE1 ko bhejta hai. PE1 172.16.2.0/24 ko 10.0.255.3 ke through VPN label 19 ke saath paata hai, aur 10.0.255.3 tak LSP label 17 ke saath. Woh [17 | 19] push karta hai. P 17 swap/pop karta hai. PE2 19 padhta hai, VRF CUST_A dhoondhta hai, aur IP packet CE2 ko forward karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> vpnv4 family mein <code>activate</code> bhoolna. Extended communities na bhejna. Loopback ki jagah link ka VPN neighbour address use karna. Bhoolna ki PE loopbacks (BGP next hops) ke liye LSPs hone chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> MP-BGP VPNv4 <i>wahi</i> BGP session extend karta hai: naya session nahi chahiye par address family activate honi chahiye. VPNv4 ka next hop self PE loopback hai; VPN label BGP-signalled label hai, LDP nahi.</p></div>

<div class="scn"><h4>VPNv4 routes bina RT ke aate hain</h4><p>Ek PE ne "0 imported routes" report kiya jabki PE2 ne 40 prefixes advertise kiye. show bgp vpnv4 unicast all ne prefixes dikhaye par woh VRF mein nahi the. Sending PE se template change ke dauraan send-community extended hata diya gaya tha. Wapas jodne se RTs wapas aaye aur routes import hue.</p><p><b>Lesson:</b> extended communities ke bina VPNv4 aise routes carry karta hai jinhe koi import nahi karta.</p></div>

<div class="iv"><p class="q">"VPNv4 update mein kya hota hai, aur packet kaisa dikhta hai?"</p><p>RD plus IPv4 prefix, RTs wali extended communities, next hop ke roop mein PE loopback aur ek VPN label. Packet phir remote PE loopback tak bahar wala LDP label aur VRF chunne wala andar wala VPN label le jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Maujooda iBGP session par vpnv4 address family activate karo.</li>
<li>send-community extended route targets carry karta hai.</li>
<li>VPNv4 next hop PE loopback hai; VPN label BGP-assigned hai.</li>
<li>Packet: core ke paar outer LDP label + inner VPN label.</li>
<li>P routers bahar wala label swap ya pop karte hain; customer routes kabhi nahi dekhte.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 do labels push karta hai; P router bahar wala pop karta hai.`,`outer: LDP 17`,`inner: VPN 19`,`PE1 se P tak 2 labels; P se PE2 tak 1`))}};export{t as default};