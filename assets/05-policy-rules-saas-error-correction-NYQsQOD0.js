var e={id:`policy-rules-saas-error-correction`,h:{en:`SD-WAN policy rules, SaaS monitoring and error correction`,hi:`SD-WAN policy rules, SaaS monitoring aur error correction`},body:{en:`
<p>The SD-WAN policy rule is where the objects of the previous chapters meet an application. It says: for traffic from this zone to that zone, for these applications, judge the paths by this path quality profile, choose links with this traffic distribution profile and, if needed, protect the flow with an error correction profile. This chapter also covers monitoring SaaS applications reached by direct internet access, and the error correction methods, FEC and packet duplication.</p>
<h3>Analogy: a courier instruction card</h3>
<p>For each type of parcel the dispatcher keeps a card: where from, where to, what is inside, how fast it must be (path quality), which road families to use (distribution), and whether to send a spare copy (error correction). The card is the SD-WAN policy rule.</p>
<h3>Fields of an SD-WAN policy rule</h3>
<table class="cmp"><tr><th>Field</th><th>Purpose</th></tr>
<tr><td><b>Source zone and destination zone</b></td><td>Where the traffic comes from and goes to; each can be a specific zone or any</td></tr>
<tr><td><b>Applications</b></td><td>Which applications the rule steers. The documentation advises adding only business-critical applications and those sensitive to path conditions</td></tr>
<tr><td><b>Path quality profile</b></td><td>The latency, jitter and loss thresholds; breach means choose another path</td></tr>
<tr><td><b>SaaS quality profile</b></td><td>Monitoring of SaaS applications for branches with direct internet access; available from SD-WAN plugin 2.0</td></tr>
<tr><td><b>Traffic distribution profile</b></td><td>How paths are chosen for load distribution and failover</td></tr>
<tr><td><b>Error correction profile</b></td><td>Forward error correction or packet duplication for reliability</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SD-WAN policy rule">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">Zones and</text><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="12">applications</text>
<rect x="170" y="20" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="235" y="48" text-anchor="middle" class="svg-ink" font-size="12">Path quality</text><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="12">Traffic distribution</text><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="500" y="20" width="130" height="60" rx="8" fill="#fed7aa"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">Error correction</text><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<line x1="140" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="500" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="120" width="300" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="12">SaaS quality profile (DIA branches)</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="11">used in place of tunnel probing</text>
<line x1="235" y1="80" x2="235" y2="120" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">One rule combines the match (zones, applications) with the quality, distribution and protection choices.</p></div>
<h3>SaaS monitoring</h3>
<p>For branches that reach SaaS applications over direct internet access, there is no branch-to-hub tunnel to probe. The SaaS quality profile (plugin 2.0 and later) lets the firewall judge the path to the SaaS application. The redundant-internet tutorial shows the passive approach: a profile in an adaptive mode that uses session statistics to assess path quality without needing external probing infrastructure. Other monitoring modes exist in the product; check the current documentation for their names and options before relying on them.</p>
<h3>Error correction: FEC and packet duplication</h3>
<table class="cmp"><tr><th>Method</th><th>What it does</th><th>Cost</th></tr>
<tr><td><b>Forward error correction (FEC)</b></td><td>The sender adds redundant parity data so the receiver can recover lost or corrupted packets without retransmission</td><td>Some bandwidth overhead; good for voice and video</td></tr>
<tr><td><b>Packet duplication</b></td><td>Duplicates a whole application session from one tunnel onto a second tunnel</td><td>More resources than FEC; for critical applications with minimal loss tolerance</td></tr></table>
<p>Constraints stated in the documentation:</p>
<ul>
<li>MTU: 1,340 bytes is supported; a larger packet will not go through these processes.</li>
<li>Do not use them on DIA links; only VPN tunnels between branches and hubs qualify.</li>
<li>One application per SD-WAN policy rule that uses error correction.</li>
<li>Encoder and decoder must run PAN-OS 10.0.2 or later; incompatible firewalls drop traffic that carries the headers.</li>
<li>Full mesh is supported from PAN-OS 10.0.3, alongside hub-and-spoke.</li>
<li>The profile is applied at the encoder (the initiating firewall); the decoder needs no specific configuration.</li>
<li>In PAN-OS 10.0.2, a rule cannot have both a SaaS quality profile and an error correction profile (version-specific; check newer releases).</li>
</ul>
<div class="eg"><p><b>Worked example: three rules for Harbor Foods.</b> Rule 1 "voice": zones corporate to WAN, application voice only, voice path quality profile (150 ms, 30 ms, 1 percent), Best Available Path over Broadband and Cellular, FEC profile. Rule 2 "saas": zones corporate to internet, SaaS applications, SaaS quality profile, Best Available Path over Broadband. Rule 3 "bulk": backup application, default quality profile, Weighted Session Distribution 70 to 30. Voice has one application only because of the FEC limitation, and bulk has no error correction because it tolerates retransmission.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Adding every application to one rule. Using FEC or duplication on a DIA link. Putting two applications into a rule that has an error correction profile. Forgetting that large packets above the supported MTU bypass the protection.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Where do you configure FEC for a flow?" In an error correction profile referenced by the SD-WAN policy rule on the sending firewall. "Can you use FEC on direct internet access?" No. "How many applications with error correction per rule?" One.</p></div>
<div class="scn"><h4>FEC applied, calls still choppy</h4><p>FEC is enabled for voice, yet some calls still break. The packet capture shows 1,420-byte video-conference packets in the same rule. The rule has several applications and large packets, both outside the stated limits. Splitting voice into its own rule with one application and keeping packet sizes within the supported MTU restores protection.</p></div>
<div class="iv"><p class="q">"When would you choose packet duplication over FEC?"</p><p>For a small number of business-critical flows that cannot tolerate even small loss, and where I can afford to use a second tunnel for a full copy. FEC suits voice and video where a small overhead is acceptable. Both need VPN tunnels, not direct internet access, and one application per rule.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The SD-WAN policy rule combines zones, applications and three profile choices.</li>
<li>SaaS quality profile covers DIA branches (plugin 2.0 or later).</li>
<li>FEC recovers loss with parity data; packet duplication copies a session to a second tunnel.</li>
<li>Limits: MTU 1,340, VPN tunnels only, one application per rule, encoder-side configuration.</li>
</ul></div>
`,hi:`
<p>SD-WAN policy rule woh jagah hai jahan pichhle chapters ke objects ek application se milte hain. Woh kehta hai: is zone se us zone ke traffic ke liye, in applications ke liye, paths ko is path quality profile se judge karo, is traffic distribution profile se links chuno aur zaroorat ho to flow ko error correction profile se protect karo. Yeh chapter direct internet access se pahunche SaaS applications ki monitoring aur error correction methods, FEC aur packet duplication, bhi cover karta hai.</p>
<h3>Analogy: courier instruction card</h3>
<p>Har parcel type ke liye dispatcher ek card rakhta hai: kahan se, kahan tak, andar kya hai, kitna tez chahiye (path quality), kaunse road families use karne hain (distribution), aur kya spare copy bhejni hai (error correction). Woh card SD-WAN policy rule hai.</p>
<h3>SD-WAN policy rule ke fields</h3>
<table class="cmp"><tr><th>Field</th><th>Purpose</th></tr>
<tr><td><b>Source zone aur destination zone</b></td><td>Traffic kahan se aata hai aur kahan jaata hai; har ek specific zone ya any ho sakta hai</td></tr>
<tr><td><b>Applications</b></td><td>Rule kin applications ko steer karta hai. Documentation salah deti hai ki sirf business-critical aur path conditions se sensitive applications jodo</td></tr>
<tr><td><b>Path quality profile</b></td><td>Latency, jitter aur loss thresholds; breach ka matlab doosra path chuno</td></tr>
<tr><td><b>SaaS quality profile</b></td><td>Direct internet access wale branches ke liye SaaS applications ki monitoring; SD-WAN plugin 2.0 se available</td></tr>
<tr><td><b>Traffic distribution profile</b></td><td>Load distribution aur failover ke liye paths kaise chune jayein</td></tr>
<tr><td><b>Error correction profile</b></td><td>Reliability ke liye forward error correction ya packet duplication</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SD-WAN policy rule">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">Zones and</text><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="12">applications</text>
<rect x="170" y="20" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="235" y="48" text-anchor="middle" class="svg-ink" font-size="12">Path quality</text><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="12">Traffic distribution</text><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="500" y="20" width="130" height="60" rx="8" fill="#fed7aa"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">Error correction</text><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<line x1="140" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="500" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="120" width="300" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="12">SaaS quality profile (DIA branches)</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="11">used in place of tunnel probing</text>
<line x1="235" y1="80" x2="235" y2="120" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Ek rule match (zones, applications) ko quality, distribution aur protection choices se jodta hai.</p></div>
<h3>SaaS monitoring</h3>
<p>Jo branches SaaS applications ko direct internet access se pahunchte hain unke liye branch-to-hub tunnel nahi hota jise probe kiya jaye. SaaS quality profile (plugin 2.0 aur baad) firewall ko SaaS application tak ke path ko judge karne deta hai. Redundant-internet tutorial passive approach dikhata hai: adaptive mode wala profile jo session statistics se path quality assess karta hai bina external probing infrastructure ke. Product mein doosre monitoring modes bhi hain; unpar bharosa karne se pehle unke naam aur options current documentation mein check karo.</p>
<h3>Error correction: FEC aur packet duplication</h3>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th><th>Cost</th></tr>
<tr><td><b>Forward error correction (FEC)</b></td><td>Sender redundant parity data jodta hai taaki receiver retransmission ke bina lost ya corrupted packets recover kar sake</td><td>Thoda bandwidth overhead; voice aur video ke liye achha</td></tr>
<tr><td><b>Packet duplication</b></td><td>Poore application session ko ek tunnel se doosre tunnel par duplicate karta hai</td><td>FEC se zyada resources; kam loss tolerance wali critical applications ke liye</td></tr></table>
<p>Documentation mein bataye constraints:</p>
<ul>
<li>MTU: 1,340 bytes supported hai; usse bada packet in processes se nahi guzarta.</li>
<li>DIA links par use mat karo; sirf branches aur hubs ke beech VPN tunnels qualify karte hain.</li>
<li>Error correction use karne wale har SD-WAN policy rule mein ek hi application.</li>
<li>Encoder aur decoder PAN-OS 10.0.2 ya baad chalayein; incompatible firewalls headers wala traffic drop karte hain.</li>
<li>Full mesh PAN-OS 10.0.3 se supported hai, hub-and-spoke ke saath.</li>
<li>Profile encoder (initiating firewall) par lagta hai; decoder ko koi specific configuration nahi chahiye.</li>
<li>PAN-OS 10.0.2 mein rule ke paas SaaS quality profile aur error correction profile dono nahi ho sakte (version-specific; naye releases check karo).</li>
</ul>
<div class="eg"><p><b>Worked example: Harbor Foods ke teen rules.</b> Rule 1 "voice": zones corporate se WAN, sirf voice application, voice path quality profile (150 ms, 30 ms, 1 percent), Broadband aur Cellular par Best Available Path, FEC profile. Rule 2 "saas": zones corporate se internet, SaaS applications, SaaS quality profile, Broadband par Best Available Path. Rule 3 "bulk": backup application, default quality profile, Weighted Session Distribution 70 se 30. Voice mein sirf ek application FEC limitation ki wajah se hai, aur bulk mein error correction nahi kyunki woh retransmission sah leta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Har application ek rule mein jodna. DIA link par FEC ya duplication use karna. Error correction profile wale rule mein do applications dalna. Yeh bhool jaana ki supported MTU se bade packets protection se bypass hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Flow ke liye FEC kahan configure hota hai?" Sending firewall par SD-WAN policy rule se refer hone wale error correction profile mein. "Kya direct internet access par FEC use kar sakte hain?" Nahi. "Error correction ke saath ek rule mein kitni applications?" Ek.</p></div>
<div class="scn"><h4>FEC lagaya, calls phir bhi choppy</h4><p>Voice ke liye FEC enabled hai, phir bhi kuch calls toot jaati hain. Packet capture mein usi rule mein 1,420-byte video-conference packets dikhte hain. Rule mein kai applications aur bade packets hain, dono bataye gaye limits ke bahar. Voice ko ek application ke saath apne rule mein alag karna aur packet sizes supported MTU ke andar rakhna protection wapas laata hai.</p></div>
<div class="iv"><p class="q">"FEC ke bajay packet duplication kab chunoge?"</p><p>Kuch gine-chune business-critical flows ke liye jo chhota sa loss bhi nahi sah sakte, aur jahan main poori copy ke liye doosra tunnel afford kar sakta hoon. FEC voice aur video ke liye theek hai jahan thoda overhead chalta hai. Dono ko VPN tunnels chahiye, direct internet access nahi, aur ek rule mein ek application.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN policy rule zones, applications aur teen profile choices jodta hai.</li>
<li>SaaS quality profile DIA branches cover karta hai (plugin 2.0 ya baad).</li>
<li>FEC parity data se loss recover karta hai; packet duplication session ko doosre tunnel par copy karta hai.</li>
<li>Limits: MTU 1,340, sirf VPN tunnels, ek rule mein ek application, encoder-side configuration.</li>
</ul></div>
`}};export{e as default};