var e={id:`big-picture`,h:{en:`What you will learn: steering traffic over good paths`,hi:`Aap kya seekhoge: traffic ko achhe path par steer karna`},body:{en:`
<p>Imagine a courier company with three roads between Delhi and Mumbai: a toll expressway (fast and clean), a normal highway (cheaper, sometimes jammed) and a mountain road (slow, but it is always open). Parcels are not all equal. A hospital blood sample must take the expressway. A bulk box of old files can take any road. If the expressway is flooded, the dispatcher must not send the blood sample down a road that takes ten hours; he picks the next best road that is still fast enough. <b>SD-WAN policy</b> is exactly this dispatcher. It looks at each application, knows what quality that application needs, measures the roads continuously, and chooses a road for every flow.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>What voice, video, ERP, web and backup traffic need from a network (latency, jitter, loss) and why.</li>
<li>How the branch <b>identifies</b> applications and why a rule that matches the wrong application silently does nothing.</li>
<li>How <b>SLA monitoring</b> measures each transport and how an <b>SLA profile</b> turns numbers into "meets" or "does not meet".</li>
<li><b>Forwarding profiles</b>: priority lists, fallback allow or drop, and the exact decision rule used in the labs.</li>
<li><b>Policy structure</b>: policy, rules, match, order, first match and the default behaviour when nothing matches.</li>
<li>Foundations of <b>QoS</b>, direct internet access and security, and how they relate to steering.</li>
<li>How to verify, and how to troubleshoot two real tickets: a carrier brownout and a rule that never matches.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished the earlier Versa modules: the architecture (Director, Controller, Analytics, VOS branches), the overlay (transport domains, tunnels, MP-BGP, organization, site-id) and onboarding. Here we only <b>use</b> the three tunnels that already exist between the branches and the Controller. If a tunnel is down, go back to the overlay module first; policy cannot steer onto a path that does not exist.</p>

<h3>The lab network in one picture</h3>
<p>Every lab in this module uses organization <code>Acme</code>. Branch1 is Delhi (site-id 101), Branch2 is Bengaluru (102) and Branch3 is Kolkata (103). Each branch has three WAN circuits: <code>vni-0/0</code> Internet, <code>vni-0/1</code> MPLS and <code>vni-0/2</code> LTE, and a LAN on <code>vni-0/3</code> (10.1.k.0/24). By default the circuits measure like this:</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three transports from a branch">
<rect x="20" y="85" width="130" height="80" rx="8" fill="#bae6fd"/><text x="85" y="118" text-anchor="middle" class="svg-ink" font-size="14">Branch1 Delhi</text><text x="85" y="138" text-anchor="middle" class="svg-muted" font-size="12">site-id 101</text><text x="85" y="154" text-anchor="middle" class="svg-muted" font-size="12">Acme</text>
<rect x="490" y="85" width="130" height="80" rx="8" fill="#ddd6fe"/><text x="555" y="118" text-anchor="middle" class="svg-ink" font-size="14">Remote site</text><text x="555" y="138" text-anchor="middle" class="svg-muted" font-size="12">Branch2 / Controller</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="13">MPLS vni-0/1</text><text x="325" y="56" text-anchor="middle" class="svg-muted" font-size="12">20 ms / 2 ms / 0.05 %</text>
<rect x="260" y="103" width="130" height="44" rx="8" fill="#fde68a"/><text x="325" y="123" text-anchor="middle" class="svg-ink" font-size="13">Internet vni-0/0</text><text x="325" y="139" text-anchor="middle" class="svg-muted" font-size="12">30 ms / 6 ms / 0.3 %</text>
<rect x="260" y="186" width="130" height="44" rx="8" fill="#fed7aa"/><text x="325" y="206" text-anchor="middle" class="svg-ink" font-size="13">LTE vni-0/2</text><text x="325" y="222" text-anchor="middle" class="svg-muted" font-size="12">60 ms / 15 ms / 1 %</text>
<line x1="150" y1="110" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="260" y2="208" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="208" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three transports, each with its own measured latency, jitter and loss (default lab values).</p></div>

<div class="note"><p><b>The course CLI is a simplified model.</b> Real Versa is configured in the Director GUI (templates, workflows, SD-WAN policy objects) and in the much larger VOS CLI. The labs use a small CLI that keeps the same ideas and the same words: SLA profile, forwarding profile, policy, rule. Where the real product has more options, the chapters say so. The helper <code>show ... path-selection application</code> is a course helper that tells you what the policy would choose right now.</p></div>

<h3>The three objects in one sentence</h3>
<ul>
<li>An <b>SLA profile</b> says what "good enough" means (latency, jitter, loss limits).</li>
<li>A <b>forwarding profile</b> says which transports to try, in which order, and what to do if none is good enough.</li>
<li>A <b>policy</b> holds <b>rules</b>; a rule matches an application and points to a forwarding profile.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Delhi sends a voice call to Bengaluru. The rule R-VOICE matches application voice and points to VOICE-FP. VOICE-FP says: SLA profile VOICE (150 ms, 30 ms, 1 %), priority MPLS then Internet, fallback allow. MPLS measures 20/2/0.05, so it meets the SLA and is first in the list. The call goes over MPLS. Web traffic matches no rule, so it is simply spread over every tunnel that is up.</p></div>

<div class="warn"><p><b>Common mistake:</b> thinking policy "creates" paths. Policy only <b>chooses</b> among tunnels that already exist and are up.</p></div>
<div class="exam"><p><b>Exam trap:</b> SD-WAN steering is decided per application flow at the branch; it is not a routing protocol metric. MP-BGP carries LAN prefixes; policy chooses the transport for each flow.</p></div>

<div class="scn"><h4>The "slow phone calls" complaint</h4><p>The Delhi manager complains that calls to Bengaluru sound robotic every afternoon. The engineer opens the SLA monitor and sees the Internet circuit at 190 ms while MPLS is clean at 20 ms. Voice was load-balanced over all tunnels, so one third of calls rode the bad path. A voice rule that prefers MPLS and requires the SLA fixes it without touching the circuits.</p><p><b>Lesson:</b> Without a policy, good and bad paths are used equally. Policy puts the right traffic on the right path.</p></div>

<div class="iv"><p class="q">"What problem does SD-WAN policy solve that plain routing does not?"</p><p>Routing picks one best path per prefix, blind to application and to live quality. SD-WAN policy classifies the application, measures each transport (latency, jitter, loss) and steers each flow to a transport that meets that application's SLA, with a defined fallback. Mention SLA profiles and forwarding profiles by name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy chooses a transport for each application flow among tunnels that are up.</li>
<li>Three objects: SLA profile, forwarding profile, policy with rules.</li>
<li>The labs use organization Acme, Branch1 Delhi and three transports: Internet, MPLS, LTE.</li>
<li>The CLI is a simplified course model of real Versa.</li>
</ul></div>
`,hi:`
<p>Socho ek courier company ke paas Delhi se Mumbai ke teen roads hain: ek toll expressway (fast aur clean), ek normal highway (sasti, kabhi kabhi jam) aur ek pahadi road (slow, lekin hamesha open). Sab parcels barabar nahi hote. Hospital ka blood sample expressway se hi jaana chahiye. Purani files ka bulk box kisi bhi road se ja sakta hai. Agar expressway mein pani bhar gaya, to dispatcher blood sample ko aise road par nahi bhejega jahan dus ghante lagte hain; woh agla best road chunega jo abhi bhi kaafi fast hai. <b>SD-WAN policy</b> bilkul yahi dispatcher hai. Woh har application dekhti hai, jaanti hai ki us application ko kitni quality chahiye, roads ko continuously measure karti hai, aur har flow ke liye ek road chunti hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Voice, video, ERP, web aur backup traffic ko network se kya chahiye (latency, jitter, loss) aur kyun.</li>
<li>Branch applications ko kaise <b>identify</b> karta hai aur galat application match karne wala rule chupchaap kuch kyun nahi karta.</li>
<li><b>SLA monitoring</b> har transport ko kaise measure karti hai aur <b>SLA profile</b> numbers ko "meets" ya "does not meet" mein kaise badalta hai.</li>
<li><b>Forwarding profiles</b>: priority list, fallback allow ya drop, aur labs mein use hone wala exact decision rule.</li>
<li><b>Policy structure</b>: policy, rules, match, order, first match aur jab kuch match na ho to default behaviour.</li>
<li><b>QoS</b>, direct internet access aur security ke foundations, aur yeh steering se kaise judte hain.</li>
<li>Verify kaise karna hai, aur do real tickets kaise troubleshoot karne hain: carrier brownout aur woh rule jo kabhi match nahi karta.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne pichhle Versa modules complete kiye hone chahiye: architecture (Director, Controller, Analytics, VOS branches), overlay (transport domains, tunnels, MP-BGP, organization, site-id) aur onboarding. Yahan hum sirf un teen tunnels ko <b>use</b> karte hain jo branches aur Controller ke beech pehle se bane hain. Agar koi tunnel down hai, to pehle overlay module par wapas jao; policy aise path par steer nahi kar sakti jo exist hi nahi karta.</p>

<h3>Lab network ek picture mein</h3>
<p>Is module ke har lab mein organization <code>Acme</code> use hota hai. Branch1 Delhi hai (site-id 101), Branch2 Bengaluru (102) aur Branch3 Kolkata (103). Har branch ke teen WAN circuits hain: <code>vni-0/0</code> Internet, <code>vni-0/1</code> MPLS aur <code>vni-0/2</code> LTE, aur LAN <code>vni-0/3</code> par (10.1.k.0/24). Default mein circuits aise measure hote hain:</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Branch se teen transports">
<rect x="20" y="85" width="130" height="80" rx="8" fill="#bae6fd"/><text x="85" y="118" text-anchor="middle" class="svg-ink" font-size="14">Branch1 Delhi</text><text x="85" y="138" text-anchor="middle" class="svg-muted" font-size="12">site-id 101</text><text x="85" y="154" text-anchor="middle" class="svg-muted" font-size="12">Acme</text>
<rect x="490" y="85" width="130" height="80" rx="8" fill="#ddd6fe"/><text x="555" y="118" text-anchor="middle" class="svg-ink" font-size="14">Remote site</text><text x="555" y="138" text-anchor="middle" class="svg-muted" font-size="12">Branch2 / Controller</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="13">MPLS vni-0/1</text><text x="325" y="56" text-anchor="middle" class="svg-muted" font-size="12">20 ms / 2 ms / 0.05 %</text>
<rect x="260" y="103" width="130" height="44" rx="8" fill="#fde68a"/><text x="325" y="123" text-anchor="middle" class="svg-ink" font-size="13">Internet vni-0/0</text><text x="325" y="139" text-anchor="middle" class="svg-muted" font-size="12">30 ms / 6 ms / 0.3 %</text>
<rect x="260" y="186" width="130" height="44" rx="8" fill="#fed7aa"/><text x="325" y="206" text-anchor="middle" class="svg-ink" font-size="13">LTE vni-0/2</text><text x="325" y="222" text-anchor="middle" class="svg-muted" font-size="12">60 ms / 15 ms / 1 %</text>
<line x1="150" y1="110" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="260" y2="208" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="208" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen transports, har ek ki apni measured latency, jitter aur loss (default lab values).</p></div>

<div class="note"><p><b>Course CLI ek simplified model hai.</b> Real Versa Director GUI (templates, workflows, SD-WAN policy objects) aur bahut bade VOS CLI se configure hota hai. Labs ek chhota CLI use karte hain jo same ideas aur same words rakhta hai: SLA profile, forwarding profile, policy, rule. Jahan real product mein zyada options hain, wahan chapters batate hain. Helper <code>show ... path-selection application</code> ek course helper hai jo batata hai ki policy abhi kya chunegi.</p></div>

<h3>Teen objects ek sentence mein</h3>
<ul>
<li><b>SLA profile</b> batata hai ki "kaafi achha" ka matlab kya hai (latency, jitter, loss limits).</li>
<li><b>Forwarding profile</b> batata hai kaun se transports try karne hain, kis order mein, aur agar koi bhi kaafi achha na ho to kya karna hai.</li>
<li><b>Policy</b> mein <b>rules</b> hote hain; rule ek application match karta hai aur ek forwarding profile ki taraf point karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Delhi Bengaluru ko voice call bhejta hai. Rule R-VOICE application voice match karta hai aur VOICE-FP ki taraf point karta hai. VOICE-FP kehta hai: SLA profile VOICE (150 ms, 30 ms, 1 %), priority MPLS phir Internet, fallback allow. MPLS 20/2/0.05 measure karta hai, to woh SLA meet karta hai aur list mein pehla hai. Call MPLS se jaati hai. Web traffic ka koi rule match nahi hota, isliye woh har up tunnel par spread hota hai.</p></div>

<div class="warn"><p><b>Common mistake:</b> yeh sochna ki policy paths "banati" hai. Policy sirf un tunnels mein se <b>chunti</b> hai jo pehle se exist karte hain aur up hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> SD-WAN steering branch par har application flow ke liye decide hoti hai; yeh routing protocol ka metric nahi hai. MP-BGP LAN prefixes carry karta hai; policy har flow ka transport chunti hai.</p></div>

<div class="scn"><h4>"Slow phone calls" ki complaint</h4><p>Delhi manager complain karta hai ki Bengaluru ko calls har dopahar robotic sunai deti hain. Engineer SLA monitor kholta hai aur dekhta hai ki Internet circuit 190 ms par hai jabki MPLS 20 ms par clean hai. Voice saare tunnels par load-balance ho rahi thi, isliye ek-tihai calls kharab path par ja rahi thi. Ek voice rule jo MPLS prefer kare aur SLA require kare, circuits ko chhue bina problem fix kar deta hai.</p><p><b>Lesson:</b> Policy ke bina achhe aur kharab paths barabar use hote hain. Policy sahi traffic ko sahi path par rakhti hai.</p></div>

<div class="iv"><p class="q">"SD-WAN policy kaunsi problem solve karti hai jo plain routing nahi karti?"</p><p>Routing har prefix ke liye ek best path chunti hai, application aur live quality se anjaan. SD-WAN policy application classify karti hai, har transport ko measure karti hai (latency, jitter, loss) aur har flow ko aisi transport par steer karti hai jo us application ka SLA meet kare, defined fallback ke saath. SLA profiles aur forwarding profiles ka naam zaroor lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy un tunnels mein se jo up hain har application flow ke liye transport chunti hai.</li>
<li>Teen objects: SLA profile, forwarding profile, rules wali policy.</li>
<li>Labs organization Acme, Branch1 Delhi aur teen transports use karte hain: Internet, MPLS, LTE.</li>
<li>CLI real Versa ka simplified course model hai.</li>
</ul></div>
`}};export{e as default};