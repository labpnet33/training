var e={id:`build-and-verify`,h:{en:`Lab walkthrough: build the voice policy and verify it`,hi:`Lab walkthrough: voice policy banao aur verify karo`},body:{en:`
<p>This chapter prepares you for the lab <b>vs-sla-policy</b> ("Voice policy: SLA, forwarding profile and rule"). You will build the three objects in the right order and then prove the result with show commands. Think of building a house: first the foundation (SLA profile), then the walls (forwarding profile), then the door that people actually use (rule).</p>

<h3>The situation</h3>
<p>Delhi (Branch1, organization Acme, site-id 101) already has three healthy tunnels to Bengaluru (Branch2) and the Controller. There is <b>no policy</b>, so every application, voice included, is load-balanced over Internet, MPLS and LTE. Your task: create SLA profile <code>VOICE</code> (latency 150 ms, jitter 30 ms, loss 1 %), forwarding profile <code>VOICE-FP</code> (priority MPLS then Internet, fallback allow) and rule <code>R-VOICE</code> that matches application voice. Then prove voice uses MPLS.</p>

<h3>Step 1: look before you change</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   -
MPLS       up     20 ms     2 ms     0.05 %  -
LTE        up     60 ms     15 ms    1 %     -

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: ecmp via Internet,MPLS,LTE
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Two facts: the circuits are healthy, and voice is balanced over everything. The <code>-</code> in the last column means that no SLA profile is defined yet. A baseline like this is good habit before every change.</p>

<h3>Step 2: configure in the right order</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% <span class="c">! 1. SLA profile: what "good" means for voice</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE loss 1
admin@Branch1-cli% <span class="c">! 2. Forwarding profile: where to send it</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow
admin@Branch1-cli% commit
admin@Branch1-cli% <span class="c">! 3. Rule: which traffic uses it</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>The lab splits this in two tasks: first the SLA profile and forwarding profile, then the rule and the proof. Committing the profiles first has a benefit: a rule never points to an object that does not exist. In the model, a rule that names an undefined forwarding profile makes the traffic <b>drop</b>, so the order matters in production.</p>

<div class="tip"><p>Use <code>show | compare</code> in configure mode to see exactly what you are about to commit, and <code>rollback</code> to discard it. The course CLI validates syntax at commit; it cannot know whether your policy is wise.</p></div>

<h3>Step 3: verify with four commands</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan sla-profiles
SLA profile     Latency   Jitter   Loss
VOICE           150 ms    30 ms    1 %

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         allow

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       voice        VOICE-FP

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via MPLS</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Read it from the bottom: the decision is MPLS, the rule that made it is R-VOICE, the profile is VOICE-FP, and the reason is the "first up transport that meets the SLA" rule. The three tables above prove each object exists with the right values. Now repeat the SLA monitor and notice the new last column:</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   VOICE=yes
MPLS       up     20 ms     2 ms     0.05 %  <span class="hl">VOICE=yes</span>
LTE        up     60 ms     15 ms    1 %     VOICE=yes</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Build order and verification">
<rect x="15" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. SLA profile</text><text x="85" y="73" text-anchor="middle" class="svg-muted" font-size="12">VOICE</text>
<rect x="180" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="250" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Forwarding profile</text><text x="250" y="73" text-anchor="middle" class="svg-muted" font-size="12">VOICE-FP</text>
<rect x="345" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Rule</text><text x="415" y="73" text-anchor="middle" class="svg-muted" font-size="12">R-VOICE in CORP</text>
<rect x="510" y="30" width="115" height="56" rx="8" fill="#fde68a"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Prove it</text><text x="567" y="73" text-anchor="middle" class="svg-muted" font-size="12">path-selection</text>
<line x1="155" y1="58" x2="180" y2="58" stroke="#64748b" stroke-width="2"/><line x1="320" y1="58" x2="345" y2="58" stroke="#64748b" stroke-width="2"/><line x1="485" y1="58" x2="510" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Each object points to the one on its left. Build left to right, verify right to left.</text>
</svg><p class="cap">Build bottom-up; verify top-down.</p></div>

<div class="eg"><p><b>Worked example.</b> Why MPLS and not Internet? Both meet VOICE. The list says MPLS first. Why not LTE? It is not in the priority list. If you now ask for <code>web</code>, the answer is still <code>ecmp via Internet,MPLS,LTE</code> because no rule matches web. One rule changed one application only.</p></div>

<div class="note"><p>On the real platform you would normally build these objects once in a Director template (SLA profile, forwarding profile, rule set) and push them to a device group. On a branch that came from a template, the pushed lines are read-only and you change them in the Director. The labs let you type them directly on the branch so you can see each element.</p></div>

<div class="warn"><p><b>Common mistakes:</b> typing <code>jitter 30ms</code> or other units (values are plain numbers: ms and percent); forgetting the final <code>commit</code> (the set lines are only candidates until then); verifying with <code>path-selection application web</code> by mistake; entering the rule before the profile exists.</p></div>
<div class="exam"><p><b>Exam trap:</b> a successful commit proves syntax, not intent. Always finish with a behavioural proof, here <code>path-selection</code>, not just a configuration listing.</p></div>

<div class="scn"><h4>Policy rolled out with no proof</h4><p>An engineer pushed a voice policy to forty branches on a Friday and left. On Monday, thirty-nine branches were fine and one still balanced voice. Nobody had run the path-selection check. The one site had its template override from an older project that shadowed the rule. A baseline-and-proof checklist would have caught it on Friday.</p><p><b>Lesson:</b> Baseline before, prove after, and keep the outputs in the change record.</p></div>

<div class="iv"><p class="q">"You have configured a new voice policy. How do you prove it works?"</p><p>Check the three objects with show commands, then ask the policy what it would do for voice (path-selection) and confirm the transport, rule and reason. Check the SLA monitor to see current numbers. Mention that you tested a non-voice application to prove the rule is scoped correctly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: SLA profile, forwarding profile, rule; verify in reverse.</li>
<li>Voice policy: 150 ms, 30 ms, 1 %; priority MPLS,Internet; fallback allow.</li>
<li>Proof command: <code>show orgs org Acme sd-wan path-selection application voice</code> must say forward via MPLS.</li>
<li>Other applications without rules stay on ECMP.</li>
</ul></div>
`,hi:`
<p>Yeh chapter aapko lab <b>vs-sla-policy</b> ("Voice policy: SLA, forwarding profile and rule") ke liye taiyaar karta hai. Aap teen objects sahi order mein banaoge aur phir show commands se result prove karoge. Ghar banane jaisa socho: pehle foundation (SLA profile), phir deewarein (forwarding profile), phir woh darwaza jo log asal mein use karte hain (rule).</p>

<h3>Situation</h3>
<p>Delhi (Branch1, organization Acme, site-id 101) ke paas Bengaluru (Branch2) aur Controller tak pehle se teen healthy tunnels hain. Koi <b>policy nahi</b> hai, isliye har application, voice bhi, Internet, MPLS aur LTE par load-balance hoti hai. Aapka task: SLA profile <code>VOICE</code> (latency 150 ms, jitter 30 ms, loss 1 %), forwarding profile <code>VOICE-FP</code> (priority MPLS phir Internet, fallback allow) aur rule <code>R-VOICE</code> banao jo application voice match kare. Phir prove karo ki voice MPLS use karti hai.</p>

<h3>Step 1: badalne se pehle dekho</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   -
MPLS       up     20 ms     2 ms     0.05 %  -
LTE        up     60 ms     15 ms    1 %     -

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: ecmp via Internet,MPLS,LTE
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Do facts: circuits healthy hain, aur voice sab par balance ho rahi hai. Last column mein <code>-</code> ka matlab hai ki abhi koi SLA profile defined nahi hai. Har change se pehle aisa baseline lena achhi aadat hai.</p>

<h3>Step 2: sahi order mein configure karo</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% <span class="c">! 1. SLA profile: voice ke liye "good" ka matlab</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
admin@Branch1-cli% set orgs org-services Acme sd-wan sla-profiles VOICE loss 1
admin@Branch1-cli% <span class="c">! 2. Forwarding profile: kahan bhejna hai</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet
admin@Branch1-cli% set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow
admin@Branch1-cli% commit
admin@Branch1-cli% <span class="c">! 3. Rule: kaunsi traffic isse use karegi</span>
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch1-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>Lab ise do tasks mein baantta hai: pehle SLA profile aur forwarding profile, phir rule aur proof. Profiles pehle commit karne ka fayda hai: rule kabhi aise object ki taraf point nahi karta jo exist nahi karta. Model mein jo rule undefined forwarding profile ka naam leta hai uski traffic <b>drop</b> ho jaati hai, isliye production mein order matter karta hai.</p>

<div class="tip"><p>Configure mode mein <code>show | compare</code> se dekho ki aap exactly kya commit karne wale ho, aur <code>rollback</code> se use discard karo. Course CLI commit par syntax validate karta hai; woh yeh nahi jaan sakta ki aapki policy samajhdaar hai ya nahi.</p></div>

<h3>Step 3: chaar commands se verify karo</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan sla-profiles
SLA profile     Latency   Jitter   Loss
VOICE           150 ms    30 ms    1 %

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan forwarding-profiles
Forwarding profile  SLA profile     Transport priority      Fallback
VOICE-FP            VOICE           MPLS &gt; Internet         allow

admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       voice        VOICE-FP

admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: <span class="hl">forward via MPLS</span>
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Ise neeche se padho: decision MPLS hai, use banane wala rule R-VOICE hai, profile VOICE-FP hai, aur reason "first up transport jo SLA meet kare" wala rule hai. Upar ke teen tables prove karte hain ki har object sahi values ke saath exist karta hai. Ab SLA monitor dobara chalao aur naya last column dekho:</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   VOICE=yes
MPLS       up     20 ms     2 ms     0.05 %  <span class="hl">VOICE=yes</span>
LTE        up     60 ms     15 ms    1 %     VOICE=yes</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Build order aur verification">
<rect x="15" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. SLA profile</text><text x="85" y="73" text-anchor="middle" class="svg-muted" font-size="12">VOICE</text>
<rect x="180" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="250" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Forwarding profile</text><text x="250" y="73" text-anchor="middle" class="svg-muted" font-size="12">VOICE-FP</text>
<rect x="345" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Rule</text><text x="415" y="73" text-anchor="middle" class="svg-muted" font-size="12">CORP mein R-VOICE</text>
<rect x="510" y="30" width="115" height="56" rx="8" fill="#fde68a"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Prove karo</text><text x="567" y="73" text-anchor="middle" class="svg-muted" font-size="12">path-selection</text>
<line x1="155" y1="58" x2="180" y2="58" stroke="#64748b" stroke-width="2"/><line x1="320" y1="58" x2="345" y2="58" stroke="#64748b" stroke-width="2"/><line x1="485" y1="58" x2="510" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Har object apne left wale ki taraf point karta hai. Left se right build karo, right se left verify karo.</text>
</svg><p class="cap">Neeche se upar build karo; upar se neeche verify karo.</p></div>

<div class="eg"><p><b>Worked example.</b> MPLS kyun, Internet kyun nahi? Dono VOICE meet karte hain. List mein MPLS pehle hai. LTE kyun nahi? Woh priority list mein nahi hai. Agar ab aap <code>web</code> poochho, to jawab abhi bhi <code>ecmp via Internet,MPLS,LTE</code> hai kyunki web ka koi rule match nahi karta. Ek rule ne sirf ek application badli.</p></div>

<div class="note"><p>Real platform par aap aam taur par yeh objects ek baar Director template mein banate ho (SLA profile, forwarding profile, rule set) aur device group par push karte ho. Template se aayi branch par pushed lines read-only hoti hain aur aap unhe Director mein badalte ho. Labs aapko unhe branch par seedha type karne dete hain taaki aap har element dekh sako.</p></div>

<div class="warn"><p><b>Common mistakes:</b> <code>jitter 30ms</code> ya koi aur units type karna (values plain numbers hain: ms aur percent); aakhri <code>commit</code> bhool jaana (commit tak set lines sirf candidate hain); galti se <code>path-selection application web</code> se verify karna; profile exist hone se pehle rule enter karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> successful commit syntax prove karta hai, intent nahi. Hamesha behavioural proof se khatam karo, yahan <code>path-selection</code>, sirf configuration listing se nahi.</p></div>

<div class="scn"><h4>Bina proof ke policy rollout</h4><p>Ek engineer ne Friday ko chalis branches par voice policy push ki aur chala gaya. Monday ko untalis branches theek the aur ek abhi bhi voice balance kar raha tha. Kisi ne path-selection check nahi chalaya tha. Us ek site mein purane project ka template override tha jo rule ko shadow kar raha tha. Baseline-aur-proof checklist Friday ko hi pakad leti.</p><p><b>Lesson:</b> Pehle baseline lo, baad mein prove karo, aur outputs change record mein rakho.</p></div>

<div class="iv"><p class="q">"Aapne nayi voice policy configure ki hai. Aap kaise prove karoge ki yeh kaam karti hai?"</p><p>Teen objects show commands se check karo, phir policy se poochho ki voice ke liye woh kya karegi (path-selection) aur transport, rule aur reason confirm karo. Current numbers ke liye SLA monitor dekho. Yeh mention karo ki aapne non-voice application test ki taaki prove ho ki rule sahi scope mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: SLA profile, forwarding profile, rule; verify ulte order mein.</li>
<li>Voice policy: 150 ms, 30 ms, 1 %; priority MPLS,Internet; fallback allow.</li>
<li>Proof command: <code>show orgs org Acme sd-wan path-selection application voice</code> ko forward via MPLS kehna chahiye.</li>
<li>Bina rule wali baaki applications ECMP par rehti hain.</li>
</ul></div>
`}};export{e as default};