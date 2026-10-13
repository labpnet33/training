var e={id:`policy-structure`,h:{en:`Inspection policy structure and templates`,hi:`Inspection policy ki structure aur templates`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Forcepoint-style NGFW looks inside the content of allowed traffic, and how you control that from the Security Management Center (SMC) console: the Inspection policy, the per-rule deep inspection flag, exceptions for false positives, HTTPS inspection with exclusions, URL categories, and the log trail. Four labs follow: deep inspection on the DMZ rule, an exception for a false positive, HTTPS inspection with a banking exclusion, and blocking a URL category. This is independent training based on published documentation; it does not claim to cover any certification.</p>
<p><b>Prerequisites.</b> You should already know the Pune branch layout and the element set (fp-start, fp-network), how Access rules are matched top to bottom (fp-policy), and why NAT comes after the allow decision (fp-nat). Click-ops, but you understand what each click does.</p>

<h3>Start with an analogy: the airport</h3>
<p>An Access rule is the passport desk. It checks who you are and where you are going, and it says allow or block. It never opens your bag. Inspection is the baggage scanner behind the desk. The desk decides whether you may enter the terminal; the scanner decides whether what you carry is safe. A passenger can pass the desk and still be stopped at the scanner.</p>

<h3>Two layers: the rule and the Inspection policy</h3>
<p>On the NGFW, content inspection has two parts that you must keep apart in your head.</p>
<ul>
<li><b>The Access rule</b> matches source, destination, Service, and then takes an action: Allow, Discard, Refuse, Continue or Jump. In its options it carries flags, among them the <b>deep inspection</b> flag and the <b>https</b> flag in this simulator.</li>
<li><b>The Inspection policy</b> is a separate element that says <i>how</i> the engine inspects when a rule asks for it: the inspection mode, whether deep inspection is active at all, the list of exceptions, the HTTPS inspection settings (enabled or not, exclusions) and URL logging. The engine element points to exactly one Inspection policy.</li>
</ul>
<p>The rule is the switch for a traffic flow. The Inspection policy is the rulebook the scanner uses. If either is missing, nothing is inspected.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access rule and Inspection policy">
<rect x="10" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Access rule</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">Allow + deep flag</text>
<rect x="235" y="20" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Inspection policy</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">mode, exceptions, HTTPS</text>
<rect x="460" y="20" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Decision</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">pass or Terminate</text>
<line x1="180" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="460" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">Nothing reaches the engine until you press Install policy</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">NK-PUNE-FW uses one Inspection policy and one Access policy</text>
</svg><p class="cap">The rule asks for inspection; the Inspection policy says how. Both go live together at install.</p></div>

<h3>Templates: start from a safe base</h3>
<p>Writing every detection setting by hand would be slow and risky. The SMC therefore provides <b>templates</b>: a prepared Inspection policy that you use as a base and then tune. In this simulator the default policy has mode Medium with deep inspection on, HTTPS inspection off, no exceptions and URL logging on. The same idea exists for Access policies (a template holds common top rules, your policy adds its own below). Which template names and which modes exist differs between versions, so check the documentation for your NGFW version before you copy a name into a design document.</p>

<table class="cmp"><tr><th>Setting</th><th>Default in the lab</th><th>What it controls</th></tr>
<tr><td>Mode</td><td>Medium</td><td>How strict the base detection is</td></tr>
<tr><td>Deep inspection</td><td>On</td><td>Master switch of the policy; a rule still needs its own flag</td></tr>
<tr><td>HTTPS inspection</td><td>Disabled, no exclusions</td><td>Whether encrypted web traffic can be decrypted</td></tr>
<tr><td>Exceptions</td><td>None</td><td>Narrow permits for known false positives</td></tr>
<tr><td>URL logging</td><td>On</td><td>Whether web requests are logged with their category</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Network Kings in Pune runs NK-PUNE-FW. The Inspection policy is the default one: Medium, deep on, nothing else. The DMZ rule allows HTTP from the Internet to srv-web (172.16.20.20) but its deep flag is off. A request to /vuln-test on WEB1 is allowed with no complaint, because the policy exists but the rule never asks the scanner to look. The policy was fine; the rule was the gap.</p></div>

<h3>Where you find it in the console</h3>
<p>The console has pages for Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts, and Tools. The Inspection page holds the policy settings (HTTPS inspection, exclusions, exceptions). The per-rule flags live on the Policies page, in the rule options. The Install policy bar at the top is how changes go to the engine. Remember rule 1 of the track: the SMC database is only a draft; the engine uses the installed snapshot.</p>

<div class="note"><p><b>Not modelled.</b> The real detection engine, its signature database and its update mechanism are not simulated. The lab uses two harmless training patterns only: a request path containing /vuln-test, and one containing /erp/export. The lesson explains the concepts so you can read a real console later.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking a strong Inspection policy protects every rule. It protects only rules whose flag is on. A policy without flagged rules is a scanner with nobody walking through it.</p></div>

<div class="exam"><p><b>Exam trap.</b> An Access rule with action Allow does not mean the content is clean. Allow is a decision about addresses and Service. Inspection is a second, separate decision made on the same connection.</p></div>

<div class="scn"><h4>The policy that looked strong</h4><p>A new engineer at a branch reviewed the Inspection policy, saw a strict mode and deep inspection enabled, and wrote in the audit report that the DMZ was protected. Weeks later the web team found a probe in the server log that the firewall never reported. The engineer opened the Access policy and saw the DMZ rule had no deep inspection flag. They turned it on, installed the policy, repeated the probe and saw it terminated and logged.</p><p><b>Lesson:</b> audit the rules and the policy together. Policy settings without the rule flag protect nothing.</p></div>

<div class="iv"><p class="q">"What is the difference between an Access rule and an Inspection policy?"</p><p>Strong answer: the Access rule decides who may talk to what and applies the action; it can carry a flag that requests content inspection. The Inspection policy defines how the engine inspects (mode, exceptions, HTTPS handling). Mention that both need Install policy, and that you verify in the logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access rule = passport desk; Inspection = baggage scanner.</li>
<li>The engine uses one Inspection policy; rules request inspection with a flag.</li>
<li>Templates give a tested base; names and modes depend on the version, so check the documentation.</li>
<li>Defaults here: Medium, deep on, HTTPS off, no exceptions, URL logging on.</li>
<li>Nothing is live until Install policy.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Forcepoint-style NGFW allowed traffic ke content ke andar kaise dekhta hai, aur aap ise Security Management Center (SMC) console se kaise control karte ho: Inspection policy, har rule ka deep inspection flag, false positive ke liye exceptions, exclusions ke saath HTTPS inspection, URL categories, aur log trail. Iske baad chaar labs hain: DMZ rule par deep inspection, false positive ke liye exception, banking exclusion ke saath HTTPS inspection, aur ek URL category block karna. Yeh independent training hai jo published documentation par based hai; yeh kisi certification ko cover karne ka claim nahi karti.</p>
<p><b>Prerequisites.</b> Aapko Pune branch ka layout aur element set (fp-start, fp-network) pata hona chahiye, Access rules upar se neeche kaise match hote hain (fp-policy), aur NAT allow decision ke baad kyun aata hai (fp-nat). Click-ops, but you understand what each click does.</p>

<h3>Ek analogy se shuru karo: airport</h3>
<p>Access rule passport desk hai. Woh check karta hai ki aap kaun ho aur kahan jaa rahe ho, aur allow ya block bolta hai. Woh aapka bag kabhi nahi kholta. Inspection desk ke peeche wala baggage scanner hai. Desk decide karta hai ki aap terminal mein aa sakte ho ya nahi; scanner decide karta hai ki aap jo le jaa rahe ho woh safe hai ya nahi. Ek passenger desk paar kar sakta hai aur phir bhi scanner par rok liya jaata hai.</p>

<h3>Do layers: rule aur Inspection policy</h3>
<p>NGFW par content inspection ke do hisse hain jinhe aapko dimag mein alag rakhna hai.</p>
<ul>
<li><b>Access rule</b> source, destination, Service match karta hai, phir action leta hai: Allow, Discard, Refuse, Continue ya Jump. Apne options mein yeh flags rakhta hai, jinmein <b>deep inspection</b> flag aur is simulator mein <b>https</b> flag hain.</li>
<li><b>Inspection policy</b> ek alag element hai jo batata hai ki jab rule maange to engine <i>kaise</i> inspect kare: inspection mode, deep inspection active hai ya nahi, exceptions ki list, HTTPS inspection settings (enabled ya nahi, exclusions) aur URL logging. Engine element bilkul ek Inspection policy ko point karta hai.</li>
</ul>
<p>Rule ek traffic flow ka switch hai. Inspection policy woh rulebook hai jo scanner use karta hai. Dono mein se ek bhi missing ho to kuch inspect nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access rule aur Inspection policy">
<rect x="10" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Access rule</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">Allow + deep flag</text>
<rect x="235" y="20" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Inspection policy</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">mode, exceptions, HTTPS</text>
<rect x="460" y="20" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Decision</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">pass ya Terminate</text>
<line x1="180" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="460" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">Install policy dabane tak engine tak kuch nahi pahunchta</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">NK-PUNE-FW ek Inspection policy aur ek Access policy use karta hai</text>
</svg><p class="cap">Rule inspection maangta hai; Inspection policy batati hai kaise. Dono install par saath live hote hain.</p></div>

<h3>Templates: safe base se shuru karo</h3>
<p>Har detection setting haath se likhna slow aur risky hoga. Isliye SMC <b>templates</b> deta hai: ek ready Inspection policy jise aap base banake tune karte ho. Is simulator mein default policy ka mode Medium hai, deep inspection on, HTTPS inspection off, koi exceptions nahi aur URL logging on. Yahi idea Access policies ke liye bhi hai (template mein common top rules hote hain, aapki policy apne rules neeche jodti hai). Kaunse template names aur modes hain, yeh version ke hisaab se badalta hai, isliye design document mein koi naam copy karne se pehle apne NGFW version ki documentation check karo.</p>

<table class="cmp"><tr><th>Setting</th><th>Lab mein default</th><th>Kya control karta hai</th></tr>
<tr><td>Mode</td><td>Medium</td><td>Base detection kitni strict hai</td></tr>
<tr><td>Deep inspection</td><td>On</td><td>Policy ka master switch; rule ko phir bhi apna flag chahiye</td></tr>
<tr><td>HTTPS inspection</td><td>Disabled, koi exclusion nahi</td><td>Encrypted web traffic decrypt ho sakta hai ya nahi</td></tr>
<tr><td>Exceptions</td><td>Koi nahi</td><td>Known false positives ke liye narrow permits</td></tr>
<tr><td>URL logging</td><td>On</td><td>Web requests category ke saath log hoti hain ya nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Network Kings Pune mein NK-PUNE-FW chalata hai. Inspection policy default hai: Medium, deep on, aur kuch nahi. DMZ rule Internet se srv-web (172.16.20.20) tak HTTP allow karta hai lekin uska deep flag off hai. WEB1 par /vuln-test ki request bina kisi shikayat ke allow ho jaati hai, kyunki policy hai lekin rule scanner se dekhne ko kabhi kehta hi nahi. Policy theek thi; rule mein gap tha.</p></div>

<h3>Console mein yeh kahan milta hai</h3>
<p>Console ke pages hain Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts aur Tools. Inspection page par policy settings hain (HTTPS inspection, exclusions, exceptions). Har rule ke flags Policies page par, rule options mein hote hain. Upar wala Install policy bar changes ko engine tak bhejne ka tarika hai. Track ka rule 1 yaad rakho: SMC database sirf draft hai; engine installed snapshot use karta hai.</p>

<div class="note"><p><b>Not modelled.</b> Asli detection engine, uska signature database aur update mechanism simulate nahi hote. Lab sirf do harmless training patterns use karta hai: ek request path jisme /vuln-test ho, aur ek jisme /erp/export ho. Lesson concepts samjhata hai taaki aap baad mein real console padh sako.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki strong Inspection policy har rule ko protect karti hai. Woh sirf un rules ko protect karti hai jinka flag on hai. Flagged rules ke bina policy aisa scanner hai jisme se koi chalta hi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Allow action wale Access rule ka matlab yeh nahi ki content clean hai. Allow addresses aur Service ka decision hai. Inspection usi connection par liya gaya doosra, alag decision hai.</p></div>

<div class="scn"><h4>Woh policy jo strong dikhti thi</h4><p>Ek branch ke naye engineer ne Inspection policy review ki, strict mode aur deep inspection enabled dekha, aur audit report mein likh diya ki DMZ protected hai. Kuch hafte baad web team ko server log mein ek probe mila jise firewall ne kabhi report nahi kiya. Engineer ne Access policy kholi to DMZ rule par deep inspection flag nahi tha. Unhone use on kiya, policy install ki, probe dobara chalaya aur dekha ki woh terminate hua aur log hua.</p><p><b>Lesson:</b> rules aur policy dono ko saath audit karo. Rule flag ke bina policy settings kuch protect nahi karti.</p></div>

<div class="iv"><p class="q">"Access rule aur Inspection policy mein kya fark hai?"</p><p>Strong answer: Access rule decide karta hai kaun kisse baat kar sakta hai aur action lagata hai; woh content inspection maangne wala flag rakh sakta hai. Inspection policy define karti hai ki engine kaise inspect kare (mode, exceptions, HTTPS handling). Batao ki dono ko Install policy chahiye, aur aap logs mein verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access rule = passport desk; Inspection = baggage scanner.</li>
<li>Engine ek Inspection policy use karta hai; rules flag se inspection maangte hain.</li>
<li>Templates tested base dete hain; naam aur modes version par depend karte hain, documentation check karo.</li>
<li>Yahan defaults: Medium, deep on, HTTPS off, koi exception nahi, URL logging on.</li>
<li>Install policy tak kuch live nahi hota.</li>
</ul></div>
`}};export{e as default};