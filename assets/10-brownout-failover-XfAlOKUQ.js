var e={id:`brownout-failover`,h:{en:`Brownouts, failover and why not to weaken the SLA`,hi:`Brownouts, failover aur SLA weak kyun nahi karna`},body:{en:`
<p>There are two ways a road can fail. A <b>blackout</b> is a clear closure: a bridge collapses and everybody knows. A <b>brownout</b> is nastier: the bridge is open, but it is so crowded and slow that nothing really arrives on time. WAN circuits behave the same way. A fibre cut gives a blackout: the tunnel goes down and the SD-WAN notices at once. A congested carrier, a flapping last mile or a faulty line card gives a brownout: the tunnel stays up, pings still work, but latency, jitter or loss climb. Simple routing cannot tell the difference. SD-WAN with SLA monitoring can. This chapter prepares you for the lab <b>vs-sla-breach</b>.</p>

<h3>Blackout versus brownout</h3>
<table class="cmp"><tr><th></th><th>Blackout</th><th>Brownout</th></tr>
<tr><td>Tunnel state</td><td>down</td><td>up</td></tr>
<tr><td>What the SLA monitor shows</td><td><code>down</code> and <code>-</code></td><td>up with high latency, jitter or loss; <code>NO</code></td></tr>
<tr><td>How the policy reacts</td><td>transport skipped (down)</td><td>transport skipped (fails SLA)</td></tr>
<tr><td>Typical cause</td><td>fibre cut, power, interface down</td><td>congestion, carrier fault, wireless interference</td></tr>
<tr><td>Plain routing sees it?</td><td>yes</td><td>usually not</td></tr></table>

<h3>The lab incident</h3>
<p>In Delhi (Branch1), the voice policy from chapter 7 is in place with one difference: fallback is <code>drop</code>. The circuits have degraded: MPLS shows 180 ms and Internet shows 170 ms, while the voice SLA allows 150 ms. LTE is healthy at 60 ms, 15 ms, 1 %. The profile lists only MPLS and Internet. Result: neither listed transport meets the SLA, fallback is drop, so <b>voice is dropped</b>. LTE is healthy and unused.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     <span class="hl">170 ms</span>    6 ms     0.3 %   VOICE=NO
MPLS       up     <span class="hl">180 ms</span>    2 ms     0.05 %  VOICE=NO
LTE        up     60 ms     15 ms    1 %     <span class="hl">VOICE=yes</span>

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">drop</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: No transport meets the SLA and fallback is drop
(Learning-model helper: shows what the policy would choose now.)

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         drop</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Brownout before and after">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">Before: list MPLS, Internet</text>
<rect x="30" y="35" width="260" height="38" rx="8" fill="#fed7aa"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="12">MPLS 180 ms: fails VOICE</text>
<rect x="30" y="83" width="260" height="38" rx="8" fill="#fed7aa"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="12">Internet 170 ms: fails VOICE</text>
<rect x="30" y="131" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">LTE 60 ms: healthy but not in list</text>
<rect x="30" y="185" width="260" height="38" rx="8" fill="#fecaca"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="13">Result: DROP (fallback drop)</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">After: list MPLS, Internet, LTE</text>
<rect x="350" y="35" width="260" height="38" rx="8" fill="#fed7aa"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="12">MPLS 180 ms: fails VOICE</text>
<rect x="350" y="83" width="260" height="38" rx="8" fill="#fed7aa"/><text x="480" y="107" text-anchor="middle" class="svg-ink" font-size="12">Internet 170 ms: fails VOICE</text>
<rect x="350" y="131" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="12">LTE 60/15/1: meets VOICE</text>
<rect x="350" y="185" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="209" text-anchor="middle" class="svg-ink" font-size="13">Result: forward via LTE</text>
</svg><p class="cap">The fix is a longer priority list, not a weaker SLA.</p></div>

<h3>The three possible fixes, ranked</h3>
<ol>
<li><b>Add the healthy transport to the priority list (correct).</b> <code>transport-priority MPLS,Internet,LTE</code>. Voice goes over LTE, which truly meets the SLA, while the SLA and the fallback stay as designed. When MPLS recovers, voice returns to MPLS because it is first in the list.</li>
<li><b>Change fallback to allow (poor here).</b> Voice would continue over the best of the two bad paths, Internet at 170 ms. Calls would be heard but with delay and echo. It hides the issue instead of using a good path.</li>
<li><b>Raise the SLA limit to 200 ms (worst).</b> The alarm disappears, but you have redefined "good" as "bad". The policy now certifies a 180 ms path as healthy for every future incident, not just today.</li>
</ol>
<p>The ticket says exactly this: do not weaken the SLA or the fallback. Fallback drop might be a deliberate business choice (for example, never carry certain traffic over a poor path). The right fix adds a legitimate good option.</p>

<h3>Doing it</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet,LTE
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via LTE</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>
<p>Note LTE's loss is exactly 1 %, which equals the limit. Because limits are inclusive (less than or equal), LTE passes. If LTE loss were 1.2 %, it would fail and voice would be dropped again.</p>

<div class="eg"><p><b>Worked example.</b> Why not put LTE first in the list permanently? LTE usually has a data cap, higher cost and weaker numbers (60 ms, 15 ms, 1 %). The list order expresses preference: MPLS is best, Internet is next, LTE is the safety net. Good designs put the expensive or weaker transport last.</p></div>

<h3>Real-world behaviour to remember</h3>
<ul>
<li><b>Existing calls.</b> A path change affects new flows immediately. Existing sessions may stay on the old path until re-evaluated or may be moved, depending on the platform configuration. A call in progress can glitch during the switch.</li>
<li><b>Hysteresis.</b> Real systems wait for a few bad samples before declaring a violation and a few good ones before returning (chapter 4), so a brief spike does not move traffic. The lab shows the end state only.</li>
<li><b>Alert and fix the carrier.</b> Failover keeps the business running, but the brownout still needs a ticket to the carrier. Use Analytics to show the violation history as evidence.</li>
<li><b>Capacity on the backup.</b> LTE must carry the voice, and QoS should protect it there.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> raising the SLA to silence an alarm; switching fallback to allow without understanding the effect; forgetting that a healthy transport outside the list is invisible to the profile; leaving LTE first in the list after the incident.</p></div>
<div class="exam"><p><b>Exam trap:</b> a brownout does not bring the tunnel down. A tunnel that is up but failing the SLA is skipped by the profile just like a down one. Recognise the symptom "up but NO".</p></div>

<div class="scn"><h4>Friday-evening brownout</h4><p>At 18:10 a Mumbai carrier reported congestion. Delhi MPLS rose to 180 ms and Internet to 170 ms. Helpdesk calls flooded in: "phones are dead". The on-call engineer ran the SLA monitor (two NO, LTE yes), then path-selection (drop, fallback drop), added LTE to the priority list, and verified forward via LTE within four minutes. The SLA stayed at 150 ms. On Monday, the carrier fixed its fault, and voice returned to MPLS on its own.</p><p><b>Lesson:</b> Add a good path, never weaken the standard.</p></div>

<div class="iv"><p class="q">"Voice drops during a carrier brownout. What do you check and what do you change?"</p><p>Check SLA monitor to see which transports meet the SLA, then path-selection and the forwarding profile to see the fallback and priority list. Fix by adding a healthy transport such as LTE to the priority list. Do not raise the SLA thresholds or hide the problem with fallback allow. Verify the new path, then raise a carrier ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Brownout = tunnel up but failing the SLA; policy skips it like a down path.</li>
<li>Drop with a short list means voice stops even if a healthy transport exists.</li>
<li>Fix by extending the priority list: MPLS,Internet,LTE.</li>
<li>Never weaken the SLA or fallback to hide a bad circuit; limits are inclusive.</li>
</ul></div>
`,hi:`
<p>Road do tarah se fail ho sakti hai. <b>Blackout</b> saaf closure hai: bridge gir gaya aur sabko pata hai. <b>Brownout</b> zyada ghatiya hai: bridge open hai, lekin itna crowded aur slow hai ki kuch bhi time par nahi pahunchta. WAN circuits bhi aise hi behave karte hain. Fibre cut blackout deta hai: tunnel down ho jaata hai aur SD-WAN turant notice karta hai. Congested carrier, flapping last mile ya faulty line card brownout deta hai: tunnel up rehta hai, pings abhi bhi chalte hain, lekin latency, jitter ya loss badh jaate hain. Simple routing fark nahi bata sakti. SLA monitoring wala SD-WAN bata sakta hai. Yeh chapter aapko lab <b>vs-sla-breach</b> ke liye taiyaar karta hai.</p>

<h3>Blackout versus brownout</h3>
<table class="cmp"><tr><th></th><th>Blackout</th><th>Brownout</th></tr>
<tr><td>Tunnel state</td><td>down</td><td>up</td></tr>
<tr><td>SLA monitor kya dikhata hai</td><td><code>down</code> aur <code>-</code></td><td>up, high latency, jitter ya loss ke saath; <code>NO</code></td></tr>
<tr><td>Policy kaise react karti hai</td><td>transport skip (down)</td><td>transport skip (SLA fail)</td></tr>
<tr><td>Typical cause</td><td>fibre cut, power, interface down</td><td>congestion, carrier fault, wireless interference</td></tr>
<tr><td>Plain routing ko dikhta hai?</td><td>haan</td><td>aam taur par nahi</td></tr></table>

<h3>Lab incident</h3>
<p>Delhi (Branch1) mein chapter 7 wali voice policy lagi hai, ek fark ke saath: fallback <code>drop</code> hai. Circuits degrade ho gaye hain: MPLS 180 ms aur Internet 170 ms dikha raha hai, jabki voice SLA 150 ms allow karta hai. LTE healthy hai 60 ms, 15 ms, 1 % par. Profile sirf MPLS aur Internet list karta hai. Result: listed koi bhi transport SLA meet nahi karta, fallback drop hai, to <b>voice drop ho jaati hai</b>. LTE healthy aur unused hai.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     <span class="hl">170 ms</span>    6 ms     0.3 %   VOICE=NO
MPLS       up     <span class="hl">180 ms</span>    2 ms     0.05 %  VOICE=NO
LTE        up     60 ms     15 ms    1 %     <span class="hl">VOICE=yes</span>

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">drop</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: No transport meets the SLA and fallback is drop
(Learning-model helper: shows what the policy would choose now.)

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         drop</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Brownout se pehle aur baad">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">Pehle: list MPLS, Internet</text>
<rect x="30" y="35" width="260" height="38" rx="8" fill="#fed7aa"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="12">MPLS 180 ms: VOICE fail</text>
<rect x="30" y="83" width="260" height="38" rx="8" fill="#fed7aa"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="12">Internet 170 ms: VOICE fail</text>
<rect x="30" y="131" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">LTE 60 ms: healthy, list mein nahi</text>
<rect x="30" y="185" width="260" height="38" rx="8" fill="#fecaca"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="13">Result: DROP (fallback drop)</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">Baad mein: list MPLS, Internet, LTE</text>
<rect x="350" y="35" width="260" height="38" rx="8" fill="#fed7aa"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="12">MPLS 180 ms: VOICE fail</text>
<rect x="350" y="83" width="260" height="38" rx="8" fill="#fed7aa"/><text x="480" y="107" text-anchor="middle" class="svg-ink" font-size="12">Internet 170 ms: VOICE fail</text>
<rect x="350" y="131" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="12">LTE 60/15/1: VOICE meet</text>
<rect x="350" y="185" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="209" text-anchor="middle" class="svg-ink" font-size="13">Result: forward via LTE</text>
</svg><p class="cap">Fix lambi priority list hai, weak SLA nahi.</p></div>

<h3>Teen possible fixes, ranked</h3>
<ol>
<li><b>Healthy transport ko priority list mein add karo (sahi).</b> <code>transport-priority MPLS,Internet,LTE</code>. Voice LTE par jaati hai, jo sach mein SLA meet karta hai, aur SLA aur fallback design ke hisaab se rehte hain. Jab MPLS recover hota hai, voice MPLS par wapas aa jaati hai kyunki woh list mein pehla hai.</li>
<li><b>Fallback ko allow karo (yahan poor).</b> Voice dono bad paths mein se best par chalti rahegi, Internet 170 ms par. Calls sunai dengi lekin delay aur echo ke saath. Yeh achhe path use karne ke bajay issue chhupa deta hai.</li>
<li><b>SLA limit ko 200 ms karo (sabse kharab).</b> Alarm gayab ho jaata hai, lekin aapne "good" ko "bad" se redefine kar diya. Policy ab 180 ms path ko har future incident ke liye healthy certify karti hai, sirf aaj ke liye nahi.</li>
</ol>
<p>Ticket exactly yahi kehta hai: SLA ya fallback weak mat karo. Fallback drop ek jaanbujhkar business choice ho sakta hai (jaise kuch traffic kabhi poor path par na jaye). Sahi fix ek legitimate achha option add karta hai.</p>

<h3>Karna kaise hai</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet,LTE
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via LTE</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>
<p>Dhyan do ki LTE ka loss exactly 1 % hai, jo limit ke barabar hai. Limits inclusive hain (kam ya barabar), isliye LTE pass hota hai. Agar LTE loss 1.2 % hota to woh fail hota aur voice phir drop ho jaati.</p>

<div class="eg"><p><b>Worked example.</b> LTE ko list mein permanent pehle kyun nahi rakhte? LTE mein aam taur par data cap, zyada cost aur kamzor numbers (60 ms, 15 ms, 1 %) hote hain. List order preference express karta hai: MPLS best hai, Internet agla hai, LTE safety net hai. Achhe designs mehnge ya kamzor transport ko last mein rakhte hain.</p></div>

<h3>Real-world behaviour yaad rakhne ke liye</h3>
<ul>
<li><b>Maujooda calls.</b> Path change naye flows ko turant affect karta hai. Existing sessions purane path par tab tak reh sakte hain jab tak re-evaluate na hon, ya move ho sakte hain, platform configuration par depend karta hai. Chalti call switch ke dauran glitch kar sakti hai.</li>
<li><b>Hysteresis.</b> Real systems violation declare karne se pehle kuch bad samples aur wapas aane se pehle kuch good samples ka wait karte hain (chapter 4), isliye chhota spike traffic ko move nahi karta. Lab sirf end state dikhata hai.</li>
<li><b>Alert aur carrier fix.</b> Failover business chalata rakhta hai, lekin brownout ke liye carrier ko ticket phir bhi chahiye. Evidence ke roop mein Analytics se violation history dikhao.</li>
<li><b>Backup par capacity.</b> LTE ko voice carry karni hogi, aur QoS ko wahan use protect karna chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> alarm chup karane ke liye SLA badhana; effect samjhe bina fallback allow par switch karna; yeh bhoolna ki list ke bahar ka healthy transport profile ko dikhta hi nahi; incident ke baad LTE ko list mein pehle chhod dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> brownout tunnel ko down nahi karta. Jo tunnel up hai lekin SLA fail kar raha hai use profile bhi down jaisa hi skip karta hai. Symptom "up but NO" pehchaano.</p></div>

<div class="scn"><h4>Friday-evening brownout</h4><p>18:10 par Mumbai carrier ne congestion report kiya. Delhi MPLS 180 ms aur Internet 170 ms ho gaye. Helpdesk par calls ki baadh aa gayi: "phones dead hain". On-call engineer ne SLA monitor chalaya (do NO, LTE yes), phir path-selection (drop, fallback drop), priority list mein LTE add kiya, aur chaar minute ke andar forward via LTE verify kiya. SLA 150 ms hi raha. Monday ko carrier ne apna fault fix kiya, aur voice apne aap MPLS par wapas aa gayi.</p><p><b>Lesson:</b> Achha path add karo, standard kabhi weak mat karo.</p></div>

<div class="iv"><p class="q">"Carrier brownout mein voice drop ho rahi hai. Aap kya check karoge aur kya badloge?"</p><p>SLA monitor check karo ki kaunse transports SLA meet karte hain, phir path-selection aur forwarding profile se fallback aur priority list dekho. Fix: LTE jaisa healthy transport priority list mein add karo. SLA thresholds mat badhao aur fallback allow se problem mat chhupao. Naya path verify karo, phir carrier ticket raise karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Brownout = tunnel up lekin SLA fail; policy ise down path ki tarah skip karti hai.</li>
<li>Chhoti list ke saath drop ka matlab voice ruk jaati hai chahe healthy transport maujood ho.</li>
<li>Priority list badhakar fix karo: MPLS,Internet,LTE.</li>
<li>Kharab circuit chhupane ke liye SLA ya fallback weak mat karo; limits inclusive hain.</li>
</ul></div>
`}};export{e as default};