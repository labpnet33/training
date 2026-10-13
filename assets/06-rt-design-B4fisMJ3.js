var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Hub and spoke route targets"><rect x="250" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Hub PE</text><rect x="40" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="110" y="137" text-anchor="middle" class="svg-ink" font-size="13">Spoke PE1</text><rect x="460" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="530" y="137" text-anchor="middle" class="svg-ink" font-size="13">Spoke PE2</text><line x1="180" y1="115" x2="270" y2="64" stroke="#64748b" stroke-width="2"/><line x1="460" y1="115" x2="370" y2="64" stroke="#64748b" stroke-width="2"/><text x="190" y="75" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="450" y="75" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">`+r+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`rt-design`,h:{en:`Route-target design: full mesh, hub-and-spoke, extranet`,hi:`Route-target design: full mesh, hub-and-spoke, extranet`},body:{en:`
<p>The lab uses one RT (65000:1) for both import and export: every site sees every other site, a <b>full mesh</b>. Because RTs are just tags, you can build other topologies with <i>no change to the core</i>. All configurations in this chapter are <b>reference configuration (not output)</b>; the lab only simulates the full mesh.</p>

<h3>Full mesh (what the lab does)</h3>
<pre class="code"><span class="c">! reference configuration (not output)</span>
vrf definition CUST_A
 address-family ipv4
  route-target export 65000:1
  route-target import 65000:1</pre>

<h3>Hub-and-spoke</h3>
<p>All spoke traffic must pass through the hub (for a central firewall). Use two RTs: <b>hub</b> RT 65000:100 and <b>spoke</b> RT 65000:200.</p>
<pre class="code"><span class="c">! reference configuration (not output)</span>
<span class="c">! Hub PE</span>
 route-target export 65000:100
 route-target import 65000:200
<span class="c">! Spoke PEs</span>
 route-target export 65000:200
 route-target import 65000:100</pre>
<p>Spokes import only hub routes (and export their own to the hub). A spoke never imports another spoke's routes, so spoke-to-spoke traffic goes via the hub. The hub site needs a hub CE that re-advertises spoke routes back (often with as-override). This is the exam's classic use of separate import and export RTs.</p>
@@D@@

<h3>Extranet and shared services</h3>
<p>Two customers need to reach a shared server farm, but not each other. Give the shared-services VRF its own RT (65000:900). Each customer exports its RT and also imports 65000:900; the shared VRF exports 65000:900 and imports both customer RTs. Customers never import each other's RT, so they stay isolated.</p>

<h3>RD and RT: two jobs again</h3>
<table class="cmp"><tr><th>RD</th><th>RT</th></tr>
<tr><td>Makes the prefix unique in VPNv4</td><td>Controls who imports the route</td></tr>
<tr><td>One value per VRF per PE (good practice: unique per PE)</td><td>One or more per VRF; import and export separate</td></tr>
<tr><td>Not used to filter</td><td>Is the filter</td></tr></table>
<p><b>Unique RD per PE</b> matters when a route reflector is used: if two PEs advertise the same prefix with the same RD, the RR picks one best path and the other PE's path is hidden from clients, which breaks load sharing and fast reroute for multihomed sites. With different RDs (65000:1 and 65000:2) both paths are carried.</p>

<h3>Route reflectors for VPNv4</h3>
<p>A full mesh of VPNv4 sessions does not scale. As in the BGP module, use route reflectors in the vpnv4 family. The RR holds all VPN routes but filters none by default for clients; <i>RT-constrained route distribution</i> (RT-Constrain) lets PEs tell the RR which RTs they want so it only sends what is needed. RT-Constrain is a concept for this course.</p>

<div class="eg"><p><b>Worked example.</b> A bank has a hub data centre (hub RT 100) and 40 branches (spoke RT 200). Branches reach each other only via the hub firewall. Adding branch 41 needs one VRF on one PE with import 100 and export 200; nothing else changes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using the same RT for import and export when a hub is required. Confusing RD with RT. Using the same RD on every PE for a multihomed customer behind an RR.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hub-and-spoke is done with separate import and export RTs, not with different RDs. The RD never controls route distribution.</p></div>

<div class="scn"><h4>Spokes can talk directly</h4><p>A hub-and-spoke design leaked spoke-to-spoke traffic around the firewall. A spoke VRF imported both 65000:100 and 65000:200. Removing the 65000:200 import forced traffic through the hub again.</p><p><b>Lesson:</b> check every VRF's import list when isolation fails.</p></div>

<div class="iv"><p class="q">"How do you build hub-and-spoke with MPLS L3VPN?"</p><p>With two route targets: spokes export the spoke RT and import only the hub RT, while the hub does the opposite. Spokes never see each other's routes, so their traffic goes via the hub. No core change is needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RTs shape topology: full mesh, hub-and-spoke, extranet.</li>
<li>Hub-and-spoke = separate import and export RTs.</li>
<li>Unique RD per PE helps multipath and PIC behind an RR.</li>
<li>RR in vpnv4 scales the mesh; RT-Constrain limits updates.</li>
<li>The lab only simulates full mesh; the rest is reference.</li>
</ul></div>
`.replace(`@@D@@`,e(`Hub-and-spoke: spokes import the hub RT only.`,`spoke exports 200`,`hub exports 100`,`spoke imports 100; hub imports 200`)),hi:`
<p>Lab dono import aur export ke liye ek RT (65000:1) use karta hai: har site har doosre site ko dekhta hai, yaani <b>full mesh</b>. RTs sirf tags hain, isliye aap <i>core mein koi badlaav kiye bina</i> doosri topologies bana sakte ho. Is chapter ki saari configurations <b>reference configuration (not output)</b> hain; lab sirf full mesh simulate karta hai.</p>

<h3>Full mesh (lab jo karta hai)</h3>
<pre class="code"><span class="c">! reference configuration (not output)</span>
vrf definition CUST_A
 address-family ipv4
  route-target export 65000:1
  route-target import 65000:1</pre>

<h3>Hub-and-spoke</h3>
<p>Saara spoke traffic hub se guzarna chahiye (central firewall ke liye). Do RTs use karo: <b>hub</b> RT 65000:100 aur <b>spoke</b> RT 65000:200.</p>
<pre class="code"><span class="c">! reference configuration (not output)</span>
<span class="c">! Hub PE</span>
 route-target export 65000:100
 route-target import 65000:200
<span class="c">! Spoke PEs</span>
 route-target export 65000:200
 route-target import 65000:100</pre>
<p>Spokes sirf hub routes import karte hain (aur apne routes hub ko export). Spoke kabhi doosre spoke ke routes import nahi karta, isliye spoke-to-spoke traffic hub se jaata hai. Hub site ko ek hub CE chahiye jo spoke routes wapas re-advertise kare (aksar as-override ke saath). Yeh exam mein alag import aur export RTs ka classic use hai.</p>
@@D@@

<h3>Extranet aur shared services</h3>
<p>Do customers ko ek shared server farm tak pahunchna hai, par ek doosre tak nahi. Shared-services VRF ko apna RT (65000:900) do. Har customer apna RT export karta hai aur 65000:900 bhi import karta hai; shared VRF 65000:900 export karta hai aur dono customer RTs import karta hai. Customers kabhi ek doosre ka RT import nahi karte, isliye alag rehte hain.</p>

<h3>RD aur RT: phir do kaam</h3>
<table class="cmp"><tr><th>RD</th><th>RT</th></tr>
<tr><td>VPNv4 mein prefix ko unique banata hai</td><td>Control karta hai kaun route import kare</td></tr>
<tr><td>Har PE par har VRF ke liye ek value (achhi practice: har PE par unique)</td><td>Har VRF ke liye ek ya zyada; import aur export alag</td></tr>
<tr><td>Filter ke liye use nahi hota</td><td>Wahi filter hai</td></tr></table>
<p><b>Har PE par unique RD</b> tab matter karta hai jab route reflector ho: agar do PEs same prefix same RD ke saath advertise karein, RR ek best path chunta hai aur doosre PE ka path clients se chhup jaata hai, jisse multihomed sites ke liye load sharing aur fast reroute toot jaate hain. Alag RDs (65000:1 aur 65000:2) ke saath dono paths carry hote hain.</p>

<h3>VPNv4 ke liye route reflectors</h3>
<p>VPNv4 sessions ka full mesh scale nahi karta. BGP module ki tarah vpnv4 family mein route reflectors use karo. RR saare VPN routes rakhta hai; <i>RT-constrained route distribution</i> (RT-Constrain) PEs ko RR ko batane deta hai ki unhe kaunse RTs chahiye, taaki RR sirf zaroori bheje. RT-Constrain is course ke liye concept hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank ka hub data centre (hub RT 100) aur 40 branches (spoke RT 200) hain. Branches ek doosre tak sirf hub firewall se pahunchti hain. Branch 41 jodne ke liye ek PE par ek VRF import 100 aur export 200 ke saath chahiye; aur kuch nahi badalta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hub chahiye to import aur export ke liye same RT use karna. RD ko RT se confuse karna. RR ke peeche multihomed customer ke liye har PE par same RD.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hub-and-spoke alag import aur export RTs se banta hai, alag RDs se nahi. RD route distribution kabhi control nahi karta.</p></div>

<div class="scn"><h4>Spokes seedhe baat kar rahe hain</h4><p>Ek hub-and-spoke design mein spoke-to-spoke traffic firewall ke aas-paas se leak hua. Ek spoke VRF ne 65000:100 aur 65000:200 dono import kiye the. 65000:200 import hatane se traffic phir hub se jaane laga.</p><p><b>Lesson:</b> isolation fail ho to har VRF ki import list check karo.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN ke saath hub-and-spoke kaise banate ho?"</p><p>Do route targets se: spokes spoke RT export karte hain aur sirf hub RT import karte hain, jabki hub ulta karta hai. Spokes ek doosre ke routes nahi dekhte, isliye unka traffic hub se jaata hai. Core mein badlaav nahi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RTs topology banate hain: full mesh, hub-and-spoke, extranet.</li>
<li>Hub-and-spoke = alag import aur export RTs.</li>
<li>Har PE par unique RD, RR ke peeche multipath aur PIC mein madad karta hai.</li>
<li>vpnv4 mein RR mesh scale karta hai; RT-Constrain updates kam karta hai.</li>
<li>Lab sirf full mesh simulate karta hai; baaki reference hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`Hub-and-spoke: spokes sirf hub RT import karte hain.`,`spoke exports 200`,`hub exports 100`,`spoke imports 100; hub imports 200`))}};export{t as default};