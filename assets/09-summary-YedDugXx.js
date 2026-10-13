var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a ring of five routers that only knew loopbacks. You now have a complete private network for two customer sites, carried over segment routing with no LDP, and a method for fixing it when it breaks. Like a pilot's pre-flight checklist, this chapter puts it all in one place for a lab, an exam or an interview.</p>

<h3>The complete build, in one view</h3>
<pre class="code"><span class="c">! Underlay (every router; index = router number)</span>
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.1/32 index 1 range 1
router isis
 is-type level-2-only
 metric-style wide
 segment-routing mpls
<span class="c">! VRF on each PE</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
<span class="c">! VPNv4 between PE loopbacks</span>
router bgp 65000
 address-family vpnv4
  neighbor 10.0.255.5 activate
  neighbor 10.0.255.5 send-community extended
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SRGB</dt><dd>Label range for prefix SIDs, 16000 to 23999.</dd>
<dt>Prefix SID</dt><dd>Global label: base plus index.</dd>
<dt>Adjacency SID</dt><dd>Local label for one link.</dd>
<dt>PHP</dt><dd>Penultimate hop popping: the last P removes the outer label.</dd>
<dt>RD / RT</dt><dd>Unique prefix tag / import and export tag.</dd>
<dt>TI-LFA</dt><dd>Pre-computed single-failure repair with a short stack.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>PE2 transport label: 16005. VPN label: allocated by PE2 per VRF.</li>
<li>The next hop of VPNv4 routes must be a labelled loopback.</li>
<li>BGP session up does not mean routes are exchanged with the RT.</li>
<li>"No Label" means look at the next hop.</li>
<li>Migrate from LDP in steps, verifying the VPN each time.</li>
</ul>

<h3>Checklist</h3>
<ul>
<li>I can build the underlay, VRFs, VPNv4 and PE-CE from scratch.</li>
<li>I can read the two-label stack and name each operation.</li>
<li>I can name the symptom for each of the eight faults in the table.</li>
<li>I can complete the labs sre-sr-vpn-build, -ts and -cities.</li>
<li>I can fix tickets INC270010 to INC270016 without hints.</li>
</ul>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor      V   AS  State/PfxRcd
<span class="hl">10.0.255.5   4  65000  1</span>
PE1# show mpls forwarding-table 10.0.255.5
<span class="hl">16005  16005  10.0.255.5/32</span></pre>

<div class="eg"><b>Worked example.</b> A third customer site PE3 is added: index 6, loopback 10.0.255.6, label 16006, VPNv4 session to the others, same RT 65000:1. Everything you need to do it appears in this recap.</div>

<div class="exam"><b>Exam trap.</b> A question may say "the SRGB is 16000 to 23999 and the index is 5000". 16000 + 5000 = 21000 is inside the range, so it is valid; but an index of 9000 would give 25000, outside the range, and the SID would not be installed.</div>

<div class="warn"><b>Common mistake.</b> Memorising commands without the layer they belong to. In an exam or incident the layer tells you where to look.</div>

<div class="scn"><h4>Onboarding a third site</h4><p>The operator added PE3 for a new branch. Because the labs had taught the pattern, the work took thirty minutes: index, IS-IS, VRF, VPNv4, PE-CE. The only surprise was a PE3 loopback that had not been added to IS-IS; the checklist caught it.</p><p><b>Lesson:</b> a pattern plus a checklist beats improvisation.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of L3VPN over SR."</p><p>Underlay: IS-IS SR gives each PE loopback a label. Overlay: VPNv4 between PEs carries customer routes tagged with RTs and VPN labels. Data plane: two labels, outer to reach the PE, inner to pick the VRF. Operations: verify labels, RTs and the CE routes, and protect with TI-LFA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay, VRFs, VPNv4, PE-CE: four building blocks.</li>
<li>Two labels, outer 16005 and inner VPN label.</li>
<li>Troubleshoot bottom up with the seven-step routine.</li>
<li>Practise with the labs, then with the tickets.</li>
</ul></div>
`,hi:`
<p>Aapne paanch routers ki ring se shuru kiya jo sirf loopbacks jaanti thi. Ab aapke paas do customer sites ke liye poora private network hai, segment routing par bina LDP ke, aur uske tootne par theek karne ka tareeka bhi. Pilot ki pre-flight checklist ki tarah, yeh chapter lab, exam ya interview ke liye sab ek jagah rakhta hai.</p>

<h3>Poora build, ek nazar mein</h3>
<pre class="code"><span class="c">! Underlay (har router; index = router number)</span>
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.1/32 index 1 range 1
router isis
 is-type level-2-only
 metric-style wide
 segment-routing mpls
<span class="c">! har PE par VRF</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
<span class="c">! PE loopbacks ke beech VPNv4</span>
router bgp 65000
 address-family vpnv4
  neighbor 10.0.255.5 activate
  neighbor 10.0.255.5 send-community extended
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SRGB</dt><dd>Prefix SIDs ke liye label range, 16000 se 23999.</dd>
<dt>Prefix SID</dt><dd>Global label: base plus index.</dd>
<dt>Adjacency SID</dt><dd>Ek link ka local label.</dd>
<dt>PHP</dt><dd>Penultimate hop popping: aakhri P bahar wala label hata deta hai.</dd>
<dt>RD / RT</dt><dd>Unique prefix tag / import aur export tag.</dd>
<dt>TI-LFA</dt><dd>Chhote stack ke saath pre-computed single-failure repair.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>PE2 transport label: 16005. VPN label: PE2 har VRF ke liye allocate karta hai.</li>
<li>VPNv4 routes ka next hop labelled loopback hona chahiye.</li>
<li>BGP session up hone ka matlab RT ke saath routes exchange hona nahi.</li>
<li>"No Label" matlab next hop dekho.</li>
<li>LDP se steps mein migrate karo, har baar VPN verify karte hue.</li>
</ul>

<h3>Checklist</h3>
<ul>
<li>Main underlay, VRFs, VPNv4 aur PE-CE shuruaat se bana sakta hoon.</li>
<li>Main do-label stack padh sakta hoon aur har operation ka naam bata sakta hoon.</li>
<li>Main table ke aathon faults mein se har ek ka symptom bata sakta hoon.</li>
<li>Main labs sre-sr-vpn-build, -ts aur -cities poore kar sakta hoon.</li>
<li>Main tickets INC270010 se INC270016 bina hint ke theek kar sakta hoon.</li>
</ul>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor      V   AS  State/PfxRcd
<span class="hl">10.0.255.5   4  65000  1</span>
PE1# show mpls forwarding-table 10.0.255.5
<span class="hl">16005  16005  10.0.255.5/32</span></pre>

<div class="eg"><b>Worked example.</b> Teesri customer site ka PE3 jodna hai: index 6, loopback 10.0.255.6, label 16006, baaki ke saath VPNv4 session, wahi RT 65000:1. Jo kuch karna hai woh sab is recap mein hai.</div>

<div class="exam"><b>Exam trap.</b> Sawaal keh sakta hai "SRGB 16000 se 23999 hai aur index 5000 hai". 16000 + 5000 = 21000 range ke andar hai, isliye valid; par index 9000 se 25000 banta hai, range ke bahar, aur SID install nahi hoga.</div>

<div class="warn"><b>Common mistake.</b> Commands ratna, par yeh nahi jaanna ki woh kis layer ke hain. Exam ya incident mein layer batati hai kahan dekhna hai.</div>

<div class="scn"><h4>Teesri site onboard karna</h4><p>Operator ne naye branch ke liye PE3 jodha. Labs ne pattern sikhaya tha, isliye kaam tees minute mein ho gaya: index, IS-IS, VRF, VPNv4, PE-CE. Ek hi surprise tha: PE3 ka loopback IS-IS mein nahi joda gaya tha; checklist ne pakad liya.</p><p><b>Lesson:</b> pattern plus checklist improvisation se behtar hai.</p></div>

<div class="iv"><p class="q">"SR par L3VPN ka do-minute ka summary do."</p><p>Underlay: IS-IS SR har PE loopback ko label deta hai. Overlay: PEs ke beech VPNv4 RT aur VPN labels ke saath customer routes le jaata hai. Data plane: do labels, bahar wala PE tak pahunchne ke liye, andar wala VRF chunne ke liye. Operations: labels, RTs aur CE routes verify karo, aur TI-LFA se protect karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay, VRFs, VPNv4, PE-CE: chaar building blocks.</li>
<li>Do labels, bahar 16005 aur andar VPN label.</li>
<li>Saat-step routine ke saath neeche se upar troubleshoot karo.</li>
<li>Pehle labs, phir tickets se practice karo.</li>
</ul></div>
`}};export{e as default};