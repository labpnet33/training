var e={id:`policy-structure`,h:{en:`Policy structure: policy, rules, match and order`,hi:`Policy structure: policy, rules, match aur order`},body:{en:`
<p>Think of a hotel reception desk with a laminated card of instructions: "If the guest asks for a taxi, call Rajan. If the guest asks for a doctor, call the clinic. For anything else, ask the manager." The receptionist reads the card from top to bottom and stops at the first line that fits. That card is a <b>policy</b>; each line is a <b>rule</b>.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>Policy</dt><dd>A named container of ordered rules, for example <code>CORP</code>. It belongs to the organization (tenant) <code>Acme</code>, so the CLI path starts with <code>orgs org-services Acme sd-wan policies</code>.</dd>
<dt>Rule</dt><dd>One entry in the policy: a name, one or more <b>match</b> criteria and an <b>action</b>. Example: <code>R-VOICE</code>.</dd>
<dt>Match criteria</dt><dd>What a flow must look like to be selected. In the course model: the application. In real Versa you can combine source and destination addresses, application and application groups, URL categories, users and groups, DSCP and more.</dd>
<dt>Action</dt><dd>What to do with a matching flow. In the course model: <code>forwarding-profile &lt;name&gt;</code>. In real Versa the action can also allow or deny, apply a QoS marking, or choose a security profile.</dd>
</dl>

<pre class="code"><span class="c">! policy CORP, rule R-VOICE</span>
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP</pre>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Policy structure">
<rect x="20" y="15" width="600" height="240" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="38" class="svg-accent" font-size="14">Policy CORP (organization Acme)</text>
<rect x="40" y="55" width="560" height="44" rx="8" fill="#bae6fd"/><text x="55" y="82" class="svg-ink" font-size="13">1. R-VOICE: match application voice   then  forwarding-profile VOICE-FP</text>
<rect x="40" y="110" width="560" height="44" rx="8" fill="#bbf7d0"/><text x="55" y="137" class="svg-ink" font-size="13">2. R-ERP: match application erp   then  forwarding-profile ERP-FP</text>
<rect x="40" y="165" width="560" height="44" rx="8" fill="#fde68a"/><text x="55" y="192" class="svg-ink" font-size="13">3. R-ANY: match application any   then  forwarding-profile BULK-FP</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Read top to bottom. The first rule that matches wins. No match = ECMP.</text>
</svg><p class="cap">Rules are evaluated in order; the first match decides the forwarding profile.</p></div>

<h3>First match wins</h3>
<p>Once a rule matches, evaluation stops. Later rules are not consulted. That has two consequences:</p>
<ul>
<li><b>Specific before general.</b> Put <code>R-VOICE</code> and <code>R-ERP</code> above a catch-all rule. If you put <code>match application any</code> first, it swallows everything and the specific rules never run.</li>
<li><b>Overlaps are your responsibility.</b> If two rules could both match a flow, only the earlier one applies.</li>
</ul>
<p>In the course model, <code>any</code> matches every application. The model looks through the policies and their rules in the order they exist and takes the first rule whose application equals the asked one or is <code>any</code>.</p>

<h3>When nothing matches: ECMP</h3>
<p>If no rule matches a flow, SD-WAN does not drop it. It falls back to default forwarding: the flow is sent through the overlay and load-balanced with <b>ECMP</b> (equal-cost multipath) across <b>every tunnel that is up</b>. Voice, web and backup then share the same three tunnels evenly, including the slowest. That is why having no policy is not harmless for real-time traffic.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: ecmp via Internet,MPLS,LTE
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Notice there is no <code>Rule:</code> line: no rule was involved. When a rule is involved you will see its name, its forwarding profile and its SLA profile.</p>

<div class="eg"><p><b>Worked example.</b> CORP has R-VOICE (voice, VOICE-FP). A web flow arrives: R-VOICE does not match, no other rule exists, so web is ECMP over Internet, MPLS and LTE. A voice flow arrives: R-VOICE matches, VOICE-FP chooses MPLS. Now someone adds R-ANY (any, BULK-FP) <b>above</b> R-VOICE. Voice now matches R-ANY first and is handled by BULK-FP: the carefully built voice rule is dead code.</p></div>

<h3>Validating the structure</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       voice        VOICE-FP</pre>
<p>Three checks for every rule: the application is the one you meant, the forwarding profile exists (<code>show ... forwarding-profiles</code>) and the rule order is right.</p>

<div class="note"><p><b>Real Versa.</b> SD-WAN policy in Versa is organised as policies containing ordered rules, with rule sets that can be applied to sites through templates. A policy can include a default rule for traffic not matched by earlier ones. What happens to unmatched traffic depends on configuration and release (commonly default forwarding over the available paths). The course model fixes this to ECMP over tunnels that are up. Rules in real Versa are normally pushed from the Director template; on the branch the pushed policy is read-only.</p></div>

<div class="warn"><p><b>Common mistakes:</b> a catch-all rule above specific rules; a rule that points to a forwarding profile name with a typo; testing with the wrong application name in <code>path-selection</code> (you will get the answer for the wrong application); editing the policy on the branch when the Director template owns it.</p></div>
<div class="exam"><p><b>Exam trap:</b> "no rule matches" does not mean "traffic is dropped". It means default forwarding, which here is ECMP across all up tunnels. Dropping happens only through an action or a fallback drop.</p></div>

<div class="scn"><h4>The catch-all that ate the policy</h4><p>During a policy clean-up, a junior engineer added a catch-all rule at the top "so nothing is ever unmatched". The next morning, the call quality complaints returned. Path-selection for voice showed the catch-all rule and the bulk profile. Moving the catch-all to the end restored voice over MPLS.</p><p><b>Lesson:</b> Order is part of the configuration. Specific first, general last.</p></div>

<div class="iv"><p class="q">"How does an SD-WAN policy decide, and what happens when nothing matches?"</p><p>Rules are checked top to bottom, first match wins, and the match (application and more) selects an action such as a forwarding profile. If no rule matches, default forwarding applies, here ECMP over all up tunnels. Mention rule order and catch-all risk.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy contains ordered rules; a rule has match criteria and an action.</li>
<li>First match wins; place specific rules above general ones.</li>
<li>No match means ECMP across all up tunnels, not a drop.</li>
<li>Check rules with <code>show orgs org-services Acme sd-wan policies</code>.</li>
</ul></div>
`,hi:`
<p>Hotel reception desk ki ek laminated card socho jis par instructions hain: "Agar guest taxi maange to Rajan ko call karo. Agar doctor maange to clinic ko call karo. Baaki sab ke liye manager se poochho." Receptionist card upar se neeche padhta hai aur pehli fit hone wali line par ruk jaata hai. Woh card ek <b>policy</b> hai; har line ek <b>rule</b> hai.</p>

<h3>Hisse</h3>
<dl class="terms">
<dt>Policy</dt><dd>Ordered rules ka naam wala container, jaise <code>CORP</code>. Yeh organization (tenant) <code>Acme</code> ka hai, isliye CLI path <code>orgs org-services Acme sd-wan policies</code> se shuru hota hai.</dd>
<dt>Rule</dt><dd>Policy ki ek entry: ek naam, ek ya zyada <b>match</b> criteria aur ek <b>action</b>. Example: <code>R-VOICE</code>.</dd>
<dt>Match criteria</dt><dd>Flow ko select hone ke liye kaisa dikhna chahiye. Course model mein: application. Real Versa mein source aur destination addresses, application aur application groups, URL categories, users aur groups, DSCP aur bahut kuch combine kar sakte ho.</dd>
<dt>Action</dt><dd>Matching flow ke saath kya karna hai. Course model mein: <code>forwarding-profile &lt;name&gt;</code>. Real Versa mein action allow ya deny, QoS marking apply karna, ya security profile chunna bhi ho sakta hai.</dd>
</dl>

<pre class="code"><span class="c">! policy CORP, rule R-VOICE</span>
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP</pre>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Policy structure">
<rect x="20" y="15" width="600" height="240" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="38" class="svg-accent" font-size="14">Policy CORP (organization Acme)</text>
<rect x="40" y="55" width="560" height="44" rx="8" fill="#bae6fd"/><text x="55" y="82" class="svg-ink" font-size="13">1. R-VOICE: match application voice   then  forwarding-profile VOICE-FP</text>
<rect x="40" y="110" width="560" height="44" rx="8" fill="#bbf7d0"/><text x="55" y="137" class="svg-ink" font-size="13">2. R-ERP: match application erp   then  forwarding-profile ERP-FP</text>
<rect x="40" y="165" width="560" height="44" rx="8" fill="#fde68a"/><text x="55" y="192" class="svg-ink" font-size="13">3. R-ANY: match application any   then  forwarding-profile BULK-FP</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Upar se neeche padho. Pehla matching rule jeetta hai. Match nahi = ECMP.</text>
</svg><p class="cap">Rules order mein evaluate hote hain; pehla match forwarding profile decide karta hai.</p></div>

<h3>Pehla match jeetta hai</h3>
<p>Ek rule match hote hi evaluation ruk jaata hai. Baad ke rules consult nahi hote. Iske do consequences hain:</p>
<ul>
<li><b>Pehle specific, phir general.</b> <code>R-VOICE</code> aur <code>R-ERP</code> ko catch-all rule ke upar rakho. Agar <code>match application any</code> pehle rakh diya, to woh sab kuch kha jaata hai aur specific rules kabhi nahi chalte.</li>
<li><b>Overlaps aapki zimmedari hain.</b> Agar do rules ek flow ko match kar sakte hain, to sirf pehla apply hota hai.</li>
</ul>
<p>Course model mein <code>any</code> har application match karta hai. Model policies aur unke rules ko unke exist karne ke order mein dekhta hai aur pehla rule leta hai jiski application poochhi gayi application ke barabar ho ya <code>any</code> ho.</p>

<h3>Jab kuch match na ho: ECMP</h3>
<p>Agar koi rule flow ko match nahi karta, to SD-WAN use drop nahi karta. Woh default forwarding par girta hai: flow overlay se bheja jaata hai aur <b>har tunnel jo up hai</b> par <b>ECMP</b> (equal-cost multipath) se load-balance hota hai. Phir voice, web aur backup teeno same tunnels barabar share karte hain, sabse slow bhi. Isliye real-time traffic ke liye policy na hona harmless nahi hai.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: ecmp via Internet,MPLS,LTE
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Dhyan do ki <code>Rule:</code> line nahi hai: koi rule involved nahi tha. Jab rule involved hota hai to uska naam, forwarding profile aur SLA profile dikhta hai.</p>

<div class="eg"><p><b>Worked example.</b> CORP mein R-VOICE (voice, VOICE-FP) hai. Web flow aata hai: R-VOICE match nahi karta, koi aur rule nahi hai, to web Internet, MPLS aur LTE par ECMP hota hai. Voice flow aata hai: R-VOICE match karta hai, VOICE-FP MPLS chunta hai. Ab koi R-VOICE ke <b>upar</b> R-ANY (any, BULK-FP) add kar deta hai. Voice ab pehle R-ANY match karti hai aur BULK-FP se handle hoti hai: dhyan se banaya voice rule dead code ban gaya.</p></div>

<h3>Structure validate karna</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       voice        VOICE-FP</pre>
<p>Har rule ke liye teen checks: application wahi hai jo aapne socha tha, forwarding profile exist karta hai (<code>show ... forwarding-profiles</code>) aur rule order sahi hai.</p>

<div class="note"><p><b>Real Versa.</b> Versa mein SD-WAN policy policies ke roop mein organised hoti hai jinme ordered rules hote hain, aur rule sets templates ke through sites par apply hote hain. Policy mein pichhle rules se match na hone wali traffic ke liye default rule ho sakta hai. Unmatched traffic ka kya hoga yeh configuration aur release par depend karta hai (aam taur par available paths par default forwarding). Course model ise up tunnels par ECMP par fix kar deta hai. Real Versa mein rules aam taur par Director template se push hote hain; branch par pushed policy read-only hoti hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> specific rules ke upar catch-all rule; forwarding profile ke naam mein typo wala rule; <code>path-selection</code> mein galat application name se test karna (aapko galat application ka jawab milega); Director template jab policy ka owner ho tab branch par policy edit karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> "koi rule match nahi" ka matlab "traffic drop" nahi hai. Matlab hai default forwarding, jo yahan sab up tunnels par ECMP hai. Drop sirf action ya fallback drop se hota hai.</p></div>

<div class="scn"><h4>Catch-all jisne policy kha li</h4><p>Policy clean-up ke dauran ek junior engineer ne "taaki kuch kabhi unmatched na rahe" sochkar top par catch-all rule add kar diya. Agli subah call quality ki complaints wapas aa gayi. Voice ka path-selection catch-all rule aur bulk profile dikha raha tha. Catch-all ko end mein move karne se voice wapas MPLS par aa gayi.</p><p><b>Lesson:</b> Order configuration ka hissa hai. Specific pehle, general baad mein.</p></div>

<div class="iv"><p class="q">"SD-WAN policy kaise decide karti hai, aur jab kuch match na ho to kya hota hai?"</p><p>Rules upar se neeche check hote hain, pehla match jeetta hai, aur match (application aur aur kuch) action chunta hai jaise forwarding profile. Agar koi rule match na ho to default forwarding lagti hai, yahan sab up tunnels par ECMP. Rule order aur catch-all risk mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy mein ordered rules hote hain; rule mein match criteria aur action hota hai.</li>
<li>Pehla match jeetta hai; specific rules ko general ke upar rakho.</li>
<li>No match matlab sab up tunnels par ECMP, drop nahi.</li>
<li>Rules check karo <code>show orgs org-services Acme sd-wan policies</code> se.</li>
</ul></div>
`}};export{e as default};