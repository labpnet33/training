var e={id:`nat-policy`,h:{en:`NAT policy: zones, pools, source and destination NAT, ALG disable`,hi:`NAT policy: zones, pools, source aur destination NAT, ALG disable`},body:{en:`
<p>Private addresses cannot travel on the internet, so something must translate them. In Prisma SD-WAN that something is the <b>NAT policy</b>. It matters most for local internet breakout, for published servers at a site and for voice systems that dislike translation. The exam lists <b>NAT</b> as a policy design topic.</p>
<h3>Analogy: the front desk that swaps room numbers for the hotel's street address</h3>
<p>Guests inside the hotel have room numbers (private addresses). Letters leaving the hotel carry the hotel's street address (public address) so replies find their way back; the front desk remembers who sent what. Inbound visitors who ask for "the conference room" are directed to the right room (destination NAT). That is NAT in one picture.</p>
<h3>Building blocks</h3>
<ul>
<li><b>NAT policy set:</b> a list of NAT rules. Sets are part of <b>NAT policy set stacks</b>. A <b>simple NAT stack</b> holds one set; an <b>advanced NAT stack</b> holds several ordered sets (the documentation says up to 4), and a simple stack becomes advanced when you assign more than one set. Sets are created in the Advanced view only.</li>
<li><b>NAT zone:</b> the documented use cases use the <b>NAT Zone Internet</b> for traffic to and from the internet. NAT zones are configured separately and selected in the rule.</li>
<li><b>NAT pool:</b> a set of public addresses used for translation (up to four pools per rule).</li>
<li><b>NAT stack:</b> the object you bind to sites. A branch site needs path, QoS and NAT policy assigned; security is optional.</li>
</ul>
<h3>Rule fields</h3>
<table class="cmp"><tr><th>Field</th><th>Documentation facts</th></tr>
<tr><td>Name, description, tags</td><td>Name is required</td></tr>
<tr><td>Zone</td><td>Source zone rules or destination zone rules, according to the direction of traffic; a NAT zone is selected (or created)</td></tr>
<tr><td>Order</td><td>Rule order; 1 is the highest priority</td></tr>
<tr><td>Match</td><td>Protocol (1 to 255), source and destination prefixes, port ranges (maximum 16; TCP and UDP only)</td></tr>
<tr><td>Action</td><td>No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable</td></tr>
<tr><td>Pool</td><td>NAT pool, maximum four per rule</td></tr>
<tr><td>Disable rule</td><td>Turn a rule off without deleting it</td></tr></table>
<h3>The use cases in the documentation</h3>
<table class="cmp"><tr><th>Use case</th><th>Purpose</th><th>Result</th></tr>
<tr><td><b>Source NAT</b> (default)</td><td>Internal users with private addresses reach the internet</td><td>Source address rewritten to the internet interface address</td></tr>
<tr><td><b>Destination NAT</b></td><td>External entities reach internal private resources</td><td>Inbound destination translated to the internal server</td></tr>
<tr><td><b>Static Source NAT</b></td><td>A specific internal server must talk to external entities consistently</td><td>One-to-one mapping to a persistent public address</td></tr>
<tr><td><b>Static Destination NAT</b></td><td>External entities reach a specific application on an internal server</td><td>One-to-one mapping from a public address to the server</td></tr>
<tr><td><b>ALG Disable</b></td><td>Internal IP phones talk SIP to an external UCaaS provider</td><td>The SIP application layer gateway is disabled to avoid translation problems</td></tr>
<tr><td><b>No NAT</b></td><td>Traffic must keep its address, for example to enterprise destinations</td><td>Excludes other NAT actions for that match</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NAT at a branch">
<rect x="10" y="60" width="130" height="80" rx="10" fill="#bae6fd"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Store LAN</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="11">10.110.20.0/24</text>
<rect x="200" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="275" y="92" text-anchor="middle" class="svg-ink" font-size="13">ION: NAT policy</text><text x="275" y="112" text-anchor="middle" class="svg-muted" font-size="11">rules by order</text>
<rect x="420" y="10" width="210" height="60" rx="10" fill="#bbf7d0"/><text x="525" y="36" text-anchor="middle" class="svg-ink" font-size="13">Fabric (enterprise)</text><text x="525" y="54" text-anchor="middle" class="svg-muted" font-size="11">No NAT: keep 10.x</text>
<rect x="420" y="130" width="210" height="60" rx="10" fill="#fde68a"/><text x="525" y="156" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="525" y="174" text-anchor="middle" class="svg-muted" font-size="11">Source NAT: 198.51.100.10</text>
<line x1="140" y1="100" x2="200" y2="100" stroke="#64748b" stroke-width="2"/><line x1="350" y1="85" x2="420" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="420" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Enterprise-bound traffic keeps its private address (No NAT); internet-bound traffic is source-translated to the circuit address (a documentation example address here).</p></div>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documented place for NAT stacks is Configuration, Prisma SD-WAN, Policies, NAT, NAT Stacks, Advanced, where you assign up to four policy sets to an advanced NAT stack. NAT zones and NAT pools have their own configuration pages in the NAT policy documentation. Sequence: create NAT zones, create pools if needed, create the policy set and rules, put the set into a NAT stack, bind the stack to sites.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Design table for the Harbor Foods store NAT set. Not device commands.</span>
Order  Action              Match                                  Zone / Pool
  1    No NAT              dest prefix 10.0.0.0/8 (enterprise)     NAT Zone Internet not used
  2    ALG Disable         UDP/TCP 5060 to UCaaS-Provider prefix   NAT Zone Internet
  3    Static Dest NAT     public 198.51.100.20:443 to 10.110.20.50:443 (kiosk server)  NAT Zone Internet
  4    Source NAT          source 10.110.0.0/16, to internet       NAT Zone Internet, pool: circuit address</pre>
<div class="eg"><p><b>Worked example: why No NAT comes first.</b> A store host 10.110.20.15 sends traffic to the data center server 10.20.40.10 and to a SaaS site. If the source NAT rule at order 1 matched all traffic, the data center would see a public circuit address instead of the host, breaking return routing and logs. With No NAT at order 1 for destinations in 10.0.0.0/8, enterprise traffic keeps its address and only internet-bound flows are translated at order 4.</p></div>
<div class="warn"><p><b>Common mistakes.</b> A broad Source NAT rule above a No NAT rule, so enterprise traffic is translated. NAT on the branch but no matching security rule for the published server. Leaving the SIP ALG on for a UCaaS provider that does its own handling. Forgetting that only the first four (or fewer) pools or sets fit the limits.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT actions: No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable. Port ranges apply to TCP and UDP only, maximum 16. Up to four NAT policy sets in an advanced NAT stack; up to four pools per rule. Destination NAT and static destination NAT need a security rule that allows the inbound traffic.</p></div>
<div class="scn"><h4>One-way audio</h4><p>After moving to a cloud phone provider, staff at a store heard each other but customers on the line heard silence in one direction. The SIP session used the ION's SIP ALG, which rewrote addresses inside the signalling and conflicted with the provider's own handling. A NAT rule with the ALG Disable action for the provider prefix fixed it.</p><p><b>Lesson:</b> modern UCaaS often needs the ALG off; use ALG Disable on the specific prefix, not everywhere.</p></div>
<div class="iv"><p class="q">"How do you design NAT for local internet breakout at 100 branches?"</p><p>One NAT stack bound to all branches: a No NAT rule first for enterprise prefixes, specific rules (ALG disable for the voice provider, static destination NAT for any published server), and a Source NAT rule for internet-bound traffic using the circuit address or a pool. I pair it with a security policy that allows only the intended inbound flows.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT policy: sets inside simple or advanced stacks (up to four sets), bound to sites, with NAT zones and pools.</li>
<li>Actions: No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable.</li>
<li>Match: protocol, prefixes, port ranges (max 16, TCP and UDP); max four pools per rule.</li>
<li>Put No NAT for enterprise destinations before Source NAT.</li>
<li>Published servers need NAT and a security rule; UCaaS may need ALG Disable.</li>
</ul></div>
`,hi:`
<p>Private addresses internet par nahi ja sakte, isliye koi unhe translate kare. Prisma SD-WAN mein woh <b>NAT policy</b> hai. Yeh local internet breakout, site par published servers aur un voice systems ke liye sabse zyada matter karti hai jinhe translation pasand nahi. Exam <b>NAT</b> ko policy design topic ki tarah list karta hai.</p>
<h3>Analogy: front desk jo room numbers ko hotel ke street address se badal deta hai</h3>
<p>Hotel ke andar guests ke room numbers hote hain (private addresses). Hotel se nikalne wale letters par hotel ka street address (public address) hota hai taaki replies raasta dhoondh lein; front desk yaad rakhta hai ki kisne kya bheja. Bahar se aane wale visitors jo "conference room" maangte hain unhe sahi room tak bheja jaata hai (destination NAT). Yeh NAT ek picture mein.</p>
<h3>Building blocks</h3>
<ul>
<li><b>NAT policy set:</b> NAT rules ki list. Sets <b>NAT policy set stacks</b> ka hissa hote hain. <b>Simple NAT stack</b> mein ek set; <b>advanced NAT stack</b> mein kai ordered sets (documentation chaar tak kehti hai), aur ek se zyada set assign karne par simple stack advanced ban jaata hai. Sets sirf Advanced view mein bante hain.</li>
<li><b>NAT zone:</b> documented use cases internet ke traffic ke liye <b>NAT Zone Internet</b> use karte hain. NAT zones alag configure hote hain aur rule mein select hote hain.</li>
<li><b>NAT pool:</b> translation ke liye public addresses ka set (har rule mein chaar pools tak).</li>
<li><b>NAT stack:</b> woh object jo aap sites se bind karte ho. Branch site ko path, QoS aur NAT policy assign chahiye; security optional hai.</li>
</ul>
<h3>Rule fields</h3>
<table class="cmp"><tr><th>Field</th><th>Documentation facts</th></tr>
<tr><td>Name, description, tags</td><td>Name required hai</td></tr>
<tr><td>Zone</td><td>Traffic ki direction ke hisaab se source zone rules ya destination zone rules; NAT zone select (ya create) hota hai</td></tr>
<tr><td>Order</td><td>Rule order; 1 sabse high priority</td></tr>
<tr><td>Match</td><td>Protocol (1 se 255), source aur destination prefixes, port ranges (maximum 16; sirf TCP aur UDP)</td></tr>
<tr><td>Action</td><td>No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable</td></tr>
<tr><td>Pool</td><td>NAT pool, har rule mein maximum chaar</td></tr>
<tr><td>Disable rule</td><td>Rule ko delete kiye bina off karo</td></tr></table>
<h3>Documentation ke use cases</h3>
<table class="cmp"><tr><th>Use case</th><th>Purpose</th><th>Result</th></tr>
<tr><td><b>Source NAT</b> (default)</td><td>Private addresses wale internal users internet tak pahunchte hain</td><td>Source address internet interface address mein rewrite hota hai</td></tr>
<tr><td><b>Destination NAT</b></td><td>External entities internal private resources tak pahunchte hain</td><td>Inbound destination internal server mein translate hota hai</td></tr>
<tr><td><b>Static Source NAT</b></td><td>Specific internal server ko external entities se consistently baat karni hai</td><td>Persistent public address ke saath one-to-one mapping</td></tr>
<tr><td><b>Static Destination NAT</b></td><td>External entities internal server ki specific application tak pahunchte hain</td><td>Public address se server tak one-to-one mapping</td></tr>
<tr><td><b>ALG Disable</b></td><td>Internal IP phones external UCaaS provider se SIP par baat karte hain</td><td>SIP application layer gateway disable hota hai taaki translation problems na hon</td></tr>
<tr><td><b>No NAT</b></td><td>Traffic ko apna address rakhna hai, jaise enterprise destinations ke liye</td><td>Us match ke liye doosre NAT actions ko exclude karta hai</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NAT at a branch">
<rect x="10" y="60" width="130" height="80" rx="10" fill="#bae6fd"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Store LAN</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="11">10.110.20.0/24</text>
<rect x="200" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="275" y="92" text-anchor="middle" class="svg-ink" font-size="13">ION: NAT policy</text><text x="275" y="112" text-anchor="middle" class="svg-muted" font-size="11">rules order se</text>
<rect x="420" y="10" width="210" height="60" rx="10" fill="#bbf7d0"/><text x="525" y="36" text-anchor="middle" class="svg-ink" font-size="13">Fabric (enterprise)</text><text x="525" y="54" text-anchor="middle" class="svg-muted" font-size="11">No NAT: 10.x rakho</text>
<rect x="420" y="130" width="210" height="60" rx="10" fill="#fde68a"/><text x="525" y="156" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="525" y="174" text-anchor="middle" class="svg-muted" font-size="11">Source NAT: 198.51.100.10</text>
<line x1="140" y1="100" x2="200" y2="100" stroke="#64748b" stroke-width="2"/><line x1="350" y1="85" x2="420" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="420" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Enterprise-bound traffic apna private address rakhta hai (No NAT); internet-bound traffic circuit address mein source-translate hota hai (yahan documentation example address).</p></div>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>NAT stacks ki documented jagah hai Configuration, Prisma SD-WAN, Policies, NAT, NAT Stacks, Advanced, jahan aap advanced NAT stack ko chaar tak policy sets assign karte ho. NAT zones aur NAT pools ke apne configuration pages NAT policy documentation mein hain. Sequence: NAT zones banao, zarurat ho to pools banao, policy set aur rules banao, set ko NAT stack mein rakho, stack ko sites se bind karo.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Harbor Foods store NAT set ki design table. Device commands nahi.</span>
Order  Action              Match                                  Zone / Pool
  1    No NAT              dest prefix 10.0.0.0/8 (enterprise)     NAT Zone Internet use nahi
  2    ALG Disable         UDP/TCP 5060 to UCaaS-Provider prefix   NAT Zone Internet
  3    Static Dest NAT     public 198.51.100.20:443 to 10.110.20.50:443 (kiosk server)  NAT Zone Internet
  4    Source NAT          source 10.110.0.0/16, to internet       NAT Zone Internet, pool: circuit address</pre>
<div class="eg"><p><b>Worked example: No NAT pehle kyun aata hai.</b> Store host 10.110.20.15 data center server 10.20.40.10 aur ek SaaS site ko traffic bhejta hai. Agar order 1 ka source NAT rule saare traffic ko match karta, to data center host ki jagah public circuit address dekhta, jisse return routing aur logs toot jaate. 10.0.0.0/8 destinations ke liye order 1 par No NAT ke saath enterprise traffic apna address rakhta hai aur sirf internet-bound flows order 4 par translate hote hain.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> No NAT rule ke upar broad Source NAT rule, jisse enterprise traffic translate ho jaata hai. Branch par NAT par published server ke liye matching security rule nahi. UCaaS provider ke liye SIP ALG on chhodna jabki provider apna handling karta hai. Yeh bhoolna ki limits (chaar sets ya pools) ke andar hi fit hona hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT actions: No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable. Port ranges sirf TCP aur UDP par, maximum 16. Advanced NAT stack mein chaar tak NAT policy sets; har rule mein chaar tak pools. Destination NAT aur static destination NAT ko inbound traffic allow karne wala security rule chahiye.</p></div>
<div class="scn"><h4>One-way audio</h4><p>Cloud phone provider par move karne ke baad store ke staff ek doosre ko sunte the par line par customers ko ek direction mein khamoshi sunai deti thi. SIP session ION ka SIP ALG use kar raha tha, jisne signalling ke andar addresses rewrite kiye aur provider ke apne handling se takraya. Provider prefix ke liye ALG Disable action wale NAT rule ne fix kar diya.</p><p><b>Seekh:</b> modern UCaaS ko aksar ALG off chahiye; ALG Disable specific prefix par use karo, har jagah nahi.</p></div>
<div class="iv"><p class="q">"100 branches par local internet breakout ke liye NAT kaise design karoge?"</p><p>Saari branches se bound ek NAT stack: pehle enterprise prefixes ke liye No NAT rule, specific rules (voice provider ke liye ALG disable, kisi published server ke liye static destination NAT), aur internet-bound traffic ke liye circuit address ya pool ke saath Source NAT rule. Main use ek aisi security policy ke saath jodta hoon jo sirf intended inbound flows allow kare.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT policy: simple ya advanced stacks (chaar sets tak) ke andar sets, sites se bound, NAT zones aur pools ke saath.</li>
<li>Actions: No NAT, Source NAT, Destination NAT, Static Source NAT, Static Destination NAT, ALG Disable.</li>
<li>Match: protocol, prefixes, port ranges (max 16, TCP aur UDP); har rule mein max chaar pools.</li>
<li>Enterprise destinations ke liye No NAT ko Source NAT se pehle rakho.</li>
<li>Published servers ko NAT aur security rule dono chahiye; UCaaS ko ALG Disable chahiye ho sakta hai.</li>
</ul></div>
`}};export{e as default};