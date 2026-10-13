var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter gathers the SD-WAN module into a checklist, a glossary and the facts that appear most often in exam questions. The SD-WAN core in this module (zones, members, health checks, SLA, rules, failover and diagnose sys sdwan) runs in the three simulator labs; overlay IPsec, ADVPN, FortiManager and shaping are reference-only.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain why SD-WAN beats floating routes: quality-based failover, per-application steering, all links in use.</li><li>Create members and zones and list what must be removed from an interface first.</li><li>Point one default route and one firewall policy at the zone.</li><li>Configure a health check with server, protocol, interval, failtime and recoverytime.</li><li>Define an SLA with latency, jitter and packet-loss thresholds.</li><li>Write a rule with the right strategy and priority-members, and order rules correctly.</li><li>Explain the implicit rule and the load-balance modes.</li><li>Troubleshoot with diagnose sys sdwan commands and the routing basics.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Member</dt><dd>A WAN link (interface plus gateway) in SD-WAN.</dd><dt>Zone</dt><dd>A named group of members; routes and policies point to it.</dd><dt>Health check</dt><dd>A probe that measures loss, latency and jitter per member.</dd><dt>SLA</dt><dd>Thresholds that define a good link.</dd><dt>Rule (service)</dt><dd>Match plus strategy, evaluated top-down.</dd><dt>Implicit rule</dt><dd>Handles unmatched traffic with routing and load balancing.</dd><dt>ISDB</dt><dd>Internet Service Database of SaaS and cloud addresses.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Default zone: virtual-wan-link. Policies and the default route use the zone.</li><li>Health check measures latency, jitter and packet loss; dead after failtime lost probes.</li><li>A member can be alive and still fail the SLA.</li><li>Strategies: manual, best quality, lowest cost (SLA), maximize bandwidth (SLA).</li><li>Rules are matched top-down; unmatched traffic uses the implicit rule (default load balancing is source-ip-based).</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Try it: lab "Half the users cannot browse" and the other two labs of this module</span>
config system sdwan
diagnose sys sdwan member
diagnose sys sdwan zone
diagnose sys sdwan health-check
diagnose sys sdwan service
get router info routing-table all
diagnose debug flow filter addr 10.0.1.10
diagnose debug flow trace start 5
diagnose debug enable</pre>
<h3>Where to practise</h3>
<p>Repeat the three labs of this module until you can finish them without hints, then strengthen the pieces SD-WAN builds on: repeat both labs of <b>nse4-routing</b> (floating route and reverse-path check), practise tracking and policy routing in <b>enarsi-pbr-vrf-bfd</b>, and learn the dynamic routing used between SD-WAN sites in <b>nse4-dynamic</b>, <b>enarsi-ospf</b>, <b>enarsi-bgp</b> and <b>jncis-ospf</b>.</p>
<div class="exam"><p><b>Exam trap.</b> If an answer mentions configuring members by IP address only, or adding member interfaces to the policy, it is probably wrong: policies use the zone.</p></div>
<div class="scn"><h4>A whiteboard answer that got the job</h4><p>In an interview a candidate drew the zone, two members, a health check and a voice rule, then explained what happens when the primary link is alive but lossy: it fails the SLA, the voice rule moves to the second member, while web traffic stays on the implicit rule. The panel noted that he separated alive, out-of-SLA and dead.</p><p><b>Lesson:</b> Clear states and clear decisions win interviews.</p></div>
<div class="iv"><p class="q">"Explain FortiGate SD-WAN in two minutes."</p><p>Links become members of a zone; one route and one policy point at the zone. Health checks measure loss, latency and jitter per member, SLA thresholds say what is good, and rules steer traffic by strategy, evaluated top-down before the routing table. Unmatched traffic uses the implicit rule with a load-balance mode. Dead members are skipped and out-of-SLA members are skipped by rules that need the SLA.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Members, zone, health check, SLA, rules, implicit rule: know all six.</li><li>Alive, out of SLA and dead are different states.</li><li>Policies and routes use the zone.</li><li>Practise the three SD-WAN labs here and the foundations in nse4-routing.</li></ul></div>
`,hi:`
<p>Yeh chapter SD-WAN module ko checklist, glossary aur exam questions mein sabse zyada aane wale facts mein samet deta hai. Is module ka SD-WAN core (zones, members, health checks, SLA, rules, failover aur diagnose sys sdwan) teen simulator labs mein chalta hai; overlay IPsec, ADVPN, FortiManager aur shaping sirf reference hain.</p>
<h3>Can-do checklist</h3>
<ul><li>Samjha sako ki SD-WAN floating routes se behtar kyun hai: quality-based failover, per-application steering, saari links use mein.</li><li>Members aur zones bana sako aur batao ki interface se pehle kya hatana hai.</li><li>Ek default route aur ek firewall policy zone ko point kar sako.</li><li>Server, protocol, interval, failtime aur recoverytime ke saath health check configure kar sako.</li><li>Latency, jitter aur packet-loss thresholds ke saath SLA define kar sako.</li><li>Sahi strategy aur priority-members ke saath rule likh sako aur rules ko sahi order do.</li><li>Implicit rule aur load-balance modes samjha sako.</li><li>diagnose sys sdwan commands aur routing basics se troubleshoot kar sako.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Member</dt><dd>SD-WAN mein ek WAN link (interface plus gateway).</dd><dt>Zone</dt><dd>Members ka naam wala group; routes aur policies use point karte hain.</dd><dt>Health check</dt><dd>Probe jo har member ka loss, latency aur jitter naapta hai.</dd><dt>SLA</dt><dd>Thresholds jo achhi link define karte hain.</dd><dt>Rule (service)</dt><dd>Match plus strategy, upar se neeche evaluate.</dd><dt>Implicit rule</dt><dd>Unmatched traffic ko routing aur load balancing se sambhalta hai.</dd><dt>ISDB</dt><dd>SaaS aur cloud addresses ka Internet Service Database.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul><li>Default zone: virtual-wan-link. Policies aur default route zone use karte hain.</li><li>Health check latency, jitter aur packet loss naapta hai; failtime lost probes ke baad dead.</li><li>Member alive hokar bhi SLA fail kar sakta hai.</li><li>Strategies: manual, best quality, lowest cost (SLA), maximize bandwidth (SLA).</li><li>Rules upar se neeche match hote hain; unmatched traffic implicit rule use karta hai (default load balancing source-ip-based).</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Try it: lab "Aadhe users browse nahi kar pa rahe" aur is module ke baaki do labs</span>
config system sdwan
diagnose sys sdwan member
diagnose sys sdwan zone
diagnose sys sdwan health-check
diagnose sys sdwan service
get router info routing-table all
diagnose debug flow filter addr 10.0.1.10
diagnose debug flow trace start 5
diagnose debug enable</pre>
<h3>Kahan practise karein</h3>
<p>Is module ke teen labs bina hints ke poore hone tak repeat karo, phir un pieces ko mazboot karo jin par SD-WAN bana hai: <b>nse4-routing</b> ke dono labs (floating route aur reverse-path check) repeat karo, <b>enarsi-pbr-vrf-bfd</b> mein tracking aur policy routing practise karo, aur SD-WAN sites ke beech use hone wali dynamic routing <b>nse4-dynamic</b>, <b>enarsi-ospf</b>, <b>enarsi-bgp</b> aur <b>jncis-ospf</b> mein seekho.</p>
<div class="exam"><p><b>Exam trap.</b> Agar koi answer sirf IP address se members configure karne ya member interfaces ko policy mein jodne ki baat kare to woh shayad galat hai: policies zone use karti hain.</p></div>
<div class="scn"><h4>Whiteboard answer jisne job dilai</h4><p>Interview mein ek candidate ne zone, do members, ek health check aur ek voice rule banaya, phir samjhaya ki primary link alive par lossy ho to kya hota hai: woh SLA fail karti hai, voice rule doosre member par chala jaata hai, jabki web traffic implicit rule par rehta hai. Panel ne note kiya ki usne alive, out-of-SLA aur dead ko alag rakha.</p><p><b>Seekh:</b> Clear states aur clear decisions interview jeetate hain.</p></div>
<div class="iv"><p class="q">"FortiGate SD-WAN do minute mein samjhao."</p><p>Links zone ke members banti hain; ek route aur ek policy zone ko point karti hain. Health checks har member ka loss, latency aur jitter naapte hain, SLA thresholds batate hain ki achha kya hai, aur rules strategy se traffic steer karte hain, upar se neeche, routing table se pehle evaluate hote hain. Unmatched traffic load-balance mode ke saath implicit rule use karta hai. Dead members skip hote hain aur out-of-SLA members un rules dwara skip hote hain jinhe SLA chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Members, zone, health check, SLA, rules, implicit rule: chhe ke chhe jaano.</li><li>Alive, out of SLA aur dead alag states hain.</li><li>Policies aur routes zone use karte hain.</li><li>Yahan ke teen SD-WAN labs aur nse4-routing ki foundations practise karo.</li></ul></div>
`}};export{e as default};