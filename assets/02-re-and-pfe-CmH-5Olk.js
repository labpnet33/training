var e={id:`re-and-pfe`,h:{en:`Routing Engine and Packet Forwarding Engine in detail`,hi:`Routing Engine aur Packet Forwarding Engine detail mein`},body:{en:`
<p>In the last chapter you met the two planes. Now we look at what each one is made of, which processes run on the RE, and how the two stay in step. This is exam material and also the knowledge that helps you decide where a problem lives.</p>

<h3>Routing Engine: the control plane</h3>
<p>The RE is a small computer inside the router: CPU, memory and storage, running the Junos kernel and its processes. It learns routes, keeps the configuration, answers your CLI commands and talks to other routers. Key processes:</p>
<table class="cmp"><tr><th>Process</th><th>Job</th></tr>
<tr><td><code>rpd</code></td><td>Routing protocol daemon: OSPF, BGP, static routes, builds the routing tables</td></tr>
<tr><td><code>mgd</code></td><td>Management daemon: CLI, commit, configuration database</td></tr>
<tr><td><code>chassisd</code></td><td>Chassis daemon: hardware, line cards, alarms</td></tr>
<tr><td><code>dcd</code></td><td>Device control daemon: interfaces</td></tr>
<tr><td><code>snmpd</code></td><td>SNMP agent</td></tr>
<tr><td><code>eventd</code></td><td>System logging (syslog) events</td></tr></table>
<p>You can check the health of the RE with these commands:</p>
<pre class="out">lab@R2-AGG&gt; show chassis routing-engine
Routing Engine status:
    Temperature                 38 degrees C / 100 degrees F
    CPU temperature             41 degrees C / 105 degrees F
    Total memory              2048 MB Max   901 MB used ( 44 percent)
    CPU utilization:
      User                       2 percent
      Background                 0 percent
      Kernel                     3 percent
      Interrupt                  0 percent
      Idle                      95 percent
    Model                          RE-VIRTUAL
    Start time                     2026-10-02 05:06:40 UTC
    Uptime                         00:01:05

lab@R2-AGG&gt; show system processes extensive | match rpd</pre>

<h3>Packet Forwarding Engine: the forwarding plane</h3>
<p>The PFE does the repetitive work: for every arriving packet it checks the destination against the <b>forwarding table</b>, applies firewall filters, policers and CoS, and sends the packet to the right output queue. On hardware platforms this is done by ASICs at line rate; on virtual platforms such as vMX it is a software forwarding engine. Large routers have many PFEs, one or more per line card, and a switching fabric to connect them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Packet paths through RE and PFE">
<rect x="230" y="10" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text>
<rect x="20" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="100" y="155" text-anchor="middle" class="svg-ink" font-size="13">PFE ingress</text><text x="100" y="175" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0</text>
<rect x="460" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="540" y="155" text-anchor="middle" class="svg-ink" font-size="13">PFE egress</text><text x="540" y="175" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1</text>
<line x1="180" y1="160" x2="460" y2="160" stroke="#16a34a" stroke-width="4"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">transit: PFE only</text>
<path d="M100 130 L100 90 L260 60" fill="none" stroke="#dc2626" stroke-width="3"/><text x="40" y="95" class="svg-ink" font-size="12">exception: up to RE</text>
<line x1="380" y1="60" x2="540" y2="130" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/><text x="470" y="85" class="svg-ink" font-size="12">replies from RE</text>
</svg><p class="cap">Green path: transit traffic never reaches the RE. Red path: exception traffic is punted to the RE and answered from there.</p></div>

<h3>Keeping the planes in sync</h3>
<p>The RE builds the forwarding table from the best routes and sends it down the internal link to every PFE. When a route changes, only the difference is sent. The PFE does not run routing protocols and does not decide routes; it just follows the table. If the RE restarts <code>rpd</code>, the PFE keeps the last known forwarding table, so traffic continues for a short while. Features such as <b>graceful restart</b> and <b>nonstop active routing</b> extend this on redundant systems.</p>

<h3>Where do your commands run?</h3>
<ul><li><code>show route</code> is answered from the RE (routing table).</li>
<li><code>show route forwarding-table</code> shows the copy used by the PFE.</li>
<li><code>show pfe statistics traffic</code> shows counters of packets the forwarding plane handled.</li>
<li>Management traffic such as SSH to the router goes to the RE, so it is the first thing that fails if the RE is overloaded.</li></ul>

<div class="eg"><p><b>Worked example.</b> A router has two line cards. A packet arriving on card 1 for a server behind card 2 is looked up by the ingress PFE, crosses the fabric and leaves via the egress PFE. The RE sees nothing. At the same time an OSPF hello from a neighbour arrives on card 1, is punted to the RE and handled by <code>rpd</code>.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming the PFE "knows" routing protocols. It does not: only the RE speaks OSPF or BGP. If OSPF hellos are blocked from reaching the RE (for example by a lo0 filter), forwarding for existing routes continues briefly, then the neighbours time out and the routes disappear.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RE runs <code>rpd</code> and holds the routing tables; the PFE holds the forwarding table and performs lookups. They communicate over an internal link, not over a customer-facing port.</p></div>

<div class="scn"><h4>Management slow, traffic fine</h4><p>Users reported that SSH to a branch router was painfully slow, but the branch's internet traffic was fast. <code>show chassis routing-engine</code> showed CPU at 95 percent due to a runaway log process, while the PFE counters were healthy. The engineer restarted the offending process, SSH became responsive again, and no user traffic was affected at any point.</p><p><b>Lesson:</b> management slowness points at the RE; forwarding is separate.</p></div>

<div class="iv"><p class="q">"Which Junos process builds the routing table, and which component forwards packets?"</p><p><code>rpd</code> on the Routing Engine builds the routing table (and derives the forwarding table), and the Packet Forwarding Engine uses its copy of the forwarding table to forward packets. Add <code>mgd</code> for the CLI and configuration and note the internal link between RE and PFE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RE processes: rpd (routing), mgd (CLI/config), chassisd (hardware), dcd (interfaces), snmpd, eventd.</li>
<li>The PFE does lookups, filters, policers and queuing at line rate and runs no routing protocols.</li>
<li>The RE downloads the forwarding table to the PFE over an internal link.</li>
<li>The PFE keeps forwarding with the last table if the RE restarts a process.</li>
<li>Check the RE with show chassis routing-engine; check forwarding with show pfe statistics traffic.</li>
</ul></div>
`,hi:`
<p>Pichle chapter mein aap do planes se mile. Ab dekhte hain ki har ek kis cheez se bana hai, RE par kaunse processes chalte hain, aur dono kaise sync mein rehte hain. Yeh exam material hai aur woh knowledge bhi jo batata hai ki problem kahan rehti hai.</p>

<h3>Routing Engine: control plane</h3>
<p>RE router ke andar ek chhota computer hai: CPU, memory aur storage, jo Junos kernel aur uske processes chalata hai. Yeh routes seekhta hai, configuration rakhta hai, aapke CLI commands ka jawab deta hai aur doosre routers se baat karta hai. Mukhya processes:</p>
<table class="cmp"><tr><th>Process</th><th>Kaam</th></tr>
<tr><td><code>rpd</code></td><td>Routing protocol daemon: OSPF, BGP, static routes, routing tables banata hai</td></tr>
<tr><td><code>mgd</code></td><td>Management daemon: CLI, commit, configuration database</td></tr>
<tr><td><code>chassisd</code></td><td>Chassis daemon: hardware, line cards, alarms</td></tr>
<tr><td><code>dcd</code></td><td>Device control daemon: interfaces</td></tr>
<tr><td><code>snmpd</code></td><td>SNMP agent</td></tr>
<tr><td><code>eventd</code></td><td>System logging (syslog) events</td></tr></table>
<p>RE ki health in commands se check kar sakte ho:</p>
<pre class="out">lab@R2-AGG&gt; show chassis routing-engine
Routing Engine status:
    Temperature                 38 degrees C / 100 degrees F
    CPU temperature             41 degrees C / 105 degrees F
    Total memory              2048 MB Max   901 MB used ( 44 percent)
    CPU utilization:
      User                       2 percent
      Background                 0 percent
      Kernel                     3 percent
      Interrupt                  0 percent
      Idle                      95 percent
    Model                          RE-VIRTUAL
    Start time                     2026-10-02 05:06:40 UTC
    Uptime                         00:01:05

lab@R2-AGG&gt; show system processes extensive | match rpd</pre>

<h3>Packet Forwarding Engine: forwarding plane</h3>
<p>PFE dohrawe wala kaam karta hai: har aate packet ke liye destination ko <b>forwarding table</b> se match karta hai, firewall filters, policers aur CoS lagata hai, aur packet ko sahi output queue mein bhejta hai. Hardware platforms par yeh ASICs line rate par karte hain; vMX jaise virtual platforms par software forwarding engine. Bade routers mein kai PFEs hote hain, har line card par ek ya zyada, aur unhe jodne ke liye switching fabric.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RE aur PFE ke through packet paths">
<rect x="230" y="10" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text>
<rect x="20" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="100" y="155" text-anchor="middle" class="svg-ink" font-size="13">PFE ingress</text><text x="100" y="175" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0</text>
<rect x="460" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="540" y="155" text-anchor="middle" class="svg-ink" font-size="13">PFE egress</text><text x="540" y="175" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1</text>
<line x1="180" y1="160" x2="460" y2="160" stroke="#16a34a" stroke-width="4"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">transit: sirf PFE</text>
<path d="M100 130 L100 90 L260 60" fill="none" stroke="#dc2626" stroke-width="3"/><text x="40" y="95" class="svg-ink" font-size="12">exception: RE tak</text>
<line x1="380" y1="60" x2="540" y2="130" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/><text x="470" y="85" class="svg-ink" font-size="12">RE ke replies</text>
</svg><p class="cap">Hara path: transit traffic RE tak nahi pahunchta. Laal path: exception traffic RE ko punt hota hai aur wahin se jawab milta hai.</p></div>

<h3>Planes ko sync mein rakhna</h3>
<p>RE best routes se forwarding table banata hai aur internal link se har PFE ko bhejta hai. Route badle to sirf difference bheja jaata hai. PFE routing protocols nahi chalata aur routes tay nahi karta; woh bas table follow karta hai. RE <code>rpd</code> restart kare to PFE aakhri known forwarding table rakhta hai, isliye thodi der traffic chalta rehta hai. <b>Graceful restart</b> aur <b>nonstop active routing</b> jaise features redundant systems par isse badhate hain.</p>

<h3>Aapke commands kahan chalte hain?</h3>
<ul><li><code>show route</code> ka jawab RE (routing table) deta hai.</li>
<li><code>show route forwarding-table</code> woh copy dikhata hai jo PFE use karta hai.</li>
<li><code>show pfe statistics traffic</code> forwarding plane dwara handle kiye packets ke counters dikhata hai.</li>
<li>Router par SSH jaisa management traffic RE ko jaata hai, isliye RE overloaded ho to sabse pehle yahi fail hota hai.</li></ul>

<div class="eg"><p><b>Worked example.</b> Router mein do line cards hain. Card 1 par aaya packet jo card 2 ke peeche ke server ke liye hai, ingress PFE lookup karta hai, fabric paar karta hai aur egress PFE se nikalta hai. RE ko kuch pata nahi chalta. Usi samay card 1 par padosi ka OSPF hello aata hai, RE ko punt hota hai aur <code>rpd</code> use handle karta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Maan lena ki PFE routing protocols "jaanta" hai. Nahi: sirf RE OSPF ya BGP bolta hai. OSPF hellos RE tak pahunchne se block ho jaayein (jaise lo0 filter se), to maujooda routes ki forwarding thodi der chalti hai, phir neighbours time out hote hain aur routes gayab ho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> RE <code>rpd</code> chalata hai aur routing tables rakhta hai; PFE forwarding table rakhta hai aur lookups karta hai. Dono internal link se baat karte hain, customer-facing port se nahi.</p></div>

<div class="scn"><h4>Management dheema, traffic theek</h4><p>Users ne shikayat ki ki branch router par SSH bahut dheema hai, lekin branch ka internet traffic tez tha. <code>show chassis routing-engine</code> ne dikhaya ki ek runaway log process ki wajah se CPU 95 percent hai, jabki PFE counters theek the. Engineer ne us process ko restart kiya, SSH phir responsive ho gaya, aur kisi bhi samay user traffic par asar nahi hua.</p><p><b>Lesson:</b> management ka dheema hona RE ki taraf ishara karta hai; forwarding alag hai.</p></div>

<div class="iv"><p class="q">"Kaunsa Junos process routing table banata hai, aur kaunsa component packets forward karta hai?"</p><p>Routing Engine par <code>rpd</code> routing table banata hai (aur forwarding table nikalta hai), aur Packet Forwarding Engine apni forwarding table ki copy se packets forward karta hai. CLI aur configuration ke liye <code>mgd</code> jodo aur RE aur PFE ke beech internal link ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RE processes: rpd (routing), mgd (CLI/config), chassisd (hardware), dcd (interfaces), snmpd, eventd.</li>
<li>PFE line rate par lookups, filters, policers aur queuing karta hai aur routing protocols nahi chalata.</li>
<li>RE forwarding table ko internal link se PFE tak download karta hai.</li>
<li>RE kisi process ko restart kare to PFE aakhri table se forwarding chalata rehta hai.</li>
<li>RE ko show chassis routing-engine se, forwarding ko show pfe statistics traffic se check karo.</li>
</ul></div>
`}};export{e as default};