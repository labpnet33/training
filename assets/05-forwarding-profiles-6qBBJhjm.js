var e={id:`forwarding-profiles`,h:{en:`Forwarding profiles and the steering decision`,hi:`Forwarding profiles aur steering decision`},body:{en:`
<p>You now have measurements (the SLA monitor) and a definition of "good enough" (the SLA profile). The <b>forwarding profile</b> is the dispatcher's instruction sheet: "for this kind of traffic, try these roads in this order, only accept a road that meets this SLA, and if none does, do this". It is where the actual decision logic lives.</p>

<h3>The four parts of a forwarding profile</h3>
<dl class="terms">
<dt>SLA profile reference</dt><dd>Which limits a transport must satisfy to be accepted. Without one, any transport that is up is accepted.</dd>
<dt>Transport priority list</dt><dd>An ordered list such as <code>MPLS,Internet,LTE</code>. Earlier means preferred. Transports not in the list are not considered by this profile.</dd>
<dt>Fallback</dt><dd>What to do when no listed transport that is up meets the SLA. <code>allow</code> uses the best available path anyway (the lowest latency among the candidates). <code>drop</code> refuses to carry the traffic.</dd>
<dt>Name</dt><dd>Rules refer to the profile by name, for example <code>VOICE-FP</code>.</dd>
</dl>

<pre class="code"><span class="c">! forwarding profile VOICE-FP</span>
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow</pre>

<h3>The course decision rule, step by step</h3>
<ol>
<li>Take the transports in the priority list, in order.</li>
<li>Remove those whose tunnel is <b>down</b>.</li>
<li>Pick the <b>first</b> remaining transport that meets the SLA profile.</li>
<li>If none meets it: with <code>fallback allow</code>, forward over the best available (lowest latency) candidate; with <code>fallback drop</code>, drop the traffic.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Steering decision flow">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">Rule matched: use FP</text>
<rect x="235" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Walk priority list</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">Tunnel up?</text>
<rect x="450" y="100" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="127" text-anchor="middle" class="svg-ink" font-size="13">Meets SLA?</text>
<rect x="450" y="180" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="207" text-anchor="middle" class="svg-ink" font-size="13">Forward: this one</text>
<rect x="235" y="100" width="170" height="44" rx="8" fill="#fed7aa"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">Next in list</text>
<rect x="20" y="180" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="200" text-anchor="middle" class="svg-ink" font-size="12">List exhausted:</text><text x="105" y="216" text-anchor="middle" class="svg-ink" font-size="12">allow = best, drop = drop</text>
<line x1="190" y1="42" x2="235" y2="42" stroke="#64748b" stroke-width="2"/><line x1="405" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="535" y1="64" x2="535" y2="100" stroke="#64748b" stroke-width="2"/><line x1="535" y1="144" x2="535" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="122" x2="405" y2="122" stroke="#64748b" stroke-width="2"/><line x1="320" y1="144" x2="320" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="320" y1="200" x2="190" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="548" y="84" class="svg-muted" font-size="12">yes</text><text x="548" y="164" class="svg-muted" font-size="12">yes</text><text x="420" y="116" class="svg-muted" font-size="12">no</text>
</svg><p class="cap">Down or failing transports are skipped; the first good one wins; the list end triggers fallback.</p></div>

<h3>Worked decisions with numbers</h3>
<p>VOICE = 150 ms / 30 ms / 1 %. Priority MPLS, Internet. Fallback allow unless stated.</p>
<table class="cmp"><tr><th>Case</th><th>MPLS</th><th>Internet</th><th>LTE</th><th>Result</th></tr>
<tr><td>A. Healthy</td><td>20/2/0.05 meets</td><td>30/6/0.3 meets</td><td>60/15/1 meets</td><td>MPLS (first and good)</td></tr>
<tr><td>B. MPLS tunnel down</td><td>down</td><td>meets</td><td>meets</td><td>Internet (next in list)</td></tr>
<tr><td>C. MPLS 180 ms</td><td>fails</td><td>30/6/0.3 meets</td><td>meets</td><td>Internet</td></tr>
<tr><td>D. MPLS 180, Internet 170</td><td>fails</td><td>fails</td><td>meets (not in list)</td><td>Allow: Internet 170 ms (best of list). Drop: dropped</td></tr>
<tr><td>E. Same as D with LTE added to list</td><td>fails</td><td>fails</td><td>60/15/1 meets</td><td>LTE</td></tr></table>
<p>Case D shows why fallback matters. LTE is healthy, but it was not in the list, so the profile never looks at it. Case E is the fix used in the brownout lab.</p>

<h3>No SLA, no list, and other special cases</h3>
<ul>
<li><b>Profile without SLA</b>: every up transport in the list is acceptable, so the first up one wins. This is simple path preference.</li>
<li><b>Profile without a priority list</b>: all transports are candidates (the course model uses its default order).</li>
<li><b>Rule points to a profile that does not exist</b>: traffic is dropped. The model reports that the profile is not defined.</li>
</ul>

<div class="note"><p><b>How real Versa is richer.</b> The real forwarding profile supports priorities with several transports at the same priority and load balancing among them (for example weighted share), per-circuit and per-class choices, and several fallback behaviours (for example continue on the best remaining path, use the routing table, or drop). The Director also lets you choose how often and under which conditions a flow is re-evaluated. The course keeps one simple ordered list so that you can predict every answer by hand. Check the release documentation for exact option names.</p></div>

<div class="warn"><p><b>Common mistakes:</b> forgetting a healthy transport in the list (case D); setting fallback drop without a safe last-resort transport; thinking priority means "always use first" (it means first <b>that meets the SLA</b>).</p></div>
<div class="exam"><p><b>Exam trap:</b> fallback <code>allow</code> does not mean "ignore the SLA when healthy". The SLA is still checked first; fallback only applies when nothing passes. Also, down tunnels are skipped before the SLA test.</p></div>

<div class="scn"><h4>Drop was a deliberate choice</h4><p>A security team wanted credit card traffic never to ride LTE. They set fallback drop and listed MPLS and Internet only. When both degraded, payments stopped and the helpdesk exploded. The better design was fallback allow with an alert, or adding a secured LTE with encryption and a higher SLA limit after risk approval.</p><p><b>Lesson:</b> Drop is a business decision. Make it knowingly and monitor it.</p></div>

<div class="iv"><p class="q">"Walk me through how a forwarding profile picks a path."</p><p>Take the priority list in order, skip tunnels that are down, choose the first one meeting the SLA profile. If none meets it, fallback decides: allow uses the best available path, drop discards. Quote a numeric example, such as MPLS 180 ms failing and Internet at 30 ms being chosen.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A forwarding profile = SLA reference + priority list + fallback.</li>
<li>Skip down tunnels, pick the first that meets the SLA, else apply fallback.</li>
<li>Transports missing from the list are never considered.</li>
<li>Real Versa adds load balancing, weights and more fallback modes.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas measurements hain (SLA monitor) aur "kaafi achha" ki definition hai (SLA profile). <b>Forwarding profile</b> dispatcher ki instruction sheet hai: "is tarah ki traffic ke liye yeh roads is order mein try karo, sirf woh road accept karo jo is SLA ko meet kare, aur agar koi na kare to yeh karo". Asli decision logic yahin rehta hai.</p>

<h3>Forwarding profile ke chaar hisse</h3>
<dl class="terms">
<dt>SLA profile reference</dt><dd>Kaunse limits satisfy karne par transport accept hoga. Iske bina jo bhi transport up hai woh accept ho jaata hai.</dd>
<dt>Transport priority list</dt><dd>Ordered list jaise <code>MPLS,Internet,LTE</code>. Pehle matlab preferred. List mein na hone wale transports is profile ke liye consider nahi hote.</dd>
<dt>Fallback</dt><dd>Jab listed koi bhi up transport SLA meet na kare tab kya karna hai. <code>allow</code> phir bhi best available path use karta hai (candidates mein sabse kam latency). <code>drop</code> traffic carry karne se mana kar deta hai.</dd>
<dt>Name</dt><dd>Rules profile ko naam se refer karte hain, jaise <code>VOICE-FP</code>.</dd>
</dl>

<pre class="code"><span class="c">! forwarding profile VOICE-FP</span>
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow</pre>

<h3>Course decision rule, step by step</h3>
<ol>
<li>Priority list ke transports order mein lo.</li>
<li>Jinka tunnel <b>down</b> hai unhe hata do.</li>
<li>Bache hue transports mein se <b>pehla</b> chuno jo SLA profile meet karta hai.</li>
<li>Agar koi meet na kare: <code>fallback allow</code> mein best available (sabse kam latency) candidate se forward karo; <code>fallback drop</code> mein traffic drop karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Steering decision flow">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">Rule matched: FP use</text>
<rect x="235" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Priority list chalo</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">Tunnel up?</text>
<rect x="450" y="100" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="127" text-anchor="middle" class="svg-ink" font-size="13">Meets SLA?</text>
<rect x="450" y="180" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="207" text-anchor="middle" class="svg-ink" font-size="13">Forward: yehi wala</text>
<rect x="235" y="100" width="170" height="44" rx="8" fill="#fed7aa"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">List mein agla</text>
<rect x="20" y="180" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="200" text-anchor="middle" class="svg-ink" font-size="12">List khatam:</text><text x="105" y="216" text-anchor="middle" class="svg-ink" font-size="12">allow = best, drop = drop</text>
<line x1="190" y1="42" x2="235" y2="42" stroke="#64748b" stroke-width="2"/><line x1="405" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="535" y1="64" x2="535" y2="100" stroke="#64748b" stroke-width="2"/><line x1="535" y1="144" x2="535" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="122" x2="405" y2="122" stroke="#64748b" stroke-width="2"/><line x1="320" y1="144" x2="320" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="320" y1="200" x2="190" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="548" y="84" class="svg-muted" font-size="12">yes</text><text x="548" y="164" class="svg-muted" font-size="12">yes</text><text x="420" y="116" class="svg-muted" font-size="12">no</text>
</svg><p class="cap">Down ya failing transports skip hote hain; pehla achha jeetta hai; list ka end fallback trigger karta hai.</p></div>

<h3>Numbers ke saath worked decisions</h3>
<p>VOICE = 150 ms / 30 ms / 1 %. Priority MPLS, Internet. Jab tak na likha ho fallback allow.</p>
<table class="cmp"><tr><th>Case</th><th>MPLS</th><th>Internet</th><th>LTE</th><th>Result</th></tr>
<tr><td>A. Healthy</td><td>20/2/0.05 meets</td><td>30/6/0.3 meets</td><td>60/15/1 meets</td><td>MPLS (pehla aur achha)</td></tr>
<tr><td>B. MPLS tunnel down</td><td>down</td><td>meets</td><td>meets</td><td>Internet (list mein agla)</td></tr>
<tr><td>C. MPLS 180 ms</td><td>fails</td><td>30/6/0.3 meets</td><td>meets</td><td>Internet</td></tr>
<tr><td>D. MPLS 180, Internet 170</td><td>fails</td><td>fails</td><td>meets (list mein nahi)</td><td>Allow: Internet 170 ms (list mein best). Drop: dropped</td></tr>
<tr><td>E. D jaisa, LTE list mein add</td><td>fails</td><td>fails</td><td>60/15/1 meets</td><td>LTE</td></tr></table>
<p>Case D dikhata hai ki fallback kyun matter karta hai. LTE healthy hai, lekin woh list mein nahi tha, isliye profile use dekhta hi nahi. Case E brownout lab mein use hone wala fix hai.</p>

<h3>Bina SLA, bina list, aur baaki special cases</h3>
<ul>
<li><b>SLA ke bina profile</b>: list ka har up transport acceptable hai, to pehla up wala jeetta hai. Yeh simple path preference hai.</li>
<li><b>Priority list ke bina profile</b>: saare transports candidates hain (course model apna default order use karta hai).</li>
<li><b>Rule aise profile ki taraf point kare jo exist nahi karta</b>: traffic drop hoti hai. Model report karta hai ki profile defined nahi hai.</li>
</ul>

<div class="note"><p><b>Real Versa kitna richer hai.</b> Real forwarding profile mein ek hi priority par kai transports aur unke beech load balancing (jaise weighted share), per-circuit aur per-class choices, aur kai fallback behaviours (jaise bache hue best path par continue, routing table use, ya drop) support hote hain. Director yeh bhi choose karne deta hai ki flow ko kitni baar aur kin conditions mein re-evaluate kiya jaye. Course ek simple ordered list rakhta hai taaki aap har answer haath se predict kar sako. Exact option names ke liye release documentation dekho.</p></div>

<div class="warn"><p><b>Common mistakes:</b> list mein healthy transport bhool jaana (case D); safe last-resort transport ke bina fallback drop set karna; yeh sochna ki priority ka matlab "hamesha pehla use karo" hai (iska matlab hai pehla <b>jo SLA meet kare</b>).</p></div>
<div class="exam"><p><b>Exam trap:</b> fallback <code>allow</code> ka matlab "healthy hone par SLA ignore karo" nahi hai. SLA pehle check hota hai; fallback tabhi lagta hai jab koi pass na ho. Aur down tunnels SLA test se pehle skip ho jaate hain.</p></div>

<div class="scn"><h4>Drop jaanbujhkar chuna gaya tha</h4><p>Ek security team chahti thi ki credit card traffic kabhi LTE par na jaye. Unhone fallback drop set kiya aur sirf MPLS aur Internet list kiye. Jab dono degrade hue, payments ruk gayi aur helpdesk par bhaari load aa gaya. Behtar design tha fallback allow alert ke saath, ya risk approval ke baad encryption aur zyada SLA limit wala secured LTE add karna.</p><p><b>Lesson:</b> Drop ek business decision hai. Soch samajh kar lo aur monitor karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao forwarding profile path kaise chunta hai."</p><p>Priority list order mein lo, jo tunnels down hain unhe skip karo, SLA profile meet karne wala pehla chuno. Agar koi meet na kare to fallback decide karta hai: allow best available path use karta hai, drop discard karta hai. Numeric example do, jaise MPLS 180 ms fail ho raha hai aur 30 ms wala Internet chuna ja raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forwarding profile = SLA reference + priority list + fallback.</li>
<li>Down tunnels skip karo, SLA meet karne wala pehla chuno, warna fallback lagao.</li>
<li>List mein na hone wale transports kabhi consider nahi hote.</li>
<li>Real Versa load balancing, weights aur zyada fallback modes add karta hai.</li>
</ul></div>
`}};export{e as default};