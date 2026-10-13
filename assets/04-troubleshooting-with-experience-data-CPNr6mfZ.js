var e={id:`troubleshooting-experience`,h:{en:`Troubleshooting with experience data`,hi:`Experience data se troubleshooting`},body:{en:`
<h3>The method, applied to experience problems</h3>
<p>Experience tickets are the opposite of outages: everything is "up" yet users suffer. The method stays the same: <b>symptom, evidence, root cause, fix, verify</b>. Evidence is a table of numbers, not a feeling. Your goal is a sentence like "kabir's CRM score is 24 because the Internet circuit loss is far above baseline", backed by a screenshot of the hop table.</p>

<h3>Lab zs-zdx-1: probes and alert thresholds</h3>
<p><b>Symptom:</b> the CRM shows no data and no alerts. <b>Evidence:</b> the Applications table shows probe disabled and a threshold of 10. <b>Root cause:</b> nothing is measured, and even if it were, the threshold sits far below Poor. <b>Fix:</b> enable the CRM probe, move the threshold near the Poor boundary, activate changes. <b>Verify:</b> the CRM row shows a score and Poor users would trigger the alert.</p>

<h3>Lab zs-zdx-2 and ticket 321110: find the slow hop</h3>
<p><b>Symptom:</b> Jaipur Sales say the CRM is slow; scores are Poor. <b>Step 1, scope:</b> compare users. Pune and Chennai are Good, only Jaipur is Poor, so the problem is shared by the Jaipur site or its path, not the application and not one laptop. <b>Step 2, evidence:</b> open kabir's hop table and read each hop against its baseline.</p>
<pre class="out">Digital experience &gt; User detail   kabir   app: CRM   site: Jaipur
Hop               Value         Baseline    vs baseline
Device            cpu 30%       35%         below
Wi-Fi             good          good        equal
Internet circuit  loss 7%       loss 0.5%   <span class="hl">far above</span>
Cloud path        rtt 30 ms     30 ms       equal
Application       server 205    200         equal
Score 22 (Poor)   Cause: Internet circuit
Colleague check:  meena (Chennai) 71 Good   ravi (Pune) 82 Good</pre>
<p><b>Step 3, root cause:</b> the Internet circuit at Jaipur (BB-JPR-01 on ISP-B) shows heavy loss while all other hops are normal. <b>Step 4, fix:</b> in the lab you cannot repair the ISP, so you do the right management actions: enable the CRM probe if it is off so the score is visible, set a sensible alert threshold, and raise a circuit ticket with the evidence. In the ticket 321110 version, the CRM probe is off and the threshold is too low, so two portal fixes are needed in addition to naming the hop. <b>Step 5, verify:</b> the CRM now scores, the cause line names the circuit, and the alert threshold would fire for Poor.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Slow-hop investigation steps">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Scope</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="12">who is Poor?</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Evidence</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="12">hop table</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Cause</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="12">furthest above</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#ddd6fe"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Fix</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="12">switches, owner</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="12">score, alert</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">evidence first; the owner of the named hop acts</text>
</svg><p class="cap">Five steps from a vague complaint to a proven cause.</p></div>

<h3>Do not confuse the cause with the policy</h3>
<p>A common trap is to open the policy tester because "it is slow". But policy decides allow or block; an allowed, slow request is not a policy problem. If the tester says allowed and the hop table says the circuit, the policy is innocent. Equally, do not tune the cloud path unless the cloud hop is the one above baseline.</p>

<div class="eg"><p><b>Worked example.</b> Two users in Pune complain on the same afternoon. One is Poor with the Device hop at 95 percent CPU; the other is Poor with Wi-Fi far above baseline. Same site, different hops, different owners. Two tickets, not one.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Everything you do in this chapter lives on the observation side: enabling a probe adds test traffic, and a threshold changes who is notified. The actual repair, such as a circuit fix, happens outside the portal and is proved when the score returns to Good.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the loudest hop instead of the furthest above baseline. (2) Declaring victory without checking that the score recovered. (3) Closing the ticket without handing the evidence to the hop owner.</p></div>
<div class="exam"><p><b>Exam trap.</b> In ticket-style questions the cause is often hidden by a "healthy" application. Read the whole hop table and use the cause rule.</p></div>

<div class="scn"><h4>Evidence changed the conversation</h4><p>The ISP first said "your site is fine". The engineer sent a table showing loss at seven percent against a baseline of half a percent, the colleague comparison, and the timestamps. The ISP found a faulty segment the same day.</p><p><b>Lesson:</b> numbers beat opinions with third parties.</p></div>

<div class="iv"><p class="q">"Users say the CRM is slow but policy allows it. How do you proceed?"</p><p>Check the scores to confirm and scope: user, site, application. Open the hop table and find the hop furthest above baseline. Name the owner, send evidence, and verify the score after the repair. Say clearly that policy is not the cause when it allows and the tester agrees.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first by comparing users, sites and applications.</li>
<li>Read the hop table; the cause is furthest above baseline.</li>
<li>Enable probes and set sensible thresholds so the problem is visible.</li>
<li>Give the hop owner evidence, then verify recovery.</li>
<li>Slow but allowed is not a policy problem.</li>
</ul></div>
`,hi:`
<h3>Experience problems par method</h3>
<p>Experience tickets outages ke ulte hote hain: sab "up" hai phir bhi users pareshaan hain. Method wahi rehta hai: <b>symptom, evidence, root cause, fix, verify</b>. Evidence numbers ki table hai, feeling nahi. Aapka goal aisa sentence hai "kabir ka CRM score 24 hai kyunki Internet circuit loss baseline se bahut upar hai", jiske peeche hop table ka screenshot ho.</p>

<h3>Lab zs-zdx-1: probes aur alert thresholds</h3>
<p><b>Symptom:</b> CRM no data dikhata hai aur koi alert nahi. <b>Evidence:</b> Applications table probe disabled aur threshold 10 dikhati hai. <b>Root cause:</b> kuch measure nahi ho raha, aur hota bhi to threshold Poor se bahut neeche hai. <b>Fix:</b> CRM probe enable karo, threshold Poor boundary ke paas karo, activate changes. <b>Verify:</b> CRM row score dikhati hai aur Poor users alert trigger karenge.</p>

<h3>Lab zs-zdx-2 aur ticket 321110: slow hop dhundo</h3>
<p><b>Symptom:</b> Jaipur Sales kehti hai CRM slow hai; scores Poor hain. <b>Step 1, scope:</b> users compare karo. Pune aur Chennai Good hain, sirf Jaipur Poor, to problem Jaipur site ya uske path ki hai, application ya ek laptop ki nahi. <b>Step 2, evidence:</b> kabir ki hop table kholo aur har hop ko baseline se padho.</p>
<pre class="out">Digital experience &gt; User detail   kabir   app: CRM   site: Jaipur
Hop               Value         Baseline    vs baseline
Device            cpu 30%       35%         below
Wi-Fi             good          good        equal
Internet circuit  loss 7%       loss 0.5%   <span class="hl">far above</span>
Cloud path        rtt 30 ms     30 ms       equal
Application       server 205    200         equal
Score 22 (Poor)   Cause: Internet circuit
Colleague check:  meena (Chennai) 71 Good   ravi (Pune) 82 Good</pre>
<p><b>Step 3, root cause:</b> Jaipur ka Internet circuit (BB-JPR-01 on ISP-B) heavy loss dikhata hai jabki baaki sab hops normal hain. <b>Step 4, fix:</b> lab mein aap ISP repair nahi kar sakte, to sahi management actions karte ho: agar CRM probe off hai to on karo taaki score dikhe, sensible alert threshold set karo, aur evidence ke saath circuit ticket raise karo. Ticket 321110 version mein CRM probe off hai aur threshold bahut low, to hop ka naam batane ke saath do portal fixes aur chahiye. <b>Step 5, verify:</b> CRM ab score karta hai, cause line circuit batati hai, aur alert threshold Poor par fire hoga.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Slow-hop investigation steps">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Scope</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="12">kaun Poor?</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Evidence</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="12">hop table</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Cause</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="12">sabse upar</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#ddd6fe"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Fix</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="12">switches, owner</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="12">score, alert</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">pehle evidence; named hop ka owner act karta hai</text>
</svg><p class="cap">Vague complaint se proven cause tak paanch steps.</p></div>

<h3>Cause ko policy se confuse mat karo</h3>
<p>Common trap hai "slow hai" sunkar policy tester kholna. Lekin policy allow ya block decide karti hai; allowed lekin slow request policy problem nahi hai. Tester allowed kehta hai aur hop table circuit, to policy bekasoor hai. Waise hi, cloud path tune mat karo jab tak cloud hop baseline se upar na ho.</p>

<div class="eg"><p><b>Worked example.</b> Pune ke do users ek hi dopahar complain karte hain. Ek Poor hai jiska Device hop 95 percent CPU par hai; doosra Poor hai jiska Wi-Fi baseline se bahut upar hai. Same site, alag hops, alag owners. Do tickets, ek nahi.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Is chapter ka sab kuch observation side par hai: probe enable karne se test traffic judta hai, aur threshold badalta hai ki kise notify kiya jaye. Asli repair, jaise circuit fix, portal ke bahar hota hai aur tab prove hota hai jab score Good par wapas aata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sabse shor wale hop ko fix karna, baseline se sabse upar wale ko nahi. (2) Score recover hua ya nahi check kiye bina jeet declare karna. (3) Evidence hop owner ko diye bina ticket close karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ticket-style sawalon mein cause aksar "healthy" application ke peeche chhupa hota hai. Poori hop table padho aur cause rule use karo.</p></div>

<div class="scn"><h4>Evidence ne baat badal di</h4><p>ISP ne pehle kaha "aapki site theek hai". Engineer ne ek table bheji jisme loss saat percent tha jabki baseline aadha percent, colleague comparison, aur timestamps. ISP ko usi din faulty segment mil gaya.</p><p><b>Seekh:</b> third parties ke saath numbers opinions se jeette hain.</p></div>

<div class="iv"><p class="q">"Users kehte hain CRM slow hai lekin policy allow karti hai. Kaise aage badhoge?"</p><p>Scores se confirm aur scope karo: user, site, application. Hop table kholo aur baseline se sabse upar hop dhundo. Owner ka naam lo, evidence bhejo, aur repair ke baad score verify karo. Saaf bolo ki jab policy allow kare aur tester agree kare to policy cause nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle users, sites aur applications compare karke scope karo.</li>
<li>Hop table padho; cause baseline se sabse upar hai.</li>
<li>Probes enable karo aur sensible thresholds set karo taaki problem dikhe.</li>
<li>Hop owner ko evidence do, phir recovery verify karo.</li>
<li>Slow lekin allowed policy problem nahi hai.</li>
</ul></div>
`}};export{e as default};