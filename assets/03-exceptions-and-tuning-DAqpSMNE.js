var e={id:`exceptions-tuning`,h:{en:`Exceptions and tuning`,hi:`Exceptions aur tuning`},body:{en:`
<p>Deep inspection is on, and soon a real user complains: "Our ERP export is blocked." The inspection engine is a pattern matcher. Sometimes it sees a pattern in perfectly legitimate traffic. That is a <b>false positive</b>. This chapter teaches the defender's answer: tune narrowly with an exception, never switch inspection off.</p>

<h3>Start with an analogy: the metal detector and the belt buckle</h3>
<p>A metal detector at a stadium beeps for a harmless belt buckle. The security manager does not switch the detector off for the whole stadium. She tells the guard: "This particular person with this particular buckle may pass." That sentence has a who, a what and a where. An Inspection exception is exactly that sentence.</p>

<h3>What an exception contains</h3>
<p>In the Inspection policy, an exception says: when the situation named here is seen, for traffic between this source and this destination, permit it instead of terminating. The simulator model has these parts:</p>
<ul>
<li><b>Situation</b>: the detection that fired (for example SUSPICIOUS-QUERY).</li>
<li><b>Source</b> and <b>destination</b>: any, or a specific address. Narrower is safer.</li>
<li><b>Action</b>: permit.</li>
<li><b>Enabled</b>: you can disable an exception without deleting it, which helps while testing.</li>
</ul>
<p>Without an exception, deep inspection terminates the connection. With a matching exception, the connection is permitted and the log records both the situation and the exception.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Scope of an exception">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Exception scope: from broad (risky) to narrow (preferred)</text>
<rect x="10" y="40" width="200" height="150" rx="8" fill="#fed7aa"/><text x="110" y="66" text-anchor="middle" class="svg-ink" font-size="13">Too broad</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: any</text><text x="110" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: any</text><text x="110" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: any</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">inspection is blind</text>
<rect x="225" y="40" width="200" height="150" rx="8" fill="#fde68a"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="13">Better</text><text x="325" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: SUSPICIOUS-QUERY</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: any</text><text x="325" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: any</text>
<rect x="440" y="40" width="190" height="150" rx="8" fill="#bbf7d0"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">Best</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: SUSPICIOUS-QUERY</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: client range</text><text x="535" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: ERP server</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Exception per situation AND destination. Inspection stays on everywhere else.</text>
</svg><p class="cap">Every field you fill in removes risk. Leaving a field as any widens the hole.</p></div>

<h3>Why not just turn inspection off?</h3>
<p>Turning the deep flag off on the rule, or disabling deep inspection in the policy, stops the false positive but also stops every true positive on that traffic. You trade one annoyed user for an unprotected server. The tuning order that professionals follow:</p>
<ol>
<li>Prove it is a false positive: reproduce, read the log, ask the application owner whether the request is legitimate.</li>
<li>Add an exception for that one situation and that one destination (and source when it is a known range).</li>
<li>Install policy.</li>
<li>Retest the legitimate request (now passes) and the training exploit request (still terminated).</li>
<li>Document who asked, why, and a review date.</li>
</ol>

<div class="eg"><p><b>Worked example (lab fp-inspection-2).</b> The Network Kings ERP server runs in the DMZ at 172.16.20.20 (srv-web in the lab). Staff export reports through the path /erp/export. Deep inspection matches this path as SUSPICIOUS-QUERY and terminates the export. In the lab you add an exception: situation SUSPICIOUS-QUERY, destination 172.16.20.20, action permit, then Install policy. Afterwards /erp/export is permitted and logged with the exception, while /vuln-test to the same server is still terminated by EXPLOIT-TEST. That second check proves you tuned instead of disabling.</p></div>

<h3>Reading the result</h3>
<pre class="out">Before exception
09:40:11  DMZ-web  Terminate  Situation SUSPICIOUS-QUERY matched: Terminate   /erp/export

After exception and install
09:52:30  DMZ-web  Permit  <span class="hl">Situation SUSPICIOUS-QUERY matched, Inspection exception permits it</span>   /erp/export
09:52:41  DMZ-web  Terminate  Situation EXPLOIT-TEST matched: Terminate   /vuln-test</pre>

<h3>Tuning is a habit, not a one-off</h3>
<p>Review exceptions on a schedule. Applications change; an exception for an old path may now cover something new. Keep a note in the exception comment. Remove exceptions for retired servers. In a real deployment, the signature set is also updated by the vendor, so what fires today may differ next month; the exact update process depends on your NGFW version, so check the documentation.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Source any, destination any, situation any: an exception that cancels inspection.</li>
<li>Fixing a false positive by changing the Access rule to Discard or removing the flag.</li>
<li>Forgetting Install policy and concluding the exception "does not work".</li>
<li>Permitting a situation for the wrong destination (a typo in the address) so the real server is still blocked.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "Which is the best fix for a false positive on one application path?" The answer is a narrow exception, not a lower inspection mode and not disabling the flag. Keep the scope to one situation and one destination.</p></div>

<div class="scn"><h4>The finance export that failed every month end</h4><p>Every month end the finance team could not export the ledger from the ERP. The first fix, in a hurry, was to remove the deep flag from the DMZ rule. Exports worked, and a month later an audit noticed the ERP front door had no inspection. The team restored the flag and added one exception: situation SUSPICIOUS-QUERY, destination the ERP server, with a review date. Exports kept working and the training exploit pattern still produced Terminate events.</p><p><b>Lesson:</b> the quick fix and the right fix differ by one narrow table row.</p></div>

<div class="iv"><p class="q">"Users report a legitimate application blocked by your IPS. What do you do?"</p><p>Strong answer: reproduce, read the log to get the situation, confirm with the application owner that the traffic is legitimate, add an exception limited to that situation and destination, install, retest the good request and a known bad one, and document it. Say clearly that you never disable inspection to fix one false positive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A false positive is legitimate traffic matched by a detection pattern.</li>
<li>An exception permits one situation for a given source and destination.</li>
<li>Narrow scope first; any/any/any is the same as turning inspection off.</li>
<li>Always retest the good request and a bad request after install.</li>
<li>Review and document exceptions regularly.</li>
</ul></div>
`,hi:`
<p>Deep inspection on hai, aur jaldi hi ek real user shikayat karta hai: "Hamara ERP export block ho raha hai." Inspection engine ek pattern matcher hai. Kabhi kabhi woh bilkul legitimate traffic mein pattern dekh leta hai. Yeh <b>false positive</b> hai. Yeh chapter defender ka jawab sikhata hai: narrow exception se tune karo, inspection kabhi band mat karo.</p>

<h3>Ek analogy se shuru karo: metal detector aur belt buckle</h3>
<p>Stadium ka metal detector ek harmless belt buckle par beep karta hai. Security manager poore stadium ka detector band nahi karti. Woh guard se kehti hai: "Is particular aadmi ko, is particular buckle ke saath, jaane do." Is sentence mein kaun, kya aur kahan hai. Inspection exception bilkul yahi sentence hai.</p>

<h3>Exception mein kya hota hai</h3>
<p>Inspection policy mein exception kehta hai: jab yahan likhi situation dikhe, is source aur destination ke beech ke traffic ke liye, terminate karne ki jagah permit karo. Simulator model ke parts:</p>
<ul>
<li><b>Situation</b>: jis detection ne fire kiya (jaise SUSPICIOUS-QUERY).</li>
<li><b>Source</b> aur <b>destination</b>: any, ya koi specific address. Narrow zyada safe hai.</li>
<li><b>Action</b>: permit.</li>
<li><b>Enabled</b>: aap exception ko delete kiye bina disable kar sakte ho, jo testing mein kaam aata hai.</li>
</ul>
<p>Exception ke bina deep inspection connection ko terminate karta hai. Matching exception ke saath connection permit hota hai aur log mein situation aur exception dono likhe jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Exception ka scope">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Exception scope: broad (risky) se narrow (preferred)</text>
<rect x="10" y="40" width="200" height="150" rx="8" fill="#fed7aa"/><text x="110" y="66" text-anchor="middle" class="svg-ink" font-size="13">Bahut broad</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: any</text><text x="110" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: any</text><text x="110" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: any</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">inspection andha hai</text>
<rect x="225" y="40" width="200" height="150" rx="8" fill="#fde68a"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="13">Behtar</text><text x="325" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: SUSPICIOUS-QUERY</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: any</text><text x="325" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: any</text>
<rect x="440" y="40" width="190" height="150" rx="8" fill="#bbf7d0"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">Sabse accha</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">situation: SUSPICIOUS-QUERY</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">source: client range</text><text x="535" y="132" text-anchor="middle" class="svg-muted" font-size="12">destination: ERP server</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Situation AUR destination ke hisaab se exception. Baaki sab jagah inspection on rehta hai.</text>
</svg><p class="cap">Jo field aap bharte ho woh risk kam karta hai. Field ko any chhodna hole ko bada karta hai.</p></div>

<h3>Inspection band kyun nahi kar dete?</h3>
<p>Rule par deep flag off karna ya policy mein deep inspection disable karna false positive rok deta hai, lekin us traffic ke har true positive ko bhi rok deta hai. Aap ek naraaz user ko ek unprotected server se badal lete ho. Professionals ka tuning order:</p>
<ol>
<li>Prove karo ki yeh false positive hai: reproduce karo, log padho, application owner se poochho ki request legitimate hai ya nahi.</li>
<li>Sirf us ek situation aur us ek destination ke liye exception add karo (aur source known range ho to woh bhi).</li>
<li>Install policy.</li>
<li>Legitimate request retest karo (ab pass hoti hai) aur training exploit request (ab bhi terminate hoti hai).</li>
<li>Document karo kisne maanga, kyun, aur review date.</li>
</ol>

<div class="eg"><p><b>Worked example (lab fp-inspection-2).</b> Network Kings ERP server DMZ mein 172.16.20.20 par chalta hai (lab mein srv-web). Staff reports path /erp/export se export karte hain. Deep inspection is path ko SUSPICIOUS-QUERY ki tarah match karta hai aur export terminate kar deta hai. Lab mein aap exception add karte ho: situation SUSPICIOUS-QUERY, destination 172.16.20.20, action permit, phir Install policy. Baad mein /erp/export permit hota hai aur exception ke saath log hota hai, jabki usi server par /vuln-test ab bhi EXPLOIT-TEST se terminate hota hai. Yeh doosra check prove karta hai ki aapne tune kiya, disable nahi.</p></div>

<h3>Result padhna</h3>
<pre class="out">Before exception
09:40:11  DMZ-web  Terminate  Situation SUSPICIOUS-QUERY matched: Terminate   /erp/export

After exception and install
09:52:30  DMZ-web  Permit  <span class="hl">Situation SUSPICIOUS-QUERY matched, Inspection exception permits it</span>   /erp/export
09:52:41  DMZ-web  Terminate  Situation EXPLOIT-TEST matched: Terminate   /vuln-test</pre>

<h3>Tuning ek habit hai, one-off nahi</h3>
<p>Exceptions ko schedule par review karo. Applications badalti hain; purane path ka exception ab kuch naya cover kar sakta hai. Exception ke comment mein note rakho. Retired servers ke exceptions hatao. Real deployment mein vendor signature set bhi update karta hai, isliye aaj jo fire hota hai woh agle mahine alag ho sakta hai; exact update process aapke NGFW version par depend karta hai, isliye documentation check karo.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Source any, destination any, situation any: aisa exception jo inspection cancel kar deta hai.</li>
<li>False positive ko Access rule ko Discard karke ya flag hatake theek karna.</li>
<li>Install policy bhoolkar yeh nateeja nikalna ki exception "kaam nahi karta".</li>
<li>Galat destination ke liye situation permit karna (address mein typo), isliye asli server ab bhi block rehta hai.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "Ek application path par false positive ka best fix kya hai?" Jawab narrow exception hai, na ki lower inspection mode aur na flag disable karna. Scope ko ek situation aur ek destination tak rakho.</p></div>

<div class="scn"><h4>Finance export jo har month end fail hota tha</h4><p>Har month end finance team ERP se ledger export nahi kar paati thi. Jaldbaazi mein pehla fix tha DMZ rule se deep flag hatana. Exports chalne lage, aur ek mahine baad audit ne dekha ki ERP ke front door par inspection nahi hai. Team ne flag wapas lagaya aur ek exception add kiya: situation SUSPICIOUS-QUERY, destination ERP server, review date ke saath. Exports chalte rahe aur training exploit pattern ab bhi Terminate events deta raha.</p><p><b>Lesson:</b> quick fix aur sahi fix mein ek narrow table row ka fark hota hai.</p></div>

<div class="iv"><p class="q">"Users report karte hain ki ek legitimate application aapke IPS ne block kar di. Aap kya karoge?"</p><p>Strong answer: reproduce karo, log padhke situation lo, application owner se confirm karo ki traffic legitimate hai, sirf us situation aur destination tak limited exception add karo, install karo, achhi request aur ek known bad request retest karo, aur document karo. Saaf bolo ki ek false positive ke liye aap inspection kabhi disable nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>False positive woh legitimate traffic hai jise detection pattern match kar le.</li>
<li>Exception ek situation ko diye gaye source aur destination ke liye permit karta hai.</li>
<li>Pehle narrow scope; any/any/any inspection band karne ke barabar hai.</li>
<li>Install ke baad hamesha achhi request aur bad request dono retest karo.</li>
<li>Exceptions ko regularly review aur document karo.</li>
</ul></div>
`}};export{e as default};