var e={id:`troubleshooting`,h:{en:`Troubleshooting policy problems: the rule-match ticket`,hi:`Policy problems troubleshoot karna: rule-match ticket`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes a temperature, orders one test and then decides. Policy troubleshooting works the same way, and the cheapest first question is always: <b>what does the policy decide right now for this application, and why?</b> This chapter gives a repeatable method and walks through the ticket lab <b>vs-rule-match</b>. It also recaps <b>vs-sla-breach</b> from chapter 10 in the same method.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Which application, which site, what is expected (for example voice over MPLS) and what is observed (for example balanced over all tunnels).</li>
<li><b>Ask the policy.</b> <code>show orgs org Acme sd-wan path-selection application &lt;app&gt;</code>. The <code>Result</code>, <code>Rule</code> and <code>Reason</code> lines tell you which layer is at fault.</li>
<li><b>Read the layer the answer points to.</b> No rule line: look at <code>policies</code>. Rule present but wrong transport: look at <code>forwarding-profiles</code> and <code>sla-monitor status</code>.</li>
<li><b>Change one thing, minimally.</b> Fix only the faulty element. Do not rewrite the policy.</li>
<li><b>Prove, including the negative case.</b> Re-run path-selection for the fixed application and for an application that must <b>not</b> be affected.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Policy troubleshooting decision tree">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">path-selection application X</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: ecmp, no Rule line</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="12">rule did not match</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: drop</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">SLA, fallback or missing FP</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: forward via T</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="12">is T what you expected?</text>
<rect x="20" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: policies</text><text x="110" y="233" text-anchor="middle" class="svg-muted" font-size="12">match, order</text>
<rect x="230" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: sla-monitor,</text><text x="320" y="233" text-anchor="middle" class="svg-muted" font-size="12">forwarding-profiles</text>
<rect x="440" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: priority list,</text><text x="530" y="233" text-anchor="middle" class="svg-muted" font-size="12">tunnels, rule order</text>
<line x1="280" y1="50" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="145" x2="110" y2="195" stroke="#64748b" stroke-width="2"/><line x1="320" y1="145" x2="320" y2="195" stroke="#64748b" stroke-width="2"/><line x1="530" y1="145" x2="530" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The result line tells you which layer to inspect.</p></div>

<h3>Lab vs-rule-match: "the voice rule never matches"</h3>
<p><b>Ticket.</b> A voice policy was deployed in Delhi (Branch1), yet voice is still load-balanced over every tunnel. Find why the rule is not selected, fix only the match, and prove voice follows MPLS while an application with no rule (web) is still balanced.</p>

<p><b>Step 1: ask the policy.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">ecmp via Internet,MPLS,LTE</span>
Reason: <span class="hl">No policy rule matches</span>; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>No <code>Rule:</code> line, so no rule was selected. The SLA, profile and circuits are not the issue yet; the problem is before them.</p>

<p><b>Step 2: read the policy.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       <span class="hl">video</span>        VOICE-FP</pre>
<p>There it is: the rule named R-VOICE matches application <b>video</b>. The name is right, the profile is right, the application is wrong. Verify the other objects quickly so you know nothing else is broken:</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         allow

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application video
Application: video
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>
<p>This last test is clever: it proves the rest of the chain works. The profile is good; video is being steered by mistake.</p>

<p><b>Step 3: fix only the match.</b></p>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>Setting the same leaf with a new value replaces the old one. You do not touch the SLA, the forwarding profile or the transport list.</p>

<p><b>Step 4: prove, positive and negative.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via MPLS</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: <span class="hl">ecmp via Internet,MPLS,LTE</span>
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up</pre>
<p>Voice follows MPLS (positive proof). Web, which has no rule, stays balanced (negative proof: the fix did not accidentally widen the match to everything). Also note that video is no longer steered by R-VOICE: if the business wants video on MPLS too, that deserves its own rule and its own SLA, decided deliberately.</p>

<div class="eg"><p><b>Worked example.</b> Compare symptoms: <i>"voice is balanced"</i> gives ecmp and no rule line (match or order problem, this chapter). <i>"voice is dropped"</i> gives drop (SLA, fallback or missing profile, chapter 10). <i>"voice uses Internet, not MPLS"</i> gives forward via Internet with a rule line: check whether MPLS is down or failing the SLA in <code>sla-monitor status</code>. The result line is your first branch point.</p></div>

<h3>Recap: vs-sla-breach in the same method</h3>
<ol>
<li>Symptom: voice stops; MPLS 180 ms and Internet 170 ms.</li>
<li>Ask: path-selection says drop, "fallback is drop".</li>
<li>Read: sla-monitor shows two NO and LTE yes; forwarding-profiles shows a list without LTE.</li>
<li>Change: transport-priority MPLS,Internet,LTE only.</li>
<li>Prove: forward via LTE, with SLA 150 ms and fallback drop unchanged.</li>
</ol>

<div class="warn"><p><b>Common mistakes:</b> changing three things at once so you cannot tell what fixed it; testing only the fixed application; fixing the rule name instead of the match; editing the branch when the Director template will overwrite it on the next push (fix the template as well).</p></div>
<div class="exam"><p><b>Exam trap:</b> "traffic is not steered" is a rule or match problem; "traffic is steered to the wrong transport" is a profile, SLA or tunnel problem. Read the <code>Result</code> and <code>Rule</code> lines before touching anything.</p></div>

<div class="note"><p><code>path-selection</code> is a course helper. On real VOS you would combine <code>show</code> commands for sessions and flows, SLA and path statistics, and the Analytics dashboards to see which rule and which circuit a real flow used. The method (symptom, ask, read, minimal change, prove with a negative test) is the same.</p></div>

<div class="scn"><h4>The video application rename</h4><p>After a vendor update, a company video client was identified under a new application name. Meetings began to stutter. The engineer ran path-selection for the new name: ecmp, no rule. The rule still listed the old name. Changing the match fixed it; a web check proved that nothing else changed. Time to fix: ten minutes. Time wasted by the previous shift who only checked circuits: three hours.</p><p><b>Lesson:</b> Ask the policy before blaming the carrier.</p></div>

<div class="iv"><p class="q">"Users say your steering policy is not working. How do you start?"</p><p>I ask the policy what it decides for the affected application and read the result: ecmp with no rule means a match or order problem, drop means SLA or fallback, a wrong transport means priority list, tunnel state or SLA numbers. I make one minimal change and prove it with a positive test and a negative test on an unrelated application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with path-selection; the Result and Rule lines choose the next check.</li>
<li>ecmp with no rule: policy match or order; drop: SLA, fallback or missing profile.</li>
<li>Change the one faulty element; leave SLA, profile and list alone.</li>
<li>Prove with a positive and a negative test (voice via MPLS, web still ecmp).</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh poochhti hai kahan dard hai, temperature leti hai, ek test order karti hai aur phir decide karti hai. Policy troubleshooting bhi aise hi kaam karta hai, aur sabse sasta pehla sawal hamesha hai: <b>is application ke liye policy abhi kya decide karti hai, aur kyun?</b> Yeh chapter ek repeatable method deta hai aur ticket lab <b>vs-rule-match</b> walkthrough karta hai. Yeh chapter 10 ke <b>vs-sla-breach</b> ko bhi usi method mein recap karta hai.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Symptom precisely define karo.</b> Kaunsi application, kaunsi site, kya expected hai (jaise voice over MPLS) aur kya observe ho raha hai (jaise sab tunnels par balanced).</li>
<li><b>Policy se poochho.</b> <code>show orgs org Acme sd-wan path-selection application &lt;app&gt;</code>. <code>Result</code>, <code>Rule</code> aur <code>Reason</code> lines batati hain ki kaunsi layer faulty hai.</li>
<li><b>Jis layer ki taraf jawab point kare use padho.</b> Rule line nahi: <code>policies</code> dekho. Rule hai lekin transport galat: <code>forwarding-profiles</code> aur <code>sla-monitor status</code> dekho.</li>
<li><b>Ek cheez badlo, minimally.</b> Sirf faulty element fix karo. Poori policy rewrite mat karo.</li>
<li><b>Prove karo, negative case ke saath.</b> Fixed application ke liye path-selection dobara chalao aur aisi application ke liye jo affect <b>nahi</b> honi chahiye.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Policy troubleshooting decision tree">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">path-selection application X</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: ecmp, Rule line nahi</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="12">rule match nahi hua</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: drop</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">SLA, fallback ya missing FP</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="12">Result: forward via T</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="12">kya T expected hai?</text>
<rect x="20" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: policies</text><text x="110" y="233" text-anchor="middle" class="svg-muted" font-size="12">match, order</text>
<rect x="230" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: sla-monitor,</text><text x="320" y="233" text-anchor="middle" class="svg-muted" font-size="12">forwarding-profiles</text>
<rect x="440" y="195" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="217" text-anchor="middle" class="svg-ink" font-size="12">Check: priority list,</text><text x="530" y="233" text-anchor="middle" class="svg-muted" font-size="12">tunnels, rule order</text>
<line x1="280" y1="50" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="145" x2="110" y2="195" stroke="#64748b" stroke-width="2"/><line x1="320" y1="145" x2="320" y2="195" stroke="#64748b" stroke-width="2"/><line x1="530" y1="145" x2="530" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Result line batati hai ki kaunsi layer inspect karni hai.</p></div>

<h3>Lab vs-rule-match: "voice rule kabhi match nahi karta"</h3>
<p><b>Ticket.</b> Delhi (Branch1) mein voice policy deploy hui, phir bhi voice saare tunnels par load-balance ho rahi hai. Dhundo ki rule select kyun nahi hota, sirf match fix karo aur prove karo ki voice MPLS follow karti hai jabki bina rule wali application (web) abhi bhi balance hoti hai.</p>

<p><b>Step 1: policy se poochho.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">ecmp via Internet,MPLS,LTE</span>
Reason: <span class="hl">No policy rule matches</span>; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p><code>Rule:</code> line nahi hai, matlab koi rule select nahi hua. SLA, profile aur circuits abhi issue nahi hain; problem unse pehle hai.</p>

<p><b>Step 2: policy padho.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       <span class="hl">video</span>        VOICE-FP</pre>
<p>Yeh raha: R-VOICE naam ka rule application <b>video</b> match karta hai. Naam sahi hai, profile sahi hai, application galat hai. Baaki objects jaldi verify karo taaki pata ho ki aur kuch broken nahi:</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         allow

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application video
Application: video
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>
<p>Yeh aakhri test smart hai: yeh prove karta hai ki baaki chain kaam karti hai. Profile achha hai; video galti se steer ho rahi hai.</p>

<p><b>Step 3: sirf match fix karo.</b></p>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>Same leaf ko nayi value ke saath set karne se purani replace ho jaati hai. Aap SLA, forwarding profile ya transport list ko nahi chhuote.</p>

<p><b>Step 4: prove karo, positive aur negative.</b></p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via MPLS</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: <span class="hl">ecmp via Internet,MPLS,LTE</span>
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up</pre>
<p>Voice MPLS follow karti hai (positive proof). Web, jiska koi rule nahi, balanced rehti hai (negative proof: fix ne galti se match ko sab par widen nahi kiya). Yeh bhi dhyan do ki video ab R-VOICE se steer nahi hoti: agar business video ko bhi MPLS par chahta hai, to uska apna rule aur apna SLA hona chahiye, jaanbujhkar decide kiya hua.</p>

<div class="eg"><p><b>Worked example.</b> Symptoms compare karo: <i>"voice balanced hai"</i> ecmp aur bina rule line deta hai (match ya order problem, yeh chapter). <i>"voice drop ho rahi hai"</i> drop deta hai (SLA, fallback ya missing profile, chapter 10). <i>"voice MPLS ke bajay Internet use kar rahi hai"</i> rule line ke saath forward via Internet deta hai: <code>sla-monitor status</code> mein check karo ki MPLS down hai ya SLA fail kar raha hai. Result line aapka pehla branch point hai.</p></div>

<h3>Recap: vs-sla-breach usi method mein</h3>
<ol>
<li>Symptom: voice ruk gayi; MPLS 180 ms aur Internet 170 ms.</li>
<li>Poochho: path-selection kehta hai drop, "fallback is drop".</li>
<li>Padho: sla-monitor do NO aur LTE yes dikhata hai; forwarding-profiles mein list bina LTE ke hai.</li>
<li>Badlo: sirf transport-priority MPLS,Internet,LTE.</li>
<li>Prove: forward via LTE, SLA 150 ms aur fallback drop unchanged.</li>
</ol>

<div class="warn"><p><b>Common mistakes:</b> teen cheezein ek saath badalna taaki pata na chale kisne fix kiya; sirf fixed application test karna; match ki jagah rule name fix karna; branch edit karna jabki Director template agle push par use overwrite kar degi (template bhi fix karo).</p></div>
<div class="exam"><p><b>Exam trap:</b> "traffic steer nahi ho rahi" rule ya match problem hai; "traffic galat transport par steer ho rahi hai" profile, SLA ya tunnel problem hai. Kuch chhuone se pehle <code>Result</code> aur <code>Rule</code> lines padho.</p></div>

<div class="note"><p><code>path-selection</code> ek course helper hai. Real VOS par aap sessions aur flows ke <code>show</code> commands, SLA aur path statistics, aur Analytics dashboards combine karke dekhoge ki real flow ne kaunsa rule aur kaunsa circuit use kiya. Method (symptom, poochho, padho, minimal change, negative test ke saath prove) wahi hai.</p></div>

<div class="scn"><h4>Video application ka rename</h4><p>Vendor update ke baad ek company video client naye application name se identify hone laga. Meetings atakne lagi. Engineer ne naye naam ke liye path-selection chalaya: ecmp, koi rule nahi. Rule mein abhi bhi purana naam tha. Match badalne se fix ho gaya; web check ne prove kiya ki aur kuch nahi badla. Fix mein laga: das minute. Pichhli shift ne jo sirf circuits check kiye unka waste: teen ghante.</p><p><b>Lesson:</b> Carrier ko blame karne se pehle policy se poochho.</p></div>

<div class="iv"><p class="q">"Users kehte hain aapki steering policy kaam nahi kar rahi. Aap kahan se shuru karoge?"</p><p>Main policy se poochhta hoon ki affected application ke liye woh kya decide karti hai aur result padhta hoon: bina rule ke ecmp matlab match ya order problem, drop matlab SLA ya fallback, galat transport matlab priority list, tunnel state ya SLA numbers. Main ek minimal change karta hoon aur positive test aur unrelated application par negative test se prove karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>path-selection se shuru karo; Result aur Rule lines agla check chunti hain.</li>
<li>Bina rule ecmp: policy match ya order; drop: SLA, fallback ya missing profile.</li>
<li>Ek faulty element badlo; SLA, profile aur list ko mat chhuo.</li>
<li>Positive aur negative test se prove karo (voice via MPLS, web abhi bhi ecmp).</li>
</ul></div>
`}};export{e as default};