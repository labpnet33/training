var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have now covered the whole transition toolbox for the SPCOR exam. This chapter pulls it together: a decision guide, a checklist of things you must be able to do, a mini glossary and the most-tested facts. Remember that the simulator has no labs for this module; to practise the supporting skills use np-ipv6 (IPv6 addressing and routing), ccna-nat (NAT behaviour) and spcor-l3vpn and spcor-mpls-ldp (provider core).</p>

<h3>Decision guide</h3>
<table class="cmp"><tr><th>Situation</th><th>Choose</th><th>Why</th></tr>
<tr><td>Enough IPv4 for now, want IPv6 gradually</td><td>Dual-stack</td><td>No translation; IPv6 grows on its own</td></tr>
<tr><td>Short of IPv4, access still dual-stack</td><td>Dual-stack + CGNAT (NAT444)</td><td>Stretches IPv4 with 100.64.0.0/10</td></tr>
<tr><td>IPv6-only clients reach IPv4 content</td><td>NAT64 + DNS64</td><td>Translate at the edge</td></tr>
<tr><td>IPv6-only mobile with IPv4-only apps</td><td>464XLAT</td><td>CLAT handles IPv4 literals</td></tr>
<tr><td>IPv6-only broadband, legacy CPE with IPv4 LAN</td><td>DS-Lite</td><td>Tunnel to one carrier NAT</td></tr>
<tr><td>IPv6-only, no flow state wanted</td><td>MAP-T or MAP-E</td><td>Stateless, deterministic mapping</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Explain dual-stack, tunnelling and translation and classify every mechanism.</li>
<li>Describe NAT444 and the purpose of 100.64.0.0/10.</li>
<li>List the problems caused by CGNAT and how port-block and deterministic allocation help.</li>
<li>Walk through a NAT64 and DNS64 transaction and build a synthetic address with 64:ff9b::/96.</li>
<li>Distinguish stateful and stateless NAT64.</li>
<li>Explain 464XLAT with CLAT and PLAT and why IPv4 literals need it.</li>
<li>Describe DS-Lite with B4, AFTR, DHCPv6 option 64 and 192.0.0.0/29.</li>
<li>Explain MAP-T versus MAP-E, BMR, FMR, DMR, PSID and the border relay.</li>
<li>Troubleshoot with the layered workflow and recognise MTU symptoms.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AFTR / B4</dt><dd>DS-Lite tunnel terminator and initiator.</dd>
<dt>CLAT / PLAT</dt><dd>Customer-side stateless and provider-side stateful translators in 464XLAT.</dd>
<dt>NAT444</dt><dd>Home NAT plus carrier NAT on IPv4.</dd>
<dt>64:ff9b::/96</dt><dd>Well-known NAT64 prefix.</dd>
<dt>PSID</dt><dd>Port Set Identifier in MAP.</dd>
<dt>BR</dt><dd>MAP border relay.</dd>
<dt>100.64.0.0/10</dt><dd>Shared address space for CGNAT.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>NAT64 prefix 64:ff9b::/96; IPv4 address is in the last 32 bits.</li>
<li>DNS64 only synthesizes when no AAAA exists.</li>
<li>DS-Lite is tunnelling with one NAT at the AFTR; CPE does not NAT.</li>
<li>464XLAT is translation; the CLAT is stateless, the PLAT is stateful.</li>
<li>MAP-E encapsulates; MAP-T translates; both are stateless.</li>
<li>Tunnels cost 40 bytes of IPv6 header, so check MTU and MSS.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Quick conversion practice: 198.51.100.7 is c6 33 64 07 in hex, so the synthetic address is 64:ff9b::c633:6407. Check by converting each octet: 198 = c6, 51 = 33, 100 = 64, 7 = 07.</p></div>
<div class="warn"><p><b>Common mistake.</b> Memorising names without their category. Always attach each name to translation, tunnelling or dual-stack, and to stateful or stateless.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often give a symptom and ask for the missing element. Think first: DNS answer, prefix route, pool return route or MTU.</p></div>

<div class="scn"><h4>Choosing for a new mobile launch</h4><p>An operator launching a 5G service chose an IPv6-only radio and core with 464XLAT, because its customers' phones already support a CLAT. It kept a small dual-stack segment for enterprise customers who need public IPv4 and retained CGNAT only for them.</p><p><b>Lesson:</b> a provider mixes mechanisms by customer segment.</p></div>

<div class="iv"><p class="q">"Which transition mechanism would you pick for a new IPv6-only mobile network, and why?"</p><p>464XLAT: the network stays IPv6-only, handsets run a CLAT for IPv4-only apps, and a PLAT (stateful NAT64) translates to IPv4 for the Internet. Native IPv6 traffic bypasses the PLAT. Note the need for a /64 per device and a sized PLAT with logging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify each mechanism as dual-stack, tunnelling or translation, then stateful or stateless.</li>
<li>Match mechanism to access type: mobile 464XLAT, broadband DS-Lite or MAP.</li>
<li>Remember prefixes: 64:ff9b::/96, 100.64.0.0/10, 192.0.0.0/29.</li>
<li>Always check DNS, route, return path and MTU.</li>
<li>Practise the supporting skills in the related modules.</li>
</ul></div>
`,hi:`
<p>Ab aapne SPCOR exam ka poora transition toolbox cover kar liya. Yeh chapter sab ko jodta hai: ek decision guide, un cheezon ki checklist jo aap kar sakte ho, mini glossary aur sabse zyaada poochhe jaane wale facts. Yaad rakho ki is module ke liye simulator mein labs nahi hain; supporting skills practise karne ke liye np-ipv6 (IPv6 addressing aur routing), ccna-nat (NAT behaviour) aur spcor-l3vpn tatha spcor-mpls-ldp (provider core) use karo.</p>

<h3>Decision guide</h3>
<table class="cmp"><tr><th>Situation</th><th>Chuno</th><th>Kyun</th></tr>
<tr><td>Abhi ke liye IPv4 kaafi, IPv6 dheere dheere chahiye</td><td>Dual-stack</td><td>Translation nahi; IPv6 apne aap badhta hai</td></tr>
<tr><td>IPv4 kam, access abhi bhi dual-stack</td><td>Dual-stack + CGNAT (NAT444)</td><td>100.64.0.0/10 ke saath IPv4 kheenchta hai</td></tr>
<tr><td>IPv6-only clients IPv4 content tak</td><td>NAT64 + DNS64</td><td>Edge par translate</td></tr>
<tr><td>IPv6-only mobile, IPv4-only apps</td><td>464XLAT</td><td>CLAT IPv4 literals handle karta hai</td></tr>
<tr><td>IPv6-only broadband, IPv4 LAN wala legacy CPE</td><td>DS-Lite</td><td>Ek carrier NAT tak tunnel</td></tr>
<tr><td>IPv6-only, flow state nahi chahiye</td><td>MAP-T ya MAP-E</td><td>Stateless, deterministic mapping</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Dual-stack, tunnelling aur translation samjhao aur har mechanism ko classify karo.</li>
<li>NAT444 aur 100.64.0.0/10 ka purpose batao.</li>
<li>CGNAT se hone wali problems aur port-block tatha deterministic allocation kaise madad karte hain, list karo.</li>
<li>NAT64 aur DNS64 transaction walk through karo aur 64:ff9b::/96 se synthetic address banao.</li>
<li>Stateful aur stateless NAT64 mein farq batao.</li>
<li>CLAT aur PLAT ke saath 464XLAT samjhao aur batao IPv4 literals ko iski zaroorat kyun hai.</li>
<li>B4, AFTR, DHCPv6 option 64 aur 192.0.0.0/29 ke saath DS-Lite describe karo.</li>
<li>MAP-T versus MAP-E, BMR, FMR, DMR, PSID aur border relay samjhao.</li>
<li>Layered workflow se troubleshoot karo aur MTU symptoms pehchano.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AFTR / B4</dt><dd>DS-Lite tunnel terminator aur initiator.</dd>
<dt>CLAT / PLAT</dt><dd>464XLAT mein customer-side stateless aur provider-side stateful translators.</dd>
<dt>NAT444</dt><dd>IPv4 par home NAT plus carrier NAT.</dd>
<dt>64:ff9b::/96</dt><dd>Well-known NAT64 prefix.</dd>
<dt>PSID</dt><dd>MAP mein Port Set Identifier.</dd>
<dt>BR</dt><dd>MAP border relay.</dd>
<dt>100.64.0.0/10</dt><dd>CGNAT ke liye shared address space.</dd>
</dl>

<h3>Sabse zyaada tested facts</h3>
<ul>
<li>NAT64 prefix 64:ff9b::/96; IPv4 address aakhri 32 bits mein hota hai.</li>
<li>DNS64 tabhi synthesize karta hai jab AAAA na ho.</li>
<li>DS-Lite tunnelling hai jisme ek NAT AFTR par hota hai; CPE NAT nahi karta.</li>
<li>464XLAT translation hai; CLAT stateless hai, PLAT stateful.</li>
<li>MAP-E encapsulate karta hai; MAP-T translate karta hai; dono stateless hain.</li>
<li>Tunnels IPv6 header ke 40 bytes lete hain, isliye MTU aur MSS check karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Quick conversion practice: 198.51.100.7 hex mein c6 33 64 07 hai, isliye synthetic address 64:ff9b::c633:6407 hai. Har octet convert karke check karo: 198 = c6, 51 = 33, 100 = 64, 7 = 07.</p></div>
<div class="warn"><p><b>Common mistake.</b> Naam yaad karna lekin category nahi. Har naam ko translation, tunnelling ya dual-stack se, aur stateful ya stateless se jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions aksar symptom dete hain aur missing element poochte hain. Pehle socho: DNS answer, prefix route, pool return route ya MTU.</p></div>

<div class="scn"><h4>Naye mobile launch ke liye chunav</h4><p>5G service launch karne wale operator ne IPv6-only radio aur core ke saath 464XLAT chuna, kyunki customers ke phones pehle se CLAT support karte hain. Usne enterprise customers ke liye chhota dual-stack segment rakha jinhe public IPv4 chahiye aur CGNAT sirf unke liye rakha.</p><p><b>Lesson:</b> provider customer segment ke hisaab se mechanisms mix karta hai.</p></div>

<div class="iv"><p class="q">"Naye IPv6-only mobile network ke liye kaunsa transition mechanism chunoge, aur kyun?"</p><p>464XLAT: network IPv6-only rehta hai, handsets IPv4-only apps ke liye CLAT chalate hain, aur PLAT (stateful NAT64) Internet ke liye IPv4 mein translate karta hai. Native IPv6 traffic PLAT ko bypass karta hai. Har device ke liye /64 ki zaroorat aur logging ke saath sized PLAT batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har mechanism ko dual-stack, tunnelling ya translation, phir stateful ya stateless mein classify karo.</li>
<li>Mechanism ko access type se match karo: mobile 464XLAT, broadband DS-Lite ya MAP.</li>
<li>Prefixes yaad rakho: 64:ff9b::/96, 100.64.0.0/10, 192.0.0.0/29.</li>
<li>Hamesha DNS, route, return path aur MTU check karo.</li>
<li>Supporting skills related modules mein practise karo.</li>
</ul></div>
`}};export{e as default};