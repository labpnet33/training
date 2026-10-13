var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together. Read the checklist as a list of things you should be able to do on a blank FortiGate, without notes, and the facts as what the NSE 4 exam likes to ask.</p>
<h3>Can-do checklist</h3>
<ul><li>Read <code>get router info routing-table all</code> and explain code, prefix, distance, metric, next hop and interface.</li><li>Predict the winner between routes using longest prefix, then distance, then priority.</li><li>Add a static route (dst, gateway, device) and a default route, and verify it with <code>details</code>.</li><li>Diagnose "reverse path check fail, drop" with a debug flow and fix it with a route.</li><li>Build a floating backup default route, add the backup interface to the policy, test and restore.</li><li>Explain ECMP, priority and blackhole routes and when to use them.</li><li>Explain how a policy route differs from a static route.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>RPF</dt><dd>Reverse path forwarding check on the source address.</dd><dt>Administrative distance</dt><dd>Trust rating of a route source; lower wins.</dd><dt>Priority</dt><dd>Tie-break among static routes of equal distance; lower wins.</dd><dt>Floating route</dt><dd>A backup route with higher distance.</dd><dt>ECMP</dt><dd>Equal-cost multipath: several equal routes used together.</dd><dt>Blackhole route</dt><dd>A route that silently drops matching packets.</dd><dt>Policy route</dt><dd>A route matched on source, interface or service before the table.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Default distances: connected 0, static 10, eBGP 20, OSPF 110, iBGP 200.</li><li>Longest prefix match wins before distance.</li><li>Floating route: a higher distance than the primary; installed only when the better route disappears.</li><li>A static route disappears only when its interface goes down.</li><li>Policy routes are evaluated before the routing table.</li></ul>
<h3>Command cheat-sheet</h3>
<pre class="code">get router info routing-table all
get router info routing-table details 172.16.5.10
get router info routing-table static
show router static
config router static
diagnose debug flow filter addr 172.16.5.10
diagnose debug flow trace start 5
diagnose debug enable
diagnose debug disable
diagnose debug reset
diagnose sys session list
execute traceroute 8.8.8.8</pre>
<h3>Where to practise and what comes next</h3>
<p>Repeat both labs of this module until you can do them without the hints. The next modules in this track are <b>SD-WAN</b> (health checks, SLAs, rules) and <b>OSPF and BGP on FortiGate</b>. For hands-on OSPF and BGP in the simulator today, use <b>enarsi-ospf</b>, <b>enarsi-bgp</b> and <b>jncis-ospf</b>; the concepts transfer directly to FortiOS.</p>
<div class="exam"><p><b>Exam trap.</b> Read answer options for "always" and "never". Distance and priority are tie-breaks only after the longest prefix has been compared.</p></div>
<div class="scn"><h4>Ready for the exam room</h4><p>A candidate drew the packet path on the whiteboard in the interview: session, RPF, route, policy, NAT. He then described a floating route and its two limits, and the interviewer moved on to SD-WAN. Knowing the order and the limits is what separated him from candidates who only remembered commands.</p><p><b>Lesson:</b> Explain, then configure, then verify.</p></div>
<div class="iv"><p class="q">"Summarise routing on a FortiGate in one minute."</p><p>Connected and static routes (and dynamic ones) fill the routing table. The FortiGate checks the source with RPF, picks the destination route by longest prefix, then distance, then priority, and uses policy routes or SD-WAN rules before the table when configured. Floating routes give a backup, ECMP shares load, and a policy must exist for every egress interface. Debug flow shows exactly where a packet stops.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Know the packet path: session, RPF, route, policy, NAT.</li><li>Know the selection order: prefix, distance, priority.</li><li>Know the backup recipe and its limit.</li><li>Know the five-step troubleshooting order.</li></ul></div>
`,hi:`
<p>Yeh chapter module ko jodta hai. Checklist ko aisi cheezon ki list ki tarah padho jo aap blank FortiGate par bina notes ke kar sako, aur facts ko aisi baaton ki tarah jo NSE 4 exam poochna pasand karta hai.</p>
<h3>Can-do checklist</h3>
<ul><li><code>get router info routing-table all</code> padhkar code, prefix, distance, metric, next hop aur interface samjha sako.</li><li>Longest prefix, phir distance, phir priority se routes ka winner predict kar sako.</li><li>Static route (dst, gateway, device) aur default route add kar sako aur <code>details</code> se verify kar sako.</li><li>Debug flow se "reverse path check fail, drop" diagnose kar sako aur route se fix kar sako.</li><li>Floating backup default route bana sako, backup interface ko policy mein jod sako, test aur restore kar sako.</li><li>ECMP, priority aur blackhole routes aur unke use samjha sako.</li><li>Samjha sako ki policy route static route se kaise alag hai.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>RPF</dt><dd>Source address par reverse path forwarding check.</dd><dt>Administrative distance</dt><dd>Route source ki trust rating; kam jeetta hai.</dd><dt>Priority</dt><dd>Barabar distance ke static routes mein tie-break; kam jeetta hai.</dd><dt>Floating route</dt><dd>Zyada distance wala backup route.</dd><dt>ECMP</dt><dd>Equal-cost multipath: kai barabar routes saath mein use hote hain.</dd><dt>Blackhole route</dt><dd>Aisa route jo matching packets chupchaap drop karta hai.</dd><dt>Policy route</dt><dd>Source, interface ya service par table se pehle match hone wala route.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul><li>Default distances: connected 0, static 10, eBGP 20, OSPF 110, iBGP 200.</li><li>Longest prefix match distance se pehle jeetta hai.</li><li>Floating route: primary se zyada distance; behtar route gayab hone par hi install.</li><li>Static route tabhi gayab hota hai jab uska interface down ho.</li><li>Policy routes routing table se pehle evaluate hote hain.</li></ul>
<h3>Command cheat-sheet</h3>
<pre class="code">get router info routing-table all
get router info routing-table details 172.16.5.10
get router info routing-table static
show router static
config router static
diagnose debug flow filter addr 172.16.5.10
diagnose debug flow trace start 5
diagnose debug enable
diagnose debug disable
diagnose debug reset
diagnose sys session list
execute traceroute 8.8.8.8</pre>
<h3>Kahan practise karein aur aage kya hai</h3>
<p>Is module ke dono labs ko tab tak repeat karo jab tak bina hints ke kar na sako. Is track ke agle modules <b>SD-WAN</b> (health checks, SLAs, rules) aur <b>FortiGate par OSPF aur BGP</b> hain. Aaj simulator mein OSPF aur BGP ka hands-on ke liye <b>enarsi-ospf</b>, <b>enarsi-bgp</b> aur <b>jncis-ospf</b> use karo; concepts seedha FortiOS par lagu hote hain.</p>
<div class="exam"><p><b>Exam trap.</b> Answer options mein "always" aur "never" dhyan se padho. Distance aur priority sirf longest prefix compare hone ke baad tie-break hain.</p></div>
<div class="scn"><h4>Exam room ke liye taiyaar</h4><p>Ek candidate ne interview mein whiteboard par packet path banaya: session, RPF, route, policy, NAT. Phir usne floating route aur uski do limits batayi, aur interviewer SD-WAN par chala gaya. Order aur limits jaanna use un candidates se alag karta tha jinhe sirf commands yaad the.</p><p><b>Seekh:</b> Pehle samjhao, phir configure karo, phir verify karo.</p></div>
<div class="iv"><p class="q">"Ek minute mein FortiGate par routing summarise karo."</p><p>Connected aur static (aur dynamic) routes routing table bharte hain. FortiGate source ko RPF se check karta hai, destination route longest prefix, phir distance, phir priority se chunta hai, aur configured ho to table se pehle policy routes ya SD-WAN rules use karta hai. Floating routes backup dete hain, ECMP load baantta hai, aur har egress interface ke liye policy honi chahiye. Debug flow bilkul dikhata hai ki packet kahan rukta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Packet path jaano: session, RPF, route, policy, NAT.</li><li>Selection order jaano: prefix, distance, priority.</li><li>Backup recipe aur uski limit jaano.</li><li>Paanch-step troubleshooting order jaano.</li></ul></div>
`}};export{e as default};