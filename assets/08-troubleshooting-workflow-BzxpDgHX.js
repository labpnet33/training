var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: which plane is broken?`,hi:`Troubleshooting workflow: kaunsa plane toota hai?`},body:{en:`
<p>With the architecture in your head, troubleshooting becomes a sorting exercise. For every symptom ask: is this a <b>control plane</b> problem (the RE: routes, protocols, management), a <b>forwarding plane</b> problem (the PFE: lookups, filters, drops), or a <b>link</b> problem? The answer tells you which command to run next.</p>

<h3>The five-question workflow</h3>
<ol><li><b>What exactly fails?</b> Traffic through the router, traffic to the router, or both? Through-only means transit; to-only means exception.</li>
<li><b>Are the links and neighbours up?</b> <code>show interfaces terse</code>, <code>show ospf neighbor</code>.</li>
<li><b>Does the RE know a route?</b> <code>show route &lt;destination&gt;</code>. Read protocol, preference and next hop.</li>
<li><b>Does the PFE use it?</b> <code>show route forwarding-table destination &lt;address&gt;</code>. Does it match the active route?</li>
<li><b>Is something dropping it?</b> <code>show firewall filter</code>, <code>show pfe statistics traffic</code> (Firewall discard, TTL expired), interface error counters.</li></ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Decision tree for troubleshooting">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Symptom reported</text>
<rect x="20" y="90" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="112" text-anchor="middle" class="svg-ink" font-size="12">Through the router fails</text><text x="110" y="128" text-anchor="middle" class="svg-muted" font-size="11">transit: route, FIB, link</text>
<rect x="230" y="90" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">To the router fails</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">exception: lo0 filter, RE load</text>
<rect x="440" y="90" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="112" text-anchor="middle" class="svg-ink" font-size="12">Routes disappear</text><text x="530" y="128" text-anchor="middle" class="svg-muted" font-size="11">protocol: adjacency, filter</text>
<line x1="280" y1="50" x2="110" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="110" y="202" text-anchor="middle" class="svg-ink" font-size="11">show route / forwarding-table</text><text x="110" y="220" text-anchor="middle" class="svg-ink" font-size="11">show interfaces terse</text>
<rect x="230" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="11">show firewall filter</text><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="11">show chassis routing-engine</text>
<rect x="440" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="530" y="202" text-anchor="middle" class="svg-ink" font-size="11">show ospf neighbor</text><text x="530" y="220" text-anchor="middle" class="svg-ink" font-size="11">check lo0 filter terms</text>
<line x1="110" y1="140" x2="110" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="530" y1="140" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sort the symptom first, then run the commands for that plane.</p></div>

<h3>Case 1: OSPF dies after a filter commit (control plane)</h3>
<p>Symptom: right after a lo0 filter was committed, neighbours drop and routes disappear.</p>
<pre class="out">lab@R2-AGG&gt; show ospf neighbor
lab@R2-AGG&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
re-icmp                                               420                    5
<span class="hl">re-drop                                             13240                  310</span></pre>
<p>An empty neighbour list and a fast-growing <b>re-drop</b> counter show that hellos are hitting the final discard term. The fix is a routing term at the top: <code>set term routing from protocol ospf</code> and <code>then accept</code>, placed before the discard, using <code>insert term routing before term rest</code> if the order is wrong.</p>

<h3>Case 2: a backup route did not take over (forwarding plane)</h3>
<p>Symptom: the primary link fails, but the backup never carries traffic. <code>show route</code> shows the floating static route as active, but ping fails. Compare the forwarding table: <code>show route forwarding-table destination &lt;address&gt;</code>. If the next hop is unreachable (no ARP) the static route is active but traffic cannot leave. Check <code>show arp no-resolve</code> and the far end.</p>

<h3>Case 3: ping to the router fails but transit works (exception)</h3>
<p>Users reach servers through the router, yet ping or SSH to the router fails. Transit is fine, so the PFE and links are healthy. Look at the lo0 filter: no ICMP or SSH term, or a source-address restriction that excludes the user's network. <code>show firewall filter</code> shows the discard counter incrementing.</p>

<h3>Case 4: everything is slow including SSH (RE load)</h3>
<p><code>show chassis routing-engine</code> shows CPU high. Identify the process with <code>show system processes extensive</code>. Forwarding is not affected; fix the cause (for example a log loop or a scan hitting the router) and tighten the lo0 filter.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "PC1 cannot ping R2's loopback, but can ping SRV behind R2." Sort it: transit works, exception fails. Check show firewall filter on R2: re-icmp is zero and re-drop is increasing. The ping term is missing or comes after the discard term. Move or add it, commit confirmed, ping again, counters move.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Debugging the routing table when the problem is the lo0 filter. Disabling the filter to "see if it works" instead of adding the missing term. Changing several things at once so you cannot tell what fixed it.</p></div>

<div class="exam"><p><b>Exam trap.</b> If OSPF or BGP sessions fail after you add a lo0 filter, the first suspect is a missing term for the protocol, not an interface or an area mismatch.</p></div>

<div class="scn"><h4>The 3 am OSPF flap</h4><p>At 3 am a bank's branch routers lost OSPF one by one after an automated filter rollout. The on-call engineer logged in via the out-of-band port, saw empty OSPF neighbour tables, and the re-drop counter climbing. The template had been generated without the OSPF term. He used rollback 1, confirmed neighbours came back to Full, and the team corrected the template to include routing protocols first.</p><p><b>Lesson:</b> when adjacencies die right after a filter change, look at the filter before the network.</p></div>

<div class="iv"><p class="q">"Users can reach servers through your router but cannot SSH to the router. What do you check?"</p><p>That is exception traffic being dropped while transit works. Check the lo0 input filter: is there an SSH term, does it come before the discard, and is the source address of the user allowed? show firewall filter shows counters; also confirm the ssh service is enabled under system services and that the router has a route back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sort the symptom: through the router (PFE and routes) or to the router (RE and lo0 filter).</li>
<li>Check routing table, then forwarding table, then drops and counters.</li>
<li>OSPF or BGP failing after a lo0 filter points to a missing protocol term.</li>
<li>High RE CPU slows management but not transit forwarding.</li>
<li>Change one thing, verify, and use commit confirmed or rollback to recover.</li>
</ul></div>
`,hi:`
<p>Architecture dimaag mein ho to troubleshooting ek sorting exercise ban jaati hai. Har symptom ke liye poocho: yeh <b>control plane</b> ki problem hai (RE: routes, protocols, management), <b>forwarding plane</b> ki (PFE: lookups, filters, drops), ya <b>link</b> ki? Jawab batata hai ki agla command kaunsa chalana hai.</p>

<h3>Paanch sawal ka workflow</h3>
<ol><li><b>Exactly kya fail ho raha hai?</b> Router ke through traffic, router ko traffic, ya dono? Sirf through ka matlab transit; sirf to ka matlab exception.</li>
<li><b>Links aur neighbours up hain?</b> <code>show interfaces terse</code>, <code>show ospf neighbor</code>.</li>
<li><b>Kya RE ko route pata hai?</b> <code>show route &lt;destination&gt;</code>. Protocol, preference aur next hop padho.</li>
<li><b>Kya PFE use use karta hai?</b> <code>show route forwarding-table destination &lt;address&gt;</code>. Kya woh active route se match karta hai?</li>
<li><b>Kya kuch use drop kar raha hai?</b> <code>show firewall filter</code>, <code>show pfe statistics traffic</code> (Firewall discard, TTL expired), interface error counters.</li></ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ka decision tree">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Symptom report hua</text>
<rect x="20" y="90" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="112" text-anchor="middle" class="svg-ink" font-size="12">Router ke through fail</text><text x="110" y="128" text-anchor="middle" class="svg-muted" font-size="11">transit: route, FIB, link</text>
<rect x="230" y="90" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Router ko fail</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">exception: lo0 filter, RE load</text>
<rect x="440" y="90" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="112" text-anchor="middle" class="svg-ink" font-size="12">Routes gayab</text><text x="530" y="128" text-anchor="middle" class="svg-muted" font-size="11">protocol: adjacency, filter</text>
<line x1="280" y1="50" x2="110" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="110" y="202" text-anchor="middle" class="svg-ink" font-size="11">show route / forwarding-table</text><text x="110" y="220" text-anchor="middle" class="svg-ink" font-size="11">show interfaces terse</text>
<rect x="230" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="11">show firewall filter</text><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="11">show chassis routing-engine</text>
<rect x="440" y="180" width="180" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="530" y="202" text-anchor="middle" class="svg-ink" font-size="11">show ospf neighbor</text><text x="530" y="220" text-anchor="middle" class="svg-ink" font-size="11">lo0 filter terms check karo</text>
<line x1="110" y1="140" x2="110" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="530" y1="140" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle symptom sort karo, phir us plane ke commands chalao.</p></div>

<h3>Case 1: filter commit ke baad OSPF mar jaata hai (control plane)</h3>
<p>Symptom: lo0 filter commit hote hi neighbours gir jaate hain aur routes gayab ho jaate hain.</p>
<pre class="out">lab@R2-AGG&gt; show ospf neighbor
lab@R2-AGG&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
re-icmp                                               420                    5
<span class="hl">re-drop                                             13240                  310</span></pre>
<p>Khaali neighbour list aur tezi se badhta <b>re-drop</b> counter dikhate hain ki hellos aakhri discard term par lag rahe hain. Fix hai upar ek routing term: <code>set term routing from protocol ospf</code> aur <code>then accept</code>, discard se pehle, aur order galat ho to <code>insert term routing before term rest</code>.</p>

<h3>Case 2: backup route ne control nahi liya (forwarding plane)</h3>
<p>Symptom: primary link fail hua, lekin backup traffic nahi le jaata. <code>show route</code> floating static route ko active dikhata hai, lekin ping fail. Forwarding table compare karo: <code>show route forwarding-table destination &lt;address&gt;</code>. Next hop unreachable ho (ARP nahi) to static route active hai lekin traffic bahar nahi ja sakta. <code>show arp no-resolve</code> aur far end check karo.</p>

<h3>Case 3: router ko ping fail lekin transit chalta hai (exception)</h3>
<p>Users router ke through servers tak pahunchte hain, phir bhi router ko ping ya SSH fail hota hai. Transit theek hai, to PFE aur links healthy hain. lo0 filter dekho: ICMP ya SSH ka term nahi, ya source-address restriction jo user ke network ko exclude karti hai. <code>show firewall filter</code> discard counter badhta dikhata hai.</p>

<h3>Case 4: sab kuch dheema, SSH bhi (RE load)</h3>
<p><code>show chassis routing-engine</code> mein CPU high dikhta hai. <code>show system processes extensive</code> se process pehchano. Forwarding affect nahi hoti; karan theek karo (jaise log loop ya router par scan) aur lo0 filter kasa karo.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "PC1 R2 ke loopback ko ping nahi kar pa raha, lekin R2 ke peeche SRV ko ping kar pa raha hai." Sort karo: transit chalta hai, exception fail. R2 par show firewall filter dekho: re-icmp zero hai aur re-drop badh raha hai. Ping term missing hai ya discard term ke baad hai. Use move ya add karo, commit confirmed, dobara ping, counters hilte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jab problem lo0 filter ki ho tab routing table debug karna. Missing term jodne ki jagah "dekhne" ke liye filter hata dena. Ek saath kai cheezein badalna jisse pata nahi chalta kisne theek kiya.</p></div>

<div class="exam"><p><b>Exam trap.</b> lo0 filter lagane ke baad OSPF ya BGP sessions fail hon to pehla shak us protocol ke missing term par hota hai, interface ya area mismatch par nahi.</p></div>

<div class="scn"><h4>Raat 3 baje OSPF flap</h4><p>Raat 3 baje ek bank ke branch routers ek-ek karke OSPF kho baithe jab automated filter rollout hua. On-call engineer ne out-of-band port se login kiya, khaali OSPF neighbour tables aur chadhta re-drop counter dekha. Template OSPF term ke bina bana tha. Usne rollback 1 kiya, confirm kiya ki neighbours Full ho gaye, aur team ne template sudhaara taaki routing protocols pehle aayein.</p><p><b>Lesson:</b> filter change ke turant baad adjacencies mare to network se pehle filter dekho.</p></div>

<div class="iv"><p class="q">"Users aapke router ke through servers tak pahunch rahe hain lekin router par SSH nahi kar pa rahe. Kya check karoge?"</p><p>Yeh exception traffic drop ho raha hai jabki transit chal raha hai. lo0 input filter dekho: SSH term hai, discard se pehle hai, aur user ka source address allowed hai? show firewall filter counters dikhata hai; yeh bhi confirm karo ki system services mein ssh enabled hai aur router ke paas wapas ka route hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symptom sort karo: router ke through (PFE aur routes) ya router ko (RE aur lo0 filter).</li>
<li>Routing table, phir forwarding table, phir drops aur counters check karo.</li>
<li>lo0 filter ke baad OSPF ya BGP fail ho to protocol term missing hai.</li>
<li>High RE CPU management ko dheema karta hai, transit forwarding ko nahi.</li>
<li>Ek cheez badlo, verify karo, aur recover ke liye commit confirmed ya rollback use karo.</li>
</ul></div>
`}};export{e as default};