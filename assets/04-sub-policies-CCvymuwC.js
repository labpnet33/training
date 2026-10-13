var e={id:`subpolicies`,h:{en:`Sub-policies and Jump`,hi:`Sub-policies aur Jump`},body:{en:`
<p>A branch policy can grow long. The DMZ alone may need ten rules for the web server, and mixing them with staff rules makes the list hard to read. A <b>sub-policy</b> is a small, named group of rules that you call from the main policy with a <b>Jump</b> rule.</p>

<h3>Analogy: the department desk</h3>
<p>At the front desk of the Pune building the guard has a short register. One line says: "Visitors for the server room: go to the server-room desk". The server-room desk has its own register with detailed rules. If the server-room desk has no rule for this visitor, the visitor is sent back to the front desk, which carries on reading its own list. A Jump rule is that line, and the sub-policy is the desk.</p>

<h3>How Jump works</h3>
<p>A Jump rule has the usual match columns (for example, source any, destination <code>net-dmz</code>, service any) and the action Jump with a sub-policy name. When a connection matches the Jump rule, the engine enters the sub-policy and reads its rules top to bottom.</p>
<ul>
<li>If a rule inside the sub-policy matches, its action applies and the connection is decided.</li>
<li>If <b>no rule inside matches</b>, matching <b>returns to the calling policy</b> and continues with the rule below the Jump.</li>
</ul>
<p>The second point is the one people forget. A sub-policy has no implicit discard of its own at its end; the discard is the one at the bottom of the main policy. That makes a sub-policy a safe place to put "special cases" without breaking the rest.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Jump into a sub-policy and return">
<rect x="20" y="15" width="280" height="200" rx="10" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy: NK-PUNE</text>
<rect x="35" y="50" width="250" height="30" rx="5" fill="#fff"/><text x="45" y="70" class="svg-ink" font-size="12">1 net-staff to any  DNS (UDP)  Allow</text>
<rect x="35" y="88" width="250" height="30" rx="5" fill="#fff"/><text x="45" y="108" class="svg-ink" font-size="12">2 srv-web to any  DNS (UDP)  Allow</text>
<rect x="35" y="126" width="250" height="30" rx="5" fill="#fde68a"/><text x="45" y="146" class="svg-ink" font-size="12">3 any to net-dmz  any  Jump DMZ-RULES</text>
<rect x="35" y="164" width="250" height="30" rx="5" fill="#fed7aa"/><text x="45" y="184" class="svg-ink" font-size="12">Implicit discard</text>
<rect x="360" y="60" width="260" height="110" rx="10" fill="#bbf7d0"/><text x="490" y="83" text-anchor="middle" class="svg-ink" font-size="14">Sub-policy: DMZ-RULES</text>
<rect x="375" y="95" width="230" height="28" rx="5" fill="#fff"/><text x="385" y="114" class="svg-ink" font-size="12">3.1 net-staff to srv-web HTTPS Allow</text>
<rect x="375" y="128" width="230" height="28" rx="5" fill="#fff"/><text x="385" y="147" class="svg-ink" font-size="12">3.2 any to srv-web SSH Discard</text>
<line x1="285" y1="141" x2="358" y2="125" stroke="#64748b" stroke-width="2"/>
<path d="M 360 163 L 330 175 L 330 179 L 287 179" fill="none" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">No match inside: return to the caller and continue at the next rule</text>
</svg><p class="cap">The Jump is rule 3, so the rules inside the sub-policy are numbered 3.1 and 3.2.</p></div>

<h3>Rule numbers: 3.1, 3.2</h3>
<p>Rules inside a sub-policy are numbered with the parent position first and a dot: <code>3.1</code>, <code>3.2</code>. This lets you read a log line or a counter and know both where the rule lives and which sub-policy it belongs to. Check the exact numbering you see in the console for your lab, because it follows the position the Jump has in the compiled policy.</p>

<h3>Sub-policies cannot hold NAT</h3>
<p>A sub-policy holds Access rules only. NAT rules are not allowed in a sub-policy, so address translation must sit in the main policy's NAT rules. You will see NAT in the next module. For now remember: the sub-policy is for access decisions.</p>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-2</b>: create a sub-policy for the DMZ and call it from the branch policy. The sub-policy has: rule one allows <code>net-staff</code> to <code>srv-web</code> on HTTPS, rule two discards SSH to <code>srv-web</code> from anywhere. The main policy has a Jump for destination <code>net-dmz</code>. STAFF-PC opens HTTPS to 172.16.20.20: the Jump matches, the first sub-rule matches, Allow. STAFF-PC pings 172.16.20.20: the Jump matches, no sub-rule matches, matching returns to the main policy and continues below the Jump. If nothing below allows ICMP, the implicit discard applies.</p></div>

<h3>Checking</h3>
<pre class="out">Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/443
 T1  no
 T2  no
 1   no   (service)
 2   no   (source)
 3   Jump DMZ-RULES
<span class="hl">   3.1  net-staff -&gt; srv-web HTTPS   MATCH   Allow</span>
Result: Allow  (rule 3.1)</pre>

<div class="warn"><p><b>Common mistake.</b> Assuming a sub-policy ends the connection when it has no match. It does not. The engine returns and continues. If your intention is to block everything else for the DMZ, put an explicit Discard as the last rule of the sub-policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Three facts get asked together: Jump enters a sub-policy; no match returns to the caller; a sub-policy cannot contain NAT rules. Also, a Jump rule is only reached if the rules above it did not already decide the connection.</p></div>

<div class="scn"><h4>The DMZ rules that were too tidy</h4><p>Pune's DMZ had a Jump placed below a broad staff Allow, so DMZ traffic from staff matched the broad rule first and the detailed sub-policy rules never counted a hit. The admin saw zero hits on 3.1 and 3.2 in the counters. Moving the Jump above the broad rule and installing made the DMZ rules the decider.</p><p><b>Lesson:</b> a Jump is just a rule; its position still matters.</p></div>
<div class="iv"><p class="q">"What happens when a connection enters a sub-policy and matches nothing?"</p><p>Matching returns to the calling policy and continues from the rule after the Jump. Add that there is no discard inside the sub-policy by default, and that a sub-policy is for Access rules only, not NAT.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A Jump rule sends matching connections into a named sub-policy.</li>
<li>No match inside the sub-policy returns to the caller.</li>
<li>Sub-policy rules are numbered like 3.1, 3.2.</li>
<li>Sub-policies cannot contain NAT rules.</li>
<li>The Jump rule obeys the same top-down order as any rule.</li>
</ul></div>
`,hi:`
<p>Branch policy lambi ho sakti hai. Akele DMZ ko web server ke liye das rules chahiye ho sakte hain, aur unhe staff rules ke saath mix karne se list padhna mushkil ho jata hai. <b>Sub-policy</b> rules ka chhota named group hai jise aap main policy se <b>Jump</b> rule ke through call karte ho.</p>

<h3>Analogy: department desk</h3>
<p>Pune building ke front desk par guard ke paas chhota register hai. Ek line kehti hai: "Server room ke visitors: server-room desk par jao". Server-room desk ka apna register hai jisme detailed rules hain. Agar server-room desk ke paas is visitor ke liye koi rule nahi, to visitor wapas front desk bheja jata hai, jo apni list padhta rehta hai. Jump rule woh line hai, aur sub-policy woh desk.</p>

<h3>Jump kaise kaam karta hai</h3>
<p>Jump rule mein usual match columns hote hain (jaise source any, destination <code>net-dmz</code>, service any) aur action Jump with sub-policy name. Jab connection Jump rule se match hoti hai, engine sub-policy mein ghusta hai aur uske rules upar se neeche padhta hai.</p>
<ul>
<li>Agar sub-policy ke andar koi rule match karta hai, uska action lagta hai aur connection decide ho jati hai.</li>
<li>Agar <b>andar koi rule match nahi karta</b>, to matching <b>calling policy mein wapas</b> aati hai aur Jump ke neeche wale rule se chalti hai.</li>
</ul>
<p>Doosri baat log bhool jaate hain. Sub-policy ke end par apna koi implicit discard nahi hota; discard main policy ke bottom wala hi hai. Isliye "special cases" rakhne ke liye sub-policy safe jagah hai, baaki policy tootti nahi.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Sub-policy mein Jump aur wapsi">
<rect x="20" y="15" width="280" height="200" rx="10" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy: NK-PUNE</text>
<rect x="35" y="50" width="250" height="30" rx="5" fill="#fff"/><text x="45" y="70" class="svg-ink" font-size="12">1 net-staff to any  DNS (UDP)  Allow</text>
<rect x="35" y="88" width="250" height="30" rx="5" fill="#fff"/><text x="45" y="108" class="svg-ink" font-size="12">2 srv-web to any  DNS (UDP)  Allow</text>
<rect x="35" y="126" width="250" height="30" rx="5" fill="#fde68a"/><text x="45" y="146" class="svg-ink" font-size="12">3 any to net-dmz  any  Jump DMZ-RULES</text>
<rect x="35" y="164" width="250" height="30" rx="5" fill="#fed7aa"/><text x="45" y="184" class="svg-ink" font-size="12">Implicit discard</text>
<rect x="360" y="60" width="260" height="110" rx="10" fill="#bbf7d0"/><text x="490" y="83" text-anchor="middle" class="svg-ink" font-size="14">Sub-policy: DMZ-RULES</text>
<rect x="375" y="95" width="230" height="28" rx="5" fill="#fff"/><text x="385" y="114" class="svg-ink" font-size="12">3.1 net-staff to srv-web HTTPS Allow</text>
<rect x="375" y="128" width="230" height="28" rx="5" fill="#fff"/><text x="385" y="147" class="svg-ink" font-size="12">3.2 any to srv-web SSH Discard</text>
<line x1="285" y1="141" x2="358" y2="125" stroke="#64748b" stroke-width="2"/>
<path d="M 360 163 L 330 175 L 330 179 L 287 179" fill="none" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Andar match nahi: caller mein wapas aao aur agle rule se chalo</text>
</svg><p class="cap">Jump rule 3 hai, isliye sub-policy ke andar ke rules 3.1 aur 3.2 number paate hain.</p></div>

<h3>Rule numbers: 3.1, 3.2</h3>
<p>Sub-policy ke rules ka number parent position se shuru hota hai, phir dot: <code>3.1</code>, <code>3.2</code>. Isse log line ya counter padh kar pata chalta hai ki rule kahan rehta hai aur kis sub-policy ka hai. Apne lab mein console jo exact numbering dikhaye woh check karo, kyunki woh compiled policy mein Jump ki position follow karti hai.</p>

<h3>Sub-policies mein NAT nahi ho sakta</h3>
<p>Sub-policy mein sirf Access rules hote hain. NAT rules sub-policy mein allowed nahi hain, isliye address translation main policy ke NAT rules mein rehta hai. NAT aap agle module mein dekhoge. Abhi yaad rakho: sub-policy access decisions ke liye hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-2</b>: DMZ ke liye sub-policy banao aur branch policy se call karo. Sub-policy mein: rule one <code>net-staff</code> ko <code>srv-web</code> par HTTPS allow karta hai, rule two kahin se bhi <code>srv-web</code> par SSH discard karta hai. Main policy mein destination <code>net-dmz</code> ke liye Jump hai. STAFF-PC 172.16.20.20 par HTTPS kholta hai: Jump match, pehla sub-rule match, Allow. STAFF-PC 172.16.20.20 ko ping karta hai: Jump match, koi sub-rule match nahi, matching main policy mein wapas aati hai aur Jump ke neeche chalti hai. Agar neeche kuch ICMP allow nahi karta to implicit discard lagta hai.</p></div>

<h3>Check karna</h3>
<pre class="out">Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/443
 T1  no
 T2  no
 1   no   (service)
 2   no   (source)
 3   Jump DMZ-RULES
<span class="hl">   3.1  net-staff -&gt; srv-web HTTPS   MATCH   Allow</span>
Result: Allow  (rule 3.1)</pre>

<div class="warn"><p><b>Common mistake.</b> Maan lena ki sub-policy mein match na ho to connection khatam ho jati hai. Aisa nahi hai. Engine wapas aata hai aur aage chalta hai. Agar aap DMZ ke liye baaki sab block karna chahte ho, to sub-policy ke last rule mein explicit Discard rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen facts saath mein poochhe jaate hain: Jump sub-policy mein enter karta hai; no match caller mein wapas aata hai; sub-policy mein NAT rules nahi ho sakte. Aur Jump rule tabhi reach hota hai jab upar ke rules ne connection decide nahi ki.</p></div>

<div class="scn"><h4>Zyada hi tidy DMZ rules</h4><p>Pune ke DMZ ka Jump broad staff Allow ke neeche tha, to staff ka DMZ traffic broad rule se pehle match ho jata tha aur detailed sub-policy rules ka koi hit count nahi badhta tha. Admin ne counters mein 3.1 aur 3.2 par zero hits dekhe. Jump ko broad rule ke upar le jaakar install karne se DMZ rules decider ban gaye.</p><p><b>Lesson:</b> Jump bhi ek rule hai; uski position ab bhi matter karti hai.</p></div>
<div class="iv"><p class="q">"Connection sub-policy mein jaaye aur kuch match na ho to kya hota hai?"</p><p>Matching calling policy mein wapas aati hai aur Jump ke baad wale rule se chalti hai. Yeh bhi bolo ki sub-policy ke andar default discard nahi hota, aur sub-policy sirf Access rules ke liye hai, NAT ke liye nahi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jump rule matching connections ko named sub-policy mein bhejta hai.</li>
<li>Sub-policy ke andar no match ka matlab caller mein wapas.</li>
<li>Sub-policy rules ka number 3.1, 3.2 jaisa hota hai.</li>
<li>Sub-policies mein NAT rules nahi ho sakte.</li>
<li>Jump rule bhi kisi aur rule ki tarah top-down order maanta hai.</li>
</ul></div>
`}};export{e as default};